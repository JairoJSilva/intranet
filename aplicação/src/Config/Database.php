<?php
declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

/**
 * Singleton para conexão PDO com MySQL.
 * Utiliza configuração do .env via App\Config\Env.
 */
final class Database
{
    private static ?PDO $instance = null;

    private function __construct() {}
    private function __clone() {}

    /**
     * Retorna a instância singleton do PDO
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            try {
                $host = Env::get('DB_HOST', '127.0.0.1');
                $port = Env::get('DB_PORT', '3306');
                $name = Env::get('DB_NAME', 'intranet_db');
                $user = Env::get('DB_USER', 'root');
                $pass = Env::get('DB_PASS', '');

                $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                ]);
            } catch (PDOException $e) {
                // Em produção, logar e retornar erro genérico
                throw new \RuntimeException(
                    "Falha na conexão com o banco de dados: " . $e->getMessage(),
                    500,
                    $e
                );
            }
        }

        return self::$instance;
    }

    /**
     * Fecha a conexão (útil para testes)
     */
    public static function close(): void
    {
        self::$instance = null;
    }
}
