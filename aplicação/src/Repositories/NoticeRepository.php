<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;
use App\Config\Database;

final class NoticeRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->ensureTableExists();
    }

    /**
     * Garante de forma idempotente que a tabela notices exista no MySQL
     */
    public function ensureTableExists(): void
    {
        $sql = "CREATE TABLE IF NOT EXISTS `notices` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `title` VARCHAR(255) NOT NULL,
            `message` TEXT NOT NULL,
            `type` ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
            `link_url` VARCHAR(2048) NULL,
            `link_text` VARCHAR(100) NULL,
            `starts_at` DATETIME NULL,
            `expires_at` DATETIME NULL,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_by` INT UNSIGNED NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_notices_active` (`is_active`, `starts_at`, `expires_at`),
            CONSTRAINT `fk_notices_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

        $this->db->exec($sql);

        // Se a tabela estiver vazia, cria um aviso inicial de boas-vindas / manutenção programada
        $count = (int)$this->db->query("SELECT COUNT(*) FROM `notices`")->fetchColumn();
        if ($count === 0) {
            $stmt = $this->db->prepare("
                INSERT INTO `notices` (`title`, `message`, `type`, `link_url`, `link_text`, `is_active`, `created_by`, `starts_at`, `expires_at`)
                VALUES (:title, :message, :type, :link_url, :link_text, 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))
            ");
            $stmt->execute([
                ':title'     => 'Janela de Manutenção Programada — Infraestrutura TIC',
                ':message'   => 'Informamos que no próximo sábado, entre 22h00 e 02h00, realizaremos uma atualização programada nos nós centrais. Todos os serviços essenciais permanecerão em redundância.',
                ':type'      => 'warning',
                ':link_url'  => 'https://status.flowti.com.br',
                ':link_text' => 'Acompanhar Status',
            ]);
        }
    }

    /**
     * Retorna avisos ativos e em período de vigência
     */
    public function findActive(): array
    {
        $stmt = $this->db->query("
            SELECT n.*, u.display_name as author_name
            FROM `notices` n
            LEFT JOIN `users` u ON u.id = n.created_by
            WHERE n.is_active = 1
              AND (n.starts_at IS NULL OR n.starts_at <= NOW())
              AND (n.expires_at IS NULL OR n.expires_at >= NOW())
            ORDER BY FIELD(n.type, 'critical', 'warning', 'info'), n.id DESC
        ");
        return $stmt->fetchAll();
    }

    /**
     * Retorna todos os avisos cadastrados (para gestão)
     */
    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT n.*, u.display_name as author_name
            FROM `notices` n
            LEFT JOIN `users` u ON u.id = n.created_by
            ORDER BY n.id DESC
        ");
        return $stmt->fetchAll();
    }

    /**
     * Busca aviso por ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT n.*, u.display_name as author_name
            FROM `notices` n
            LEFT JOIN `users` u ON u.id = n.created_by
            WHERE n.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Cria novo aviso
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO `notices` (title, message, type, link_url, link_text, starts_at, expires_at, is_active, created_by)
            VALUES (:title, :message, :type, :link_url, :link_text, :starts_at, :expires_at, :is_active, :created_by)
        ");

        $stmt->execute([
            ':title'      => $data['title'],
            ':message'    => $data['message'],
            ':type'       => $data['type'] ?? 'info',
            ':link_url'   => !empty($data['link_url']) ? $data['link_url'] : null,
            ':link_text'  => !empty($data['link_text']) ? $data['link_text'] : null,
            ':starts_at'  => !empty($data['starts_at']) ? $data['starts_at'] : date('Y-m-d H:i:s'),
            ':expires_at' => !empty($data['expires_at']) ? $data['expires_at'] : null,
            ':is_active'  => isset($data['is_active']) ? (int)(bool)$data['is_active'] : 1,
            ':created_by' => $data['created_by'] ?? null,
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Atualiza um aviso existente
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowed = ['title', 'message', 'type', 'link_url', 'link_text', 'starts_at', 'expires_at', 'is_active'];

        foreach ($allowed as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "`{$col}` = :{$col}";
                $val = $data[$col];
                if ($col === 'is_active') {
                    $val = (int)(bool)$val;
                }
                $params[":{$col}"] = ($val === '' ? null : $val);
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE `notices` SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Remove um aviso
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM `notices` WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
