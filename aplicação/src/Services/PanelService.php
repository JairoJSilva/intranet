<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\PanelRepository;
use App\Repositories\GroupRepository;
use App\Repositories\AuditLogRepository;
use App\Helpers\Validator;

/**
 * Serviço de negócio para gestão de Painéis.
 * Respeita RBAC: admin vê tudo, demais veem apenas painéis dos seus grupos.
 */
final class PanelService
{
    private PanelRepository $repo;
    private GroupRepository $groupRepo;
    private AuditLogRepository $auditRepo;

    public function __construct()
    {
        $this->repo      = new PanelRepository();
        $this->groupRepo = new GroupRepository();
        $this->auditRepo = new AuditLogRepository();
    }

    /**
     * Retorna painéis filtrados por RBAC do usuário
     */
    public function getForUser(array $currentUser): array
    {
        if ($currentUser['is_admin']) {
            // Admin: bypass global — vê todos os painéis
            return $this->repo->findAll();
        }

        // Demais: apenas painéis dos seus grupos
        $groupIds = $this->groupRepo->getGroupIdsByUser($currentUser['id']);
        return $this->repo->findByGroupIds($groupIds);
    }

    public function getById(int $id): ?array
    {
        $panel = $this->repo->findById($id);
        if ($panel) {
            $panel['groups'] = $this->repo->getPanelGroups($id);
        }
        return $panel;
    }

    /**
     * Cria painel (supervisor pode criar nos seus grupos, admin em qualquer)
     */
    public function create(array $data, array $currentUser): array
    {
        $validator = new Validator();
        $validator->required($data, ['title']);

        if ($validator->fails()) {
            throw new \InvalidArgumentException(
                json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        // Supervisor: valida que os group_ids informados pertencem aos seus grupos
        if (!$currentUser['is_admin'] && $currentUser['is_supervisor']) {
            $userGroupIds = $this->groupRepo->getGroupIdsByUser($currentUser['id']);
            $requestedGroupIds = $data['group_ids'] ?? [];

            foreach ($requestedGroupIds as $gid) {
                if (!in_array((int)$gid, array_map('intval', $userGroupIds))) {
                    throw new \RuntimeException('Você não tem permissão para associar painéis a grupos fora do seu setor.');
                }
            }
        }

        $panelId = $this->repo->create($data);

        // Associa aos grupos
        if (!empty($data['group_ids'])) {
            foreach ($data['group_ids'] as $groupId) {
                $this->groupRepo->syncPanels((int)$groupId, 
                    array_merge(
                        array_column($this->repo->getPanelGroups((int)$groupId) ?: [], 'id'),
                        [$panelId]
                    )
                );
            }
        }

        $this->auditRepo->log($currentUser['id'], 'create', 'panel', $panelId);

        return $this->repo->findById($panelId);
    }

    public function update(int $id, array $data, array $currentUser): array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Painel não encontrado.');
        }

        // Supervisor: valida permissão sobre o painel
        if (!$currentUser['is_admin'] && $currentUser['is_supervisor']) {
            $userGroupIds = $this->groupRepo->getGroupIdsByUser($currentUser['id']);
            if (!$this->repo->belongsToGroups($id, $userGroupIds)) {
                throw new \RuntimeException('Você não tem permissão para editar painéis fora do seu setor.');
            }
        }

        $this->repo->update($id, $data);
        $this->auditRepo->log($currentUser['id'], 'update', 'panel', $id);

        return $this->repo->findById($id);
    }

    public function delete(int $id, array $currentUser): bool
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Painel não encontrado.');
        }

        // Supervisor: valida permissão
        if (!$currentUser['is_admin'] && $currentUser['is_supervisor']) {
            $userGroupIds = $this->groupRepo->getGroupIdsByUser($currentUser['id']);
            if (!$this->repo->belongsToGroups($id, $userGroupIds)) {
                throw new \RuntimeException('Você não tem permissão para remover painéis fora do seu setor.');
            }
        }

        $result = $this->repo->delete($id);
        $this->auditRepo->log($currentUser['id'], 'delete', 'panel', $id, $existing);

        return $result;
    }
}
