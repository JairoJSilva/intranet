<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Middleware\SupervisorMiddleware;
use App\Services\NoticeService;

final class NoticeController
{
    private NoticeService $service;

    public function __construct()
    {
        $this->service = new NoticeService();
    }

    /**
     * GET /api/notices/active
     * Retorna avisos ativos para todos os usuários autenticados
     */
    public function active(): void
    {
        AuthMiddleware::handle();
        $notices = $this->service->getActive();
        Response::success($notices);
    }

    /**
     * GET /api/notices
     * Retorna todos os avisos para administração (Supervisores/Admins)
     */
    public function index(): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $notices = $this->service->getAll();
        Response::success($notices);
    }

    /**
     * GET /api/notices/{id}
     */
    public function show(int $id): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $notice = $this->service->getById($id);
        if (!$notice) {
            Response::error('Aviso não encontrado.', 404);
        }

        Response::success($notice);
    }

    /**
     * POST /api/notices
     */
    public function store(): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $created = $this->service->create($data, $user['id']);
            Response::success($created, 'Aviso publicado com sucesso.', 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\Throwable $e) {
            Response::error('Erro ao cadastrar aviso.', 500);
        }
    }

    /**
     * PUT /api/notices/{id}
     */
    public function update(int $id): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $updated = $this->service->update($id, $data, $user['id']);
            Response::success($updated, 'Aviso atualizado com sucesso.');
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        } catch (\Throwable $e) {
            Response::error('Erro ao atualizar aviso.', 500);
        }
    }

    /**
     * DELETE /api/notices/{id}
     */
    public function destroy(int $id): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        try {
            $this->service->delete($id, $user['id']);
            Response::success(null, 'Aviso removido com sucesso.');
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        } catch (\Throwable $e) {
            Response::error('Erro ao remover aviso.', 500);
        }
    }
}
