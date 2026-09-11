<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\AuditLogRepository;
use App\Helpers\Validator;

/**
 * Serviço de negócio para gestão de Usuários.
 */
final class UserService
{
    private UserRepository $repo;
    private AuditLogRepository $auditRepo;
    private LocalAuthStrategy $authStrategy;

    public function __construct()
    {
        $this->repo         = new UserRepository();
        $this->auditRepo    = new AuditLogRepository();
        $this->authStrategy = new LocalAuthStrategy();
    }

    public function getAll(): array
    {
        return $this->repo->findAll();
    }

    public function getById(int $id): ?array
    {
        return $this->repo->findById($id);
    }

    /**
     * Cria novo usuário local com validações de negócio
     */
    public function create(array $data, int $currentUserId): array
    {
        // Validação
        $validator = new Validator();
        $validator->required($data, ['username', 'display_name', 'email', 'password'])
                  ->email($data, 'email')
                  ->minLength($data, 'password', 8)
                  ->minLength($data, 'username', 3);

        if ($validator->fails()) {
            throw new \InvalidArgumentException(
                json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        // Unicidade
        if ($this->repo->existsByUsername($data['username'])) {
            throw new \InvalidArgumentException('Username já cadastrado.');
        }

        if ($this->repo->existsByEmail($data['email'])) {
            throw new \InvalidArgumentException('Email já cadastrado.');
        }

        // Cria usuário
        $userId = $this->repo->create([
            'username'      => $data['username'],
            'display_name'  => $data['display_name'],
            'email'         => $data['email'],
            'password_hash' => $this->authStrategy->hashPassword($data['password']),
            'auth_provider' => $data['auth_provider'] ?? 'local',
            'is_admin'      => (bool)($data['is_admin'] ?? false),
            'is_supervisor' => (bool)($data['is_supervisor'] ?? false),
            'is_active'     => true,
        ]);

        // Sincroniza grupos (se informados)
        if (!empty($data['group_ids'])) {
            $this->repo->syncGroups($userId, $data['group_ids']);
        }

        // Auditoria
        $this->auditRepo->log($currentUserId, 'create', 'user', $userId);

        return $this->repo->findById($userId);
    }

    /**
     * Atualiza usuário existente
     */
    public function update(int $id, array $data, int $currentUserId): array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Usuário não encontrado.');
        }

        // Validações de unicidade
        if (isset($data['email']) && $this->repo->existsByEmail($data['email'], $id)) {
            throw new \InvalidArgumentException('Email já cadastrado por outro usuário.');
        }

        // Prepara dados de atualização
        $updateData = [];
        foreach (['display_name', 'email', 'is_admin', 'is_supervisor', 'is_active', 'auth_provider'] as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        // Atualiza senha se informada
        if (!empty($data['password'])) {
            $updateData['password_hash'] = $this->authStrategy->hashPassword($data['password']);
        }

        if (!empty($updateData)) {
            $this->repo->update($id, $updateData);
        }

        // Sincroniza grupos
        if (array_key_exists('group_ids', $data)) {
            $this->repo->syncGroups($id, $data['group_ids'] ?? []);
        }

        // Auditoria
        $this->auditRepo->log($currentUserId, 'update', 'user', $id, $existing, $updateData);

        return $this->repo->findById($id);
    }

    /**
     * Desativa usuário (soft delete)
     */
    public function deactivate(int $id, int $currentUserId): bool
    {
        if ($id === $currentUserId) {
            throw new \RuntimeException('Você não pode desativar sua própria conta.');
        }

        $result = $this->repo->deactivate($id);
        $this->auditRepo->log($currentUserId, 'delete', 'user', $id);

        return $result;
    }

    /**
     * Importa usuários via CSV
     * Formato: username,display_name,email,password,is_admin,is_supervisor,group_ids
     */
    public function importCsv(string $csvContent, int $currentUserId): array
    {
        $lines = array_filter(explode("\n", trim($csvContent)));
        $header = str_getcsv(array_shift($lines));

        $imported = 0;
        $errors = [];

        foreach ($lines as $index => $line) {
            $row = str_getcsv($line);
            $data = array_combine($header, $row);

            if ($data === false) {
                $errors[] = "Linha " . ($index + 2) . ": formato inválido.";
                continue;
            }

            try {
                if (isset($data['group_ids'])) {
                    $data['group_ids'] = array_map('intval', explode(';', $data['group_ids']));
                }
                $this->create($data, $currentUserId);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Linha " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'errors'   => $errors,
            'total'    => count($lines),
        ];
    }
}
