<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\GroupService;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;
use App\Helpers\Response;

/**
 * Controller para gestão de Grupos/Setores.
 */
final class GroupController
{
    private GroupService $service;

    public function __construct()
    {
        $this->service = new GroupService();
    }

    /**
     * GET /api/groups
     */
    public function index(): void
    {
        AuthMiddleware::handle();
        $groups = $this->service->getAll();
        Response::success($groups);
    }

    /**
     * GET /api/groups/{id}
     */
    public function show(int $id): void
    {
        AuthMiddleware::handle();
        $group = $this->service->getById($id);

        if (!$group) {
            Response::error('Grupo não encontrado.', 404);
        }

        Response::success($group);
    }

    /**
     * POST /api/groups
     */
    public function store(): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $created = $this->service->create($data, $user['id']);
            Response::success($created, 'Grupo criado com sucesso.', 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * PUT /api/groups/{id}
     */
    public function update(int $id): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $updated = $this->service->update($id, $data, $user['id']);
            Response::success($updated, 'Grupo atualizado com sucesso.');
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        }
    }

    /**
     * DELETE /api/groups/{id}
     */
    public function destroy(int $id): void
    {
        $user = AuthMiddleware::handle();
        AdminMiddleware::handle($user);

        try {
            $this->service->delete($id, $user['id']);
            Response::success(null, 'Grupo removido com sucesso.');
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        }
    }
}
