<?php
declare(strict_types=1);

namespace App\Services;

use App\Helpers\Validator;
use App\Repositories\NoticeRepository;
use App\Repositories\AuditLogRepository;

final class NoticeService
{
    private NoticeRepository $repo;
    private AuditLogRepository $auditRepo;

    public function __construct()
    {
        $this->repo = new NoticeRepository();
        $this->auditRepo = new AuditLogRepository();
    }

    /**
     * Retorna avisos ativos para o banner
     */
    public function getActive(): array
    {
        return $this->repo->findActive();
    }

    /**
     * Retorna todos os avisos para administração
     */
    public function getAll(): array
    {
        return $this->repo->findAll();
    }

    /**
     * Busca por ID
     */
    public function getById(int $id): ?array
    {
        return $this->repo->findById($id);
    }

    /**
     * Cadastra um novo aviso / manutenção programada
     */
    public function create(array $data, int $userId): array
    {
        $validator = new Validator();
        $validator->required($data, ['title', 'message']);

        if ($validator->fails()) {
            throw new \InvalidArgumentException(
                json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        $type = $data['type'] ?? 'info';
        if (!in_array($type, ['info', 'warning', 'critical'], true)) {
            throw new \InvalidArgumentException('Tipo de aviso inválido. Use info, warning ou critical.');
        }

        $data['created_by'] = $userId;
        $noticeId = $this->repo->create($data);

        $this->auditRepo->log($userId, 'create', 'notice', $noticeId, null, $data);

        return $this->repo->findById($noticeId);
    }

    /**
     * Atualiza um aviso existente
     */
    public function update(int $id, array $data, int $userId): array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Aviso não encontrado.');
        }

        if (isset($data['type']) && !in_array($data['type'], ['info', 'warning', 'critical'], true)) {
            throw new \InvalidArgumentException('Tipo de aviso inválido. Use info, warning ou critical.');
        }

        $this->repo->update($id, $data);
        $this->auditRepo->log($userId, 'update', 'notice', $id, $existing, $data);

        return $this->repo->findById($id);
    }

    /**
     * Remove um aviso
     */
    public function delete(int $id, int $userId): bool
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Aviso não encontrado.');
        }

        $result = $this->repo->delete($id);
        $this->auditRepo->log($userId, 'delete', 'notice', $id, $existing);

        return $result;
    }
}
