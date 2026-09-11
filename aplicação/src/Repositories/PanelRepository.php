<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;
use App\Config\Database;

/**
 * Repository para operações de dados da entidade Panel.
 */
final class PanelRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Busca todos os painéis
     */
    public function findAll(): array
    {
        $stmt = $this->db->query(
            "SELECT p.*, 
                    (SELECT COUNT(*) FROM links l WHERE l.panel_id = p.id AND l.is_active = 1) as link_count
             FROM panels p
             WHERE p.is_active = 1
             ORDER BY p.sort_order ASC, p.title ASC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Busca painéis acessíveis por um conjunto de grupo IDs (RBAC)
     */
    public function findByGroupIds(array $groupIds): array
    {
        if (empty($groupIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($groupIds), '?'));

        $stmt = $this->db->prepare(
            "SELECT DISTINCT p.*, 
                    (SELECT COUNT(*) FROM links l WHERE l.panel_id = p.id AND l.is_active = 1) as link_count
             FROM panels p
             INNER JOIN group_panels gp ON gp.panel_id = p.id
             WHERE gp.group_id IN ({$placeholders}) AND p.is_active = 1
             ORDER BY p.sort_order ASC, p.title ASC"
        );

        $stmt->execute(array_map('intval', $groupIds));
        return $stmt->fetchAll();
    }

    /**
     * Busca painel por ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT p.*, 
                    (SELECT COUNT(*) FROM links l WHERE l.panel_id = p.id AND l.is_active = 1) as link_count
             FROM panels p WHERE p.id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Cria novo painel
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO panels (title, description, icon, sort_order, is_active)
             VALUES (:title, :description, :icon, :sort_order, :is_active)"
        );

        $stmt->execute([
            ':title'       => $data['title'],
            ':description' => $data['description'] ?? null,
            ':icon'        => $data['icon'] ?? 'ri-dashboard-line',
            ':sort_order'  => (int)($data['sort_order'] ?? 0),
            ':is_active'   => (int)($data['is_active'] ?? true),
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Atualiza painel
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        foreach (['title', 'description', 'icon', 'sort_order', 'is_active'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $value = $data[$field];
                if (in_array($field, ['sort_order', 'is_active'])) {
                    $value = (int)$value;
                }
                $params[":{$field}"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE panels SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Remove painel (cascade deleta links e group_panels)
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM panels WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Retorna os grupos associados a um painel
     */
    public function getPanelGroups(int $panelId): array
    {
        $stmt = $this->db->prepare(
            "SELECT g.id, g.name, g.slug, g.icon, g.color
             FROM `groups` g
             INNER JOIN group_panels gp ON gp.group_id = g.id
             WHERE gp.panel_id = :panel_id
             ORDER BY g.name ASC"
        );
        $stmt->execute([':panel_id' => $panelId]);
        return $stmt->fetchAll();
    }

    /**
     * Verifica se um painel pertence a algum dos grupos informados
     */
    public function belongsToGroups(int $panelId, array $groupIds): bool
    {
        if (empty($groupIds)) {
            return false;
        }

        $placeholders = implode(',', array_fill(0, count($groupIds), '?'));
        $params = array_merge([$panelId], array_map('intval', $groupIds));

        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM group_panels 
             WHERE panel_id = ? AND group_id IN ({$placeholders})"
        );
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    /**
     * Contagem total de painéis ativos
     */
    public function countActive(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) FROM panels WHERE is_active = 1");
        return (int)$stmt->fetchColumn();
    }

    /**
     * Atualiza a ordenação em lote dos painéis
     * @param int[] $orderedIds
     */
    public function reorder(array $orderedIds): bool
    {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("UPDATE panels SET sort_order = :order WHERE id = :id");
            foreach ($orderedIds as $index => $id) {
                $stmt->execute([
                    ':order' => (int)$index + 1,
                    ':id'    => (int)$id,
                ]);
            }
            $this->db->commit();
            return true;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
