<?php
declare(strict_types=1);

namespace App\Helpers;

/**
 * Helper para respostas JSON padronizadas da API REST.
 * Garante formato consistente: { success, data, message }
 */
final class Response
{
    /**
     * Envia resposta JSON de sucesso
     */
    public static function success(mixed $data = null, string $message = 'Operação realizada com sucesso', int $statusCode = 200): void
    {
        self::send($statusCode, [
            'success' => true,
            'data'    => $data,
            'message' => $message,
        ]);
    }

    /**
     * Envia resposta JSON de erro
     */
    public static function error(string $message = 'Erro interno do servidor', int $statusCode = 500, mixed $errors = null): void
    {
        $payload = [
            'success' => false,
            'data'    => null,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        self::send($statusCode, $payload);
    }

    /**
     * Envia resposta JSON com lista paginada
     */
    public static function paginated(array $data, int $total, int $page, int $perPage): void
    {
        self::send(200, [
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'total'        => $total,
                'page'         => $page,
                'per_page'     => $perPage,
                'total_pages'  => (int)ceil($total / max($perPage, 1)),
            ],
            'message' => 'Dados carregados com sucesso',
        ]);
    }

    /**
     * Envia a resposta HTTP com headers apropriados
     */
    private static function send(int $statusCode, array $payload): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');

        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
