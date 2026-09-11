<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Services\HealthCheckService;
use App\Services\LinkService;
use App\Repositories\UserRepository;
use App\Middleware\AuthMiddleware;
use App\Helpers\Response;

/**
 * Controller para Health Check e Dashboard stats.
 */
final class HealthController
{
    private HealthCheckService $healthService;
    private LinkService $linkService;

    public function __construct()
    {
        $this->healthService = new HealthCheckService();
        $this->linkService   = new LinkService();
    }

    /**
     * POST /api/health/check — Executa health check de todos os links
     */
    public function check(): void
    {
        AuthMiddleware::handle();

        $results = $this->healthService->checkAll();
        $stats   = $this->linkService->getStatusStats();

        Response::success([
            'results' => $results,
            'stats'   => $stats,
        ], 'Health check concluído.');
    }

    /**
     * GET /api/dashboard/stats — Métricas para o dashboard
     */
    public function stats(): void
    {
        AuthMiddleware::handle();

        $userRepo = new UserRepository();
        $linkStats = $this->linkService->getStatusStats();

        Response::success([
            'total_users'   => $userRepo->countActive(),
            'total_links'   => $linkStats['total'],
            'links_online'  => $linkStats['online'],
            'links_warning' => $linkStats['warning'],
            'links_offline' => $linkStats['offline'],
            'links_unknown' => $linkStats['unknown'],
            'uptime_percent' => $linkStats['total'] > 0
                ? round(($linkStats['online'] / $linkStats['total']) * 100, 1)
                : 0,
        ]);
    }
}
