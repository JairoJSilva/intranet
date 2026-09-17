<?php
declare(strict_types=1);

/**
 * Portal Unificado — Router de API REST
 * Mapeia rotas para Controllers com suporte a parâmetros dinâmicos.
 */

use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\GroupController;
use App\Controllers\PanelController;
use App\Controllers\LinkController;
use App\Controllers\HealthController;
use App\Controllers\NoticeController;

return [
    // ---- Auth ----
    'POST /api/auth/login'        => [AuthController::class, 'login'],
    'POST /api/auth/logout'       => [AuthController::class, 'logout'],
    'GET  /api/auth/me'           => [AuthController::class, 'me'],
    'GET  /api/auth/sso/config'   => [AuthController::class, 'ssoConfig'],
    'GET  /api/auth/sso/redirect' => [AuthController::class, 'ssoRedirect'],
    'GET  /api/auth/sso/callback' => [AuthController::class, 'ssoCallback'],

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
    'PUT    /api/panels/reorder' => [PanelController::class, 'reorder'],
    'GET    /api/panels'         => [PanelController::class, 'index'],
    'POST   /api/panels'         => [PanelController::class, 'store'],
    'GET    /api/panels/{id}'    => [PanelController::class, 'show'],
    'PUT    /api/panels/{id}'    => [PanelController::class, 'update'],
    'DELETE /api/panels/{id}'    => [PanelController::class, 'destroy'],

    // ---- Links ----
    'PUT    /api/links/reorder'        => [LinkController::class, 'reorder'],
    'POST   /api/links/detect-favicon' => [LinkController::class, 'detectFavicon'],
    'GET    /api/links'                => [LinkController::class, 'index'],
    'POST   /api/links'                => [LinkController::class, 'store'],
    'POST   /api/links/import-csv'     => [LinkController::class, 'importCsv'],
    'PUT    /api/links/{id}'           => [LinkController::class, 'update'],
    'DELETE /api/links/{id}'           => [LinkController::class, 'destroy'],

    // ---- Health Check & Dashboard ----
    'POST /api/health/check'   => [HealthController::class, 'check'],
    'GET  /api/dashboard/stats'=> [HealthController::class, 'stats'],

    // ---- Notices & Broadcast Banners ----
    'GET    /api/notices/active' => [NoticeController::class, 'active'],
    'GET    /api/notices'        => [NoticeController::class, 'index'],
    'POST   /api/notices'        => [NoticeController::class, 'store'],
    'GET    /api/notices/{id}'   => [NoticeController::class, 'show'],
    'PUT    /api/notices/{id}'   => [NoticeController::class, 'update'],
    'DELETE /api/notices/{id}'   => [NoticeController::class, 'destroy'],
];
