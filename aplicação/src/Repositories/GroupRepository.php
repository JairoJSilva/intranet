<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;
use App\Config\Database;

/**
 * Repository para operações de dados da entidade Group.
 */
final class GroupRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Busca todos os grupos ativos com contagem de membros
     */
    public function findAll(): array
    {
        $stmt = $this->db->query(
            "SELECT g.*, 
                    (SELECT COUNT(*) FROM user_groups ug WHERE ug.group_id = g.id) as member_count,
                    (SELECT COUNT(*) FROM group_panels gp WHERE gp.group_id = g.id) as panel_count
             FROM `groups` g
             ORDER BY g.name ASC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Busca grupo por ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT g.*, 
                    (SELECT COUNT(*) FROM user_groups ug WHERE ug.group_id = g.id) as member_count
             FROM `groups` g WHERE g.id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Busca grupo por slug
     */
    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM `groups` WHERE slug = :slug LIMIT 1"
        );
        $stmt->execute([':slug' => $slug]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Verifica se nome de grupo já existe
     */
    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM `groups` WHERE name = :name";
        $params = [':name' => $name];

        if ($excludeId !== null) {
            $sql .= " AND id != :id";
            $params[':id'] = $excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    /**
     * Cria novo grupo
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO `groups` (name, slug, description, icon, color, is_active)
             VALUES (:name, :slug, :description, :icon, :color, :is_active)"
        );

        $stmt->execute([
            ':name'        => $data['name'],
            ':slug'        => $data['slug'],
            ':description' => $data['description'] ?? null,
            ':icon'        => $data['icon'] ?? 'ri-group-line',
            ':color'       => $data['color'] ?? '#0165aa',
            ':is_active'   => (int)($data['is_active'] ?? true),
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Atualiza grupo
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        foreach (['name', 'slug', 'description', 'icon', 'color', 'is_active'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[":{$field}"] = $field === 'is_active' ? (int)$data[$field] : $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE `groups` SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Remove grupo (cascade deleta user_groups e group_panels)
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `groups` WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Retorna os IDs dos grupos de um usuário
     */
    public function getGroupIdsByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT group_id FROM user_groups WHERE user_id = :user_id"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Retorna membros de um grupo com suas permissões específicas
     */
    public function getMembers(int $groupId): array
    {
        $stmt = $this->db->prepare(
            "SELECT u.id, u.username, u.display_name, u.email, u.is_admin, u.is_supervisor,
                    ug.role, ug.can_manage_links, ug.can_manage_members
             FROM users u
             INNER JOIN user_groups ug ON ug.user_id = u.id
             WHERE ug.group_id = :group_id AND u.is_active = 1
             ORDER BY u.display_name ASC"
        );
        $stmt->execute([':group_id' => $groupId]);
        $members = $stmt->fetchAll();

        foreach ($members as &$member) {
            $member['id'] = (int)$member['id'];
            $member['is_admin'] = (bool)$member['is_admin'];
            $member['is_supervisor'] = (bool)$member['is_supervisor'];
            $member['role'] = $member['role'] ?? 'member';
            $member['can_manage_links'] = (bool)($member['can_manage_links'] ?? false);
            $member['can_manage_members'] = (bool)($member['can_manage_members'] ?? false);
        }

        return $members;
    }

    /**
     * Atualiza ou define permissões de um membro específico no grupo
     */
    public function updateMember(int $groupId, int $userId, array $data): bool
    {
        $role = in_array($data['role'] ?? 'member', ['member', 'supervisor', 'admin']) ? $data['role'] : 'member';
        $canLinks = !empty($data['can_manage_links']) ? 1 : 0;
        $canMembers = !empty($data['can_manage_members']) ? 1 : 0;

        $stmt = $this->db->prepare(
            "INSERT INTO user_groups (user_id, group_id, role, can_manage_links, can_manage_members)
             VALUES (:user_id, :group_id, :role, :can_manage_links, :can_manage_members)
             ON DUPLICATE KEY UPDATE 
                role = VALUES(role),
                can_manage_links = VALUES(can_manage_links),
                can_manage_members = VALUES(can_manage_members)"
        );
        return $stmt->execute([
            ':user_id'            => $userId,
            ':group_id'           => $groupId,
            ':role'               => $role,
            ':can_manage_links'   => $canLinks,
            ':can_manage_members' => $canMembers,
        ]);
    }

    /**
     * Remove membro do grupo
     */
    public function removeMember(int $groupId, int $userId): bool
    {
        $stmt = $this->db->prepare("DELETE FROM user_groups WHERE group_id = :group_id AND user_id = :user_id");
        return $stmt->execute([':group_id' => $groupId, ':user_id' => $userId]);
    }

    /**
     * Sincroniza painéis do grupo
     */
    public function syncPanels(int $groupId, array $panelIds): void
    {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("DELETE FROM group_panels WHERE group_id = :group_id");
            $stmt->execute([':group_id' => $groupId]);

            if (!empty($panelIds)) {
                $stmt = $this->db->prepare(
                    "INSERT INTO group_panels (group_id, panel_id) VALUES (:group_id, :panel_id)"
                );
                foreach ($panelIds as $panelId) {
                    $stmt->execute([':group_id' => $groupId, ':panel_id' => (int)$panelId]);
                }
            }

            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
