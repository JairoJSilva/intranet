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

        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($username === '' || $password === '') {
            Response::error('Usuário e senha são obrigatórios.', 422);
            return;
        }

        try {
            $user = $this->authService->login($username, $password);
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

    /**
     * GET /api/auth/sso/config
     */
    public function ssoConfig(): void
    {
        $config = \App\Config\Sso::getConfig();
        Response::success([
            'enabled'      => $config['enabled'],
            'provider'     => $config['provider'],
            'button_label' => $config['button_label'],
            'redirect_url' => '/api/auth/sso/redirect',
        ]);
    }

    /**
     * GET /api/auth/sso/redirect
     */
    public function ssoRedirect(): void
    {
        try {
            $appUrl = \App\Config\Env::get('APP_URL', 'http://localhost:8080');
            $redirectUri = rtrim($appUrl, '/') . '/api/auth/sso/callback';

            $authUrl = $this->authService->getSsoAuthorizationUrl($redirectUri);
            header("Location: {$authUrl}", true, 302);
            exit;
        } catch (\Throwable $e) {
            header('Location: /#/login?sso_error=' . urlencode($e->getMessage()), true, 302);
            exit;
        }
    }

    /**
     * GET /api/auth/sso/callback
     */
    public function ssoCallback(): void
    {
        $code  = $_GET['code'] ?? '';
        $state = $_GET['state'] ?? '';

        if (empty($code) || empty($state)) {
            $error = $_GET['error_description'] ?? $_GET['error'] ?? 'Parâmetros de autorização ausentes.';
            header('Location: /#/login?sso_error=' . urlencode((string)$error), true, 302);
            exit;
        }

        try {
            $appUrl = \App\Config\Env::get('APP_URL', 'http://localhost:8080');
            $redirectUri = rtrim($appUrl, '/') . '/api/auth/sso/callback';

            $this->authService->handleSsoCallback($code, $state, $redirectUri);
            
            // Redireciona com sucesso para o dashboard
            header('Location: /#/dashboard', true, 302);
            exit;
        } catch (\Throwable $e) {
            header('Location: /#/login?sso_error=' . urlencode($e->getMessage()), true, 302);
            exit;
        }
    }
}

