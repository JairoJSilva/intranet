<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\PanelService;
use App\Services\LinkService;
use App\Middleware\AuthMiddleware;
use App\Middleware\SupervisorMiddleware;
use App\Helpers\Response;

/**
 * Controller para gestão de Painéis.
 */
final class PanelController
{
    private PanelService $service;
    private LinkService $linkService;

    public function __construct()
    {
        $this->service     = new PanelService();
        $this->linkService = new LinkService();
    }

    /**
     * GET /api/panels — Retorna painéis filtrados por RBAC
     */
    public function index(): void
    {
        $user = AuthMiddleware::handle();
        $panels = $this->service->getForUser($user);

        // Anexa links de cada painel
        foreach ($panels as &$panel) {
            $panel['links'] = $this->linkService->getByPanelId((int)$panel['id']);
        }

        Response::success($panels);
    }

    /**
     * GET /api/panels/{id}
     */
    public function show(int $id): void
    {
        AuthMiddleware::handle();

        $panel = $this->service->getById($id);
        if (!$panel) {
            Response::error('Painel não encontrado.', 404);
        }

        $panel['links'] = $this->linkService->getByPanelId($id);
        Response::success($panel);
    }

    /**
     * POST /api/panels
     */
    public function store(): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $created = $this->service->create($data, $user);
            Response::success($created, 'Painel criado com sucesso.', 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 403);
        }
    }

    /**
     * PUT /api/panels/{id}
     */
    public function update(int $id): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $updated = $this->service->update($id, $data, $user);
            Response::success($updated, 'Painel atualizado com sucesso.');
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 403);
        }
    }

    /**
     * DELETE /api/panels/{id}
     */
    public function destroy(int $id): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        try {
            $this->service->delete($id, $user);
            Response::success(null, 'Painel removido com sucesso.');
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 403);
        }
    }

    /**
     * PUT /api/panels/reorder
     */
    public function reorder(): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $ids = $data['ids'] ?? [];

        if (!is_array($ids) || empty($ids)) {
            Response::error('A lista de IDs para reordenação é obrigatória.', 422);
        }

        try {
            $this->service->reorder($ids, $user);
            Response::success(null, 'Ordenação de painéis atualizada com sucesso.');
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
