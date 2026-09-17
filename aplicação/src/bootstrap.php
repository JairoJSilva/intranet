<?php
declare(strict_types=1);

/**
 * Omniflowti — Bootstrap
 * Inicializa o ambiente: autoload, .env, sessão segura.
 */

// -----------------------------------------------
// 1. Autoload PSR-4 via Composer (ou fallback manual)
// -----------------------------------------------
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
} else {
    // Fallback: autoload manual simples sem Composer
    spl_autoload_register(function (string $class): void {
        $prefix = 'App\\';
        $baseDir = __DIR__ . '/';

        if (!str_starts_with($class, $prefix)) {
            return;
        }

        $relativeClass = substr($class, strlen($prefix));
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

        if (file_exists($file)) {
            require_once $file;
        }
    });
}

// -----------------------------------------------
// 2. Carregar variáveis de ambiente (.env)
// -----------------------------------------------
\App\Config\Env::load(dirname(__DIR__));

// -----------------------------------------------
// 3. Configurar sessão segura
// -----------------------------------------------
if (session_status() === PHP_SESSION_NONE) {
    $lifetime = \App\Config\Env::getInt('SESSION_LIFETIME', 7200);

    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string)$lifetime);

    // Em HTTPS, habilitar cookie seguro
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', '1');
    }

    session_name('OMNIFLOWTI_SESSION');
    session_start();
}

// -----------------------------------------------
// 4. Timezone padrão
// -----------------------------------------------
date_default_timezone_set('America/Sao_Paulo');

// -----------------------------------------------
// 5. Error reporting (baseado no ambiente)
// -----------------------------------------------
$env = \App\Config\Env::get('APP_ENV', 'production');

if ($env === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// -----------------------------------------------
// 6. Security Headers globais
// -----------------------------------------------
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
