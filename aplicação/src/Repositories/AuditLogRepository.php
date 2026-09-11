<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;
use App\Config\Database;

/**
 * Repository para registro de ações de auditoria.
 */
final class AuditLogRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Registra uma ação de auditoria
     */
    public function log(
        ?int $userId,
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        $stmt = $this->db->prepare(
            "INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
             VALUES (:user_id, :action, :entity_type, :entity_id, :old_values, :new_values, :ip_address, :user_agent)"
        );

        $stmt->execute([
            ':user_id'     => $userId,
            ':action'      => $action,
            ':entity_type' => $entityType,
            ':entity_id'   => $entityId,
            ':old_values'  => $oldValues ? json_encode($oldValues, JSON_UNESCAPED_UNICODE) : null,
            ':new_values'  => $newValues ? json_encode($newValues, JSON_UNESCAPED_UNICODE) : null,
            ':ip_address'  => $_SERVER['REMOTE_ADDR'] ?? null,
            ':user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? null,
        ]);
    }

    /**
     * Busca últimas ações (para dashboard)
     */
    public function getRecent(int $limit = 20): array
    {
        $stmt = $this->db->prepare(
            "SELECT al.*, u.display_name as user_name
             FROM audit_log al
             LEFT JOIN users u ON u.id = al.user_id
             ORDER BY al.created_at DESC
             LIMIT :limit"
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
