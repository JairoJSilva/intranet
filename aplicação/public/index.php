<?php
declare(strict_types=1);

/**
 * Intranet Flowti — API Entry Point
 * Todas as requisições /api/* são roteadas aqui pelo .htaccess.
 * Requisições de arquivos estáticos (JS, CSS, imagens) são servidas diretamente.
 */

// -----------------------------------------------
// 1. Bootstrap
// -----------------------------------------------
require_once __DIR__ . '/../src/bootstrap.php';

// -----------------------------------------------
// 2. CORS
// -----------------------------------------------
\App\Middleware\CorsMiddleware::handle();

// -----------------------------------------------
// 3. Determinar Método e URI
// -----------------------------------------------
$method = strtoupper($_SERVER['REQUEST_METHOD']);
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove trailing slash (exceto raiz)
if ($uri !== '/' && str_ends_with($uri, '/')) {
    $uri = rtrim($uri, '/');
}

// -----------------------------------------------
// 4. Se NÃO é rota de API, serve o SPA (index.html)
// -----------------------------------------------
if (!str_starts_with($uri, '/api/')) {
    // Verifica se é um arquivo estático existente
    $filePath = __DIR__ . $uri;
    if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
        return false; // Deixa o Apache servir o arquivo estático
    }

    // SPA fallback: serve index.html para todas as rotas não-API
    readfile(__DIR__ . '/index.html');
    exit;
}

// -----------------------------------------------
// 5. Carregar rotas e fazer matching
// -----------------------------------------------
$routes = require __DIR__ . '/../src/routes.php';

$matchedRoute  = null;
$matchedParams = [];

foreach ($routes as $routeKey => $handler) {
    // Parse route key: "METHOD /path/{param}"
    $parts = preg_split('/\s+/', trim($routeKey), 2);
    $routeMethod = strtoupper($parts[0]);
    $routePath   = $parts[1] ?? '';

    if ($routeMethod !== $method) {
        continue;
    }

    // Converte {id} para regex de captura
    $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>\d+)', $routePath);
    $pattern = '#^' . $pattern . '$#';

    if (preg_match($pattern, $uri, $matches)) {
        $matchedRoute = $handler;

        // Extrai parâmetros nomeados
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $matchedParams[$key] = (int)$value;
            }
        }
        break;
    }
}

// -----------------------------------------------
// 6. Executar handler ou retornar 404
// -----------------------------------------------
if ($matchedRoute === null) {
    \App\Helpers\Response::error('Rota não encontrada.', 404);
}

try {
    [$controllerClass, $actionMethod] = $matchedRoute;
    $controller = new $controllerClass();

    // Passa parâmetros extraídos da URL como argumentos
    $controller->$actionMethod(...array_values($matchedParams));

} catch (\Throwable $e) {
    $env = \App\Config\Env::get('APP_ENV', 'production');

    $message = $env === 'development'
        ? $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine()
        : 'Erro interno do servidor.';

    error_log("[Flowti Error] {$e->getMessage()} in {$e->getFile()}:{$e->getLine()}");

    \App\Helpers\Response::error($message, 500);
}
