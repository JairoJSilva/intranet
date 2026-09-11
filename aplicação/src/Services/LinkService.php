<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\LinkRepository;
use App\Repositories\AuditLogRepository;
use App\Helpers\Validator;

/**
 * Serviço de negócio para gestão de Links.
 */
final class LinkService
{
    private LinkRepository $repo;
    private AuditLogRepository $auditRepo;

    public function __construct()
    {
        $this->repo      = new LinkRepository();
        $this->auditRepo = new AuditLogRepository();
    }

    public function getByPanelId(int $panelId): array
    {
        return $this->repo->findByPanelId($panelId);
    }

    public function getById(int $id): ?array
    {
        return $this->repo->findById($id);
    }

    public function create(array $data, int $currentUserId): array
    {
        if (!empty($data['url']) && is_string($data['url'])) {
            $data['url'] = trim($data['url']);
            if (!preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $data['url'])) {
                $data['url'] = 'https://' . $data['url'];
            }
        }

        $validator = new Validator();
        $validator->required($data, ['panel_id', 'title', 'url'])
                  ->url($data, 'url')
                  ->positiveInt($data, 'panel_id');

        if ($validator->fails()) {
            throw new \InvalidArgumentException(
                json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        $linkId = $this->repo->create($data);
        $this->auditRepo->log($currentUserId, 'create', 'link', $linkId);

        return $this->repo->findById($linkId);
    }

    public function update(int $id, array $data, int $currentUserId): array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Link não encontrado.');
        }

        if (isset($data['url']) && is_string($data['url'])) {
            $data['url'] = trim($data['url']);
            if (!preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $data['url'])) {
                $data['url'] = 'https://' . $data['url'];
            }

            $validator = new Validator();
            $validator->url($data, 'url');
            if ($validator->fails()) {
                throw new \InvalidArgumentException(
                    json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
                );
            }
        }

        $this->repo->update($id, $data);
        $this->auditRepo->log($currentUserId, 'update', 'link', $id);

        return $this->repo->findById($id);
    }

    public function delete(int $id, int $currentUserId): bool
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Link não encontrado.');
        }

        $result = $this->repo->delete($id);
        $this->auditRepo->log($currentUserId, 'delete', 'link', $id, $existing);

        return $result;
    }

    /**
     * Retorna estatísticas de status dos links
     */
    public function getStatusStats(): array
    {
        return $this->repo->countByStatus();
    }
}
