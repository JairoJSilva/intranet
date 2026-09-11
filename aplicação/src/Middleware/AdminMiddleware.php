<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;

/**
 * Middleware de autorização para Administradores.
 * Requer que o usuário tenha is_admin = true.
 */
final class AdminMiddleware
{
    /**
     * Verifica se o usuário autenticado é administrador.
     */
    public static function handle(array $currentUser): void
    {
        if (!$currentUser['is_admin']) {
            Response::error('Acesso negado. Permissão de administrador necessária.', 403);
        }
    }
}
