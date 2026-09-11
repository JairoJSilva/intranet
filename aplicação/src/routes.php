<?php
declare(strict_types=1);

/**
 * Omniflowti — Router de API REST
 * Mapeia rotas para Controllers com suporte a parâmetros dinâmicos.
 */

use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\GroupController;
use App\Controllers\PanelController;
use App\Controllers\LinkController;
use App\Controllers\HealthController;

return [
    // ---- Auth ----
    'POST /api/auth/login'     => [AuthController::class, 'login'],
    'POST /api/auth/logout'    => [AuthController::class, 'logout'],
    'GET  /api/auth/me'        => [AuthController::class, 'me'],

    // ---- Users (Admin only) ----
    'GET    /api/users'            => [UserController::class, 'index'],
    'POST   /api/users'            => [UserController::class, 'store'],
    'POST   /api/users/import-csv' => [UserController::class, 'importCsv'],
    'GET    /api/users/{id}'       => [UserController::class, 'show'],
    'PUT    /api/users/{id}'       => [UserController::class, 'update'],
    'DELETE /api/users/{id}'       => [UserController::class, 'destroy'],

    // ---- Groups ----
    'GET    /api/groups'                    => [GroupController::class, 'index'],
    'POST   /api/groups'                    => [GroupController::class, 'store'],
    'GET    /api/groups/{id}'               => [GroupController::class, 'show'],
    'PUT    /api/groups/{id}'               => [GroupController::class, 'update'],
    'DELETE /api/groups/{id}'               => [GroupController::class, 'destroy'],
    'GET    /api/groups/{id}/members'       => [GroupController::class, 'members'],
    'PUT    /api/groups/{id}/members/{userId}' => [GroupController::class, 'updateMember'],
    'DELETE /api/groups/{id}/members/{userId}' => [GroupController::class, 'removeMember'],

    // ---- Panels ----
    'GET    /api/panels'       => [PanelController::class, 'index'],
    'POST   /api/panels'       => [PanelController::class, 'store'],
    'GET    /api/panels/{id}'  => [PanelController::class, 'show'],
    'PUT    /api/panels/{id}'  => [PanelController::class, 'update'],
    'DELETE /api/panels/{id}'  => [PanelController::class, 'destroy'],

    // ---- Links ----
    'GET    /api/links'        => [LinkController::class, 'index'],
    'POST   /api/links'        => [LinkController::class, 'store'],
    'PUT    /api/links/{id}'   => [LinkController::class, 'update'],
    'DELETE /api/links/{id}'   => [LinkController::class, 'destroy'],

    // ---- Health Check & Dashboard ----
    'POST /api/health/check'   => [HealthController::class, 'check'],
    'GET  /api/dashboard/stats'=> [HealthController::class, 'stats'],
];
