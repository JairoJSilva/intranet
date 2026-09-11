<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\GroupRepository;
use App\Repositories\AuditLogRepository;
use App\Helpers\Validator;

/**
 * Serviço de negócio para gestão de Grupos/Setores.
 */
final class GroupService
{
    private GroupRepository $repo;
    private AuditLogRepository $auditRepo;

    public function __construct()
    {
        $this->repo      = new GroupRepository();
        $this->auditRepo = new AuditLogRepository();
    }

    public function getAll(): array
    {
        return $this->repo->findAll();
    }

    public function getById(int $id): ?array
    {
        $group = $this->repo->findById($id);
        if ($group) {
            $group['members'] = $this->repo->getMembers($id);
        }
        return $group;
    }

    public function create(array $data, int $currentUserId): array
    {
        $validator = new Validator();
        $validator->required($data, ['name'])
                  ->minLength($data, 'name', 2)
                  ->maxLength($data, 'name', 150);

        if ($validator->fails()) {
            throw new \InvalidArgumentException(
                json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        if ($this->repo->existsByName($data['name'])) {
            throw new \InvalidArgumentException('Já existe um grupo com esse nome.');
        }

        $data['slug'] = $this->slugify($data['name']);

        $groupId = $this->repo->create($data);

        // Sincroniza painéis se informados
        if (!empty($data['panel_ids'])) {
            $this->repo->syncPanels($groupId, $data['panel_ids']);
        }

        $this->auditRepo->log($currentUserId, 'create', 'group', $groupId);

        return $this->repo->findById($groupId);
    }

    public function update(int $id, array $data, int $currentUserId): array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Grupo não encontrado.');
        }

        if (isset($data['name'])) {
            if ($this->repo->existsByName($data['name'], $id)) {
                throw new \InvalidArgumentException('Já existe outro grupo com esse nome.');
            }
            $data['slug'] = $this->slugify($data['name']);
        }

        $this->repo->update($id, $data);

        if (array_key_exists('panel_ids', $data)) {
            $this->repo->syncPanels($id, $data['panel_ids'] ?? []);
        }

        $this->auditRepo->log($currentUserId, 'update', 'group', $id);

        return $this->repo->findById($id);
    }

    public function delete(int $id, int $currentUserId): bool
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Grupo não encontrado.');
        }

        $result = $this->repo->delete($id);
        $this->auditRepo->log($currentUserId, 'delete', 'group', $id, $existing);

        return $result;
    }

    private function slugify(string $text): string
    {
        $text = mb_strtolower($text, 'UTF-8');
        $transliterated = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text) ?: $text;
        $text = preg_replace('/[^a-z0-9\s-]/', '', $transliterated);
        $text = preg_replace('/[\s-]+/', '-', $text);
        return trim($text, '-');
    }
}
