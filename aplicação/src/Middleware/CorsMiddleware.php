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
        $allowedOrigin = Env::get('APP_URL', 'http://localhost:8080');

        header("Access-Control-Allow-Origin: {$allowedOrigin}");
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
