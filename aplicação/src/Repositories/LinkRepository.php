<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;
use App\Config\Database;

/**
 * Repository para operações de dados da entidade Link.
 */
final class LinkRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Busca todos os links de um painel
     */
    public function findByPanelId(int $panelId): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM links 
             WHERE panel_id = :panel_id AND is_active = 1
             ORDER BY sort_order ASC, title ASC"
        );
        $stmt->execute([':panel_id' => $panelId]);
        return $stmt->fetchAll();
    }

    /**
     * Busca todos os links ativos (para health check em batch)
     */
    public function findAllActive(): array
    {
        $stmt = $this->db->query(
            "SELECT id, url, title, health_status, response_time_ms, last_check_at
             FROM links WHERE is_active = 1
             ORDER BY id ASC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Busca link por ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM links WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Cria novo link
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO links (panel_id, title, url, description, icon, sort_order, is_active)
             VALUES (:panel_id, :title, :url, :description, :icon, :sort_order, :is_active)"
        );

        $stmt->execute([
            ':panel_id'    => (int)$data['panel_id'],
            ':title'       => $data['title'],
            ':url'         => $data['url'],
            ':description' => $data['description'] ?? null,
            ':icon'        => $data['icon'] ?? 'ri-links-line',
            ':sort_order'  => (int)($data['sort_order'] ?? 0),
            ':is_active'   => (int)($data['is_active'] ?? true),
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Atualiza link
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowedFields = ['panel_id', 'title', 'url', 'description', 'icon', 'sort_order', 'is_active'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $value = $data[$field];
                if (in_array($field, ['panel_id', 'sort_order', 'is_active'])) {
                    $value = (int)$value;
                }
                $params[":{$field}"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE links SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Remove link
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM links WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Atualiza status de health check de um link
     */
    public function updateHealthStatus(int $id, string $status, ?int $responseTimeMs): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE links SET health_status = :status, response_time_ms = :response_time,
                              last_check_at = NOW()
             WHERE id = :id"
        );
        return $stmt->execute([
            ':id'            => $id,
            ':status'        => $status,
            ':response_time' => $responseTimeMs,
        ]);
    }

    /**
     * Contagem de links por status
     */
    public function countByStatus(): array
    {
        $stmt = $this->db->query(
            "SELECT health_status, COUNT(*) as count
             FROM links WHERE is_active = 1
             GROUP BY health_status"
        );
        $rows = $stmt->fetchAll();

        $result = ['online' => 0, 'warning' => 0, 'offline' => 0, 'unknown' => 0, 'total' => 0];
        foreach ($rows as $row) {
            $result[$row['health_status']] = (int)$row['count'];
            $result['total'] += (int)$row['count'];
        }

        return $result;
    }

    /**
     * Contagem total de links ativos
     */
    public function countActive(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) FROM links WHERE is_active = 1");
        return (int)$stmt->fetchColumn();
    }
}
