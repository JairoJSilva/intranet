<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Helpers\Response;
use App\Config\Env;

/**
 * Middleware de CORS (Cross-Origin Resource Sharing).
 * Permite requisições do frontend SPA.
 */
final class CorsMiddleware
{
    public static function handle(): void
    {
        $appUrl = Env::get('APP_URL', 'http://localhost');
        $httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

        $allowedOrigins = [
            rtrim($appUrl, '/'),
            'http://localhost',
            'http://localhost:80',
            'http://localhost:8080',
            'http://127.0.0.1',
            'http://127.0.0.1:80',
            'http://127.0.0.1:8080',
            'http://intranet.local',
            'http://portalvem.local',
        ];

        if (!empty($httpOrigin) && in_array(rtrim($httpOrigin, '/'), $allowedOrigins, true)) {
            $origin = $httpOrigin;
        } else {
            $proto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $origin = !empty($httpOrigin) ? $httpOrigin : "{$proto}://{$host}";
        }

        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // Responde imediatamente a preflight requests (OPTIONS)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
