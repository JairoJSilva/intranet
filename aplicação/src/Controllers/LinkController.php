<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\LinkService;
use App\Middleware\AuthMiddleware;
use App\Middleware\SupervisorMiddleware;
use App\Helpers\Response;

/**
 * Controller para gestão de Links.
 */
final class LinkController
{
    private LinkService $service;

    public function __construct()
    {
        $this->service = new LinkService();
    }

    /**
     * GET /api/links?panel_id=X
     */
    public function index(): void
    {
        AuthMiddleware::handle();

        $panelId = (int)($_GET['panel_id'] ?? 0);
        if ($panelId < 1) {
            Response::error('Parâmetro panel_id é obrigatório.', 422);
        }

        $links = $this->service->getByPanelId($panelId);
        Response::success($links);
    }

    /**
     * POST /api/links
     */
    public function store(): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $created = $this->service->create($data, $user['id']);
            Response::success($created, 'Link criado com sucesso.', 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * PUT /api/links/{id}
     */
    public function update(int $id): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $updated = $this->service->update($id, $data, $user['id']);
            Response::success($updated, 'Link atualizado com sucesso.');
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        }
    }

    /**
     * DELETE /api/links/{id}
     */
    public function destroy(int $id): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        try {
            $this->service->delete($id, $user['id']);
            Response::success(null, 'Link removido com sucesso.');
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        }
    }

    /**
     * POST /api/links/import-csv
     * Aceita multipart/form-data com 'panel_id' e 'file',
     * ou JSON com 'panel_id' e 'csv_content'.
     */
    public function importCsv(): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $panelId = 0;
        $csvContent = '';

        if (!empty($_FILES['file']['tmp_name'])) {
            $panelId = (int)($_POST['panel_id'] ?? 0);
            $csvContent = file_get_contents($_FILES['file']['tmp_name']);
        } else {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $panelId = (int)($input['panel_id'] ?? 0);
            $csvContent = (string)($input['csv_content'] ?? '');
        }

        if ($panelId <= 0) {
            Response::error('Parâmetro panel_id é obrigatório e deve ser válido.', 422);
        }

        if (empty(trim($csvContent))) {
            Response::error('Conteúdo do arquivo CSV não fornecido.', 422);
        }

        try {
            $result = $this->service->importFromCsv($panelId, $csvContent, $user['id']);
            Response::success($result, "Importação concluída: {$result['total_imported']} links importados com sucesso.", 201);
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 404);
        }
    }

    /**
     * PUT /api/links/reorder
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
            $this->service->reorder($ids, $user['id']);
            Response::success(null, 'Ordenação de links atualizada com sucesso.');
        } catch (\InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * POST /api/links/detect-favicon
     * Body JSON: { "url": "https://..." }
     */
    public function detectFavicon(): void
    {
        $user = AuthMiddleware::handle();
        SupervisorMiddleware::handle($user);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $url = trim((string)($data['url'] ?? ''));

        if (empty($url)) {
            Response::error('A URL é obrigatória para detecção de favicon.', 422);
        }

        $faviconService = new \App\Services\FaviconService();
        $result = $faviconService->detectAndDownload($url);

        Response::success($result, $result['message']);
    }
}
