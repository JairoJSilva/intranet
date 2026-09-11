<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;

/**
 * Middleware de autorização para Supervisores.
 * Requer que o usuário tenha is_supervisor = true OU is_admin = true.
 * Admins possuem bypass global (superset de supervisor).
 */
final class SupervisorMiddleware
{
    /**
     * Verifica se o usuário tem permissão de escrita (supervisor ou admin).
     */
    public static function handle(array $currentUser): void
    {
        if (!empty($currentUser['is_admin']) || !empty($currentUser['is_supervisor'])) {
            return;
        }

        try {
            $db = \App\Config\Database::getInstance();
            $stmt = $db->prepare("
                SELECT COUNT(*) FROM user_groups 
                WHERE user_id = :user_id 
                  AND (can_manage_links = 1 OR role IN ('supervisor', 'admin'))
            ");
            $stmt->execute([':user_id' => (int)$currentUser['id']]);
            if ((int)$stmt->fetchColumn() > 0) {
                return;
            }
        } catch (\Throwable $e) {
            // Fallback para negação segura se tabela ou banco falhar
        }

        Response::error('Acesso negado. Permissão de supervisor necessária.', 403);
    }
}
