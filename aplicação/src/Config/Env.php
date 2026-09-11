<?php
declare(strict_types=1);

namespace App\Config;

/**
 * Parser de variáveis de ambiente (.env)
 * Carrega e fornece acesso tipado às configurações do sistema.
 */
final class Env
{
    private static bool $loaded = false;

    /**
     * Carrega o arquivo .env para o $_ENV e putenv()
     */
    public static function load(string $path): void
    {
        if (self::$loaded) {
            return;
        }

        $envFile = rtrim($path, '/') . '/.env';

        if (!file_exists($envFile)) {
            $exampleFile = rtrim($path, '/') . '/.env.example';
            if (file_exists($exampleFile)) {
                $envFile = $exampleFile;
            } else {
                self::$loaded = true;
                return;
            }
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            // Ignora comentários
            $line = trim($line);
            if (str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key   = trim($key);
            $value = trim($value);

            // Remove aspas ao redor do valor
            if (preg_match('/^(["\'])(.*)\\1$/', $value, $m)) {
                $value = $m[2];
            }

            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("{$key}={$value}");
            }
        }

        self::$loaded = true;
    }

    /**
     * Obtém uma variável de ambiente com fallback opcional
     */
    public static function get(string $key, string $default = ''): string
    {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }

    /**
     * Obtém variável como booleano
     */
    public static function getBool(string $key, bool $default = false): bool
    {
        $value = self::get($key, $default ? 'true' : 'false');
        return in_array(strtolower($value), ['true', '1', 'yes', 'on'], true);
    }

    /**
     * Obtém variável como inteiro
     */
    public static function getInt(string $key, int $default = 0): int
    {
        $value = self::get($key, (string)$default);
        return (int)$value;
    }
}
