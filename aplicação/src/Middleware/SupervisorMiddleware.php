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
        if (!$currentUser['is_admin'] && !$currentUser['is_supervisor']) {
            Response::error('Acesso negado. Permissão de supervisor necessária.', 403);
        }
    }
}
