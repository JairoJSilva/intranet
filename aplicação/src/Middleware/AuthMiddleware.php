<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;

/**
 * Middleware de autenticação.
 * Valida se existe sessão ativa com user_id.
 */
final class AuthMiddleware
{
    /**
     * Verifica se o usuário está autenticado.
     * Retorna os dados do usuário na sessão ou encerra com 401.
     */
    public static function handle(): array
    {
        if (empty($_SESSION['user_id'])) {
            Response::error('Não autenticado. Faça login para continuar.', 401);
        }

        return [
            'id'            => (int)$_SESSION['user_id'],
            'username'      => $_SESSION['username'] ?? '',
            'display_name'  => $_SESSION['display_name'] ?? '',
            'email'         => $_SESSION['email'] ?? '',
            'is_admin'      => (bool)($_SESSION['is_admin'] ?? false),
            'is_supervisor' => (bool)($_SESSION['is_supervisor'] ?? false),
        ];
    }
}
