<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\AuthService;
use App\Helpers\Response;

/**
 * Controller de Autenticação (Login / Logout / Me).
 */
final class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    /**
     * POST /api/auth/login
     */
    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $user = $this->authService->login(
                trim($data['username'] ?? ''),
                $data['password'] ?? ''
            );

            Response::success($user, 'Login realizado com sucesso.');

        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 401);
        }
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(): void
    {
        $this->authService->logout();
        Response::success(null, 'Logout realizado com sucesso.');
    }

    /**
     * GET /api/auth/me
     */
    public function me(): void
    {
        $user = $this->authService->getCurrentUser();

        if ($user === null) {
            Response::error('Não autenticado.', 401);
        }

        Response::success($user);
    }
}
