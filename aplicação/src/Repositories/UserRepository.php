<?php
declare(strict_types=1);

namespace App\Repositories;

use PDO;
use App\Config\Database;

/**
 * Repository para operações de dados da entidade User.
 * Todas as queries utilizam Prepared Statements via PDO.
 */
final class UserRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Busca todos os usuários com seus grupos
     */
    public function findAll(): array
    {
        $stmt = $this->db->query(
            "SELECT u.id, u.username, u.display_name, u.email, u.auth_provider,
                    u.is_admin, u.is_supervisor, u.is_active, u.avatar_url,
                    u.last_login_at, u.created_at, u.updated_at
             FROM users u
             ORDER BY u.display_name ASC"
        );
        $users = $stmt->fetchAll();

        // Adiciona grupos de cada usuário
        foreach ($users as &$user) {
            $user['groups'] = $this->getUserGroups((int)$user['id']);
            $user['is_admin'] = (bool)$user['is_admin'];
            $user['is_supervisor'] = (bool)$user['is_supervisor'];
            $user['is_active'] = (bool)$user['is_active'];
        }

        return $users;
    }

    /**
     * Busca usuário por ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT u.id, u.username, u.display_name, u.email, u.auth_provider,
                    u.is_admin, u.is_supervisor, u.is_active, u.avatar_url,
                    u.last_login_at, u.created_at, u.updated_at
             FROM users u WHERE u.id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        $user['groups'] = $this->getUserGroups((int)$user['id']);
        $user['is_admin'] = (bool)$user['is_admin'];
        $user['is_supervisor'] = (bool)$user['is_supervisor'];
        $user['is_active'] = (bool)$user['is_active'];

        return $user;
    }

    /**
     * Busca usuário por username (para login)
     */
    public function findByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, username, display_name, email, password_hash, auth_provider,
                    is_admin, is_supervisor, is_active, avatar_url
             FROM users WHERE username = :username LIMIT 1"
        );
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        $user['is_admin'] = (bool)$user['is_admin'];
        $user['is_supervisor'] = (bool)$user['is_supervisor'];
        $user['is_active'] = (bool)$user['is_active'];

        return $user;
    }

    /**
     * Busca usuário por email
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, username, display_name, email, auth_provider,
                    is_admin, is_supervisor, is_active
             FROM users WHERE email = :email LIMIT 1"
        );
        $stmt->execute([':email' => $email]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Verifica se username já existe
     */
    public function existsByUsername(string $username, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM users WHERE username = :username";
        $params = [':username' => $username];

        if ($excludeId !== null) {
            $sql .= " AND id != :id";
            $params[':id'] = $excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    /**
     * Verifica se email já existe
     */
    public function existsByEmail(string $email, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM users WHERE email = :email";
        $params = [':email' => $email];

        if ($excludeId !== null) {
            $sql .= " AND id != :id";
            $params[':id'] = $excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    /**
     * Cria novo usuário
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (username, display_name, email, password_hash, auth_provider,
                               is_admin, is_supervisor, is_active)
             VALUES (:username, :display_name, :email, :password_hash, :auth_provider,
                     :is_admin, :is_supervisor, :is_active)"
        );

        $stmt->execute([
            ':username'      => $data['username'],
            ':display_name'  => $data['display_name'],
            ':email'         => $data['email'],
            ':password_hash' => $data['password_hash'] ?? null,
            ':auth_provider' => $data['auth_provider'] ?? 'local',
            ':is_admin'      => (int)($data['is_admin'] ?? false),
            ':is_supervisor' => (int)($data['is_supervisor'] ?? false),
            ':is_active'     => (int)($data['is_active'] ?? true),
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Atualiza dados do usuário
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowedFields = [
            'display_name', 'email', 'password_hash', 'auth_provider',
            'is_admin', 'is_supervisor', 'is_active', 'avatar_url'
        ];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $value = $data[$field];

                // Converte booleans para int
                if (in_array($field, ['is_admin', 'is_supervisor', 'is_active'])) {
                    $value = (int)$value;
                }

                $params[":{$field}"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Desativa usuário (soft delete)
     */
    public function deactivate(int $id): bool
    {
        $stmt = $this->db->prepare("UPDATE users SET is_active = 0 WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Atualiza data do último login
     */
    public function updateLastLogin(int $id): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET last_login_at = NOW() WHERE id = :id"
        );
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Sincroniza grupos do usuário (remove todos e reassocia)
     */
    public function syncGroups(int $userId, array $groupIds): void
    {
        $this->db->beginTransaction();

        try {
            // Remove associações atuais
            $stmt = $this->db->prepare("DELETE FROM user_groups WHERE user_id = :user_id");
            $stmt->execute([':user_id' => $userId]);

            // Insere novas associações
            if (!empty($groupIds)) {
                $stmt = $this->db->prepare(
                    "INSERT INTO user_groups (user_id, group_id) VALUES (:user_id, :group_id)"
                );

                foreach ($groupIds as $groupId) {
                    $stmt->execute([
                        ':user_id'  => $userId,
                        ':group_id' => (int)$groupId,
                    ]);
                }
            }

            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Retorna os grupos de um usuário
     */
    public function getUserGroups(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT g.id, g.name, g.slug, g.icon, g.color
             FROM `groups` g
             INNER JOIN user_groups ug ON ug.group_id = g.id
             WHERE ug.user_id = :user_id AND g.is_active = 1
             ORDER BY g.name ASC"
        );
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    /**
     * Contagem total de usuários ativos
     */
    public function countActive(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) FROM users WHERE is_active = 1");
        return (int)$stmt->fetchColumn();
    }
}
