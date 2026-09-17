<?php
declare(strict_types=1);

namespace App\Helpers;

/**
 * Validador de inputs para a API.
 * Centraliza validações de campos obrigatórios, formatos e regras de negócio.
 */
final class Validator
{
    private array $errors = [];

    /**
     * Valida que campos obrigatórios existam e não estejam vazios
     */
    public function required(array $data, array $fields): self
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $this->errors[$field] = "O campo '{$field}' é obrigatório.";
            }
        }
        return $this;
    }

    /**
     * Valida formato de e-mail
     */
    public function email(array $data, string $field): self
    {
        if (isset($data[$field]) && !filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "O campo '{$field}' deve ser um e-mail válido.";
        }
        return $this;
    }

    /**
     * Valida URL (aceita domínios com ou sem protocolo, IPs internos e portas)
     */
    public function url(array $data, string $field): self
    {
        if (isset($data[$field]) && is_string($data[$field])) {
            $val = trim($data[$field]);
            if (!preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $val)) {
                $val = 'https://' . $val;
            }
            if (!filter_var($val, FILTER_VALIDATE_URL) && !preg_match('#^https?://(localhost|[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-\.]+)(:[0-9]+)?(/.*)?$#i', $val)) {
                $this->errors[$field] = "O campo '{$field}' deve ser uma URL válida (ex: https://sistema.empresa.local ou sistema.empresa.local).";
            }
        }
        return $this;
    }

    /**
     * Valida tamanho mínimo de string
     */
    public function minLength(array $data, string $field, int $min): self
    {
        if (isset($data[$field]) && mb_strlen(trim($data[$field])) < $min) {
            $this->errors[$field] = "O campo '{$field}' deve ter no mínimo {$min} caracteres.";
        }
        return $this;
    }

    /**
     * Valida tamanho máximo de string
     */
    public function maxLength(array $data, string $field, int $max): self
    {
        if (isset($data[$field]) && mb_strlen(trim($data[$field])) > $max) {
            $this->errors[$field] = "O campo '{$field}' deve ter no máximo {$max} caracteres.";
        }
        return $this;
    }

    /**
     * Valida que o valor está numa lista de opções
     */
    public function inList(array $data, string $field, array $allowed): self
    {
        if (isset($data[$field]) && !in_array($data[$field], $allowed, true)) {
            $list = implode(', ', $allowed);
            $this->errors[$field] = "O campo '{$field}' deve ser um dos valores: {$list}.";
        }
        return $this;
    }

    /**
     * Valida que o valor é numérico inteiro positivo
     */
    public function positiveInt(array $data, string $field): self
    {
        if (isset($data[$field]) && (!is_numeric($data[$field]) || (int)$data[$field] < 1)) {
            $this->errors[$field] = "O campo '{$field}' deve ser um número inteiro positivo.";
        }
        return $this;
    }

    /**
     * Retorna se a validação passou sem erros
     */
    public function passes(): bool
    {
        return empty($this->errors);
    }

    /**
     * Retorna se a validação falhou
     */
    public function fails(): bool
    {
        return !$this->passes();
    }

    /**
     * Retorna os erros encontrados
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Limpa os erros (para reutilização)
     */
    public function reset(): self
    {
        $this->errors = [];
        return $this;
    }
}
