<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\UserService;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;
use App\Helpers\Response;

/**
 * Controller para gestão de Usuários.
 * Todas as rotas requerem Auth + Admin.
 */
final class UserController
{
    private UserService $service;

    public function __construct()
    {
        $this->service = new UserService();
    }

    /**
     * GET /api/users
     */
    public function index(): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        $users = $this->service->getAll();
        Response::success($users);
    }

    /**
     * GET /api/users/{id}
     */
    public function show(int $id): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        $found = $this->service->getById($id);

        if (!$found) {
            Response::error('Usuário não encontrado.', 404);
        }

        Response::success($found);
    }

    /**
     * POST /api/users
     */
    public function store(): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $created = $this->service->create($data, $user['id']);
            Response::success($created, 'Usuário criado com sucesso.', 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/users/{id}
     */
    public function update(int $id): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $updated = $this->service->update($id, $data, $user['id']);
            Response::success($updated, 'Usuário atualizado com sucesso.');
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        }
    }

    /**
     * DELETE /api/users/{id}
     */
    public function destroy(int $id): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        try {
            $this->service->deactivate($id, $user['id']);
            Response::success(null, 'Usuário desativado com sucesso.');
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * POST /api/users/import-csv
     */
    public function importCsv(): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        $csvContent = file_get_contents('php://input');

        if (empty($csvContent)) {
            Response::error('Conteúdo CSV vazio.', 422);
        }

        $result = $this->service->importCsv($csvContent, $user['id']);
        Response::success($result, "Importação finalizada: {$result['imported']} de {$result['total']} usuários importados.");
    }
}
