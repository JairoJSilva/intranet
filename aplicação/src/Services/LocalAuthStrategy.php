<?php
declare(strict_types=1);

namespace App\Services;

/**
 * Strategy de autenticação local (username + senha hash).
 * Utiliza password_hash com BCRYPT (fallback) ou ARGON2ID.
 */
final class LocalAuthStrategy
{
    /**
     * Verifica a senha contra o hash armazenado
     */
    public function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Gera hash seguro da senha
     */
    public function hashPassword(string $password): string
    {
        // Tenta Argon2id primeiro (mais seguro), fallback para Bcrypt
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($password, PASSWORD_ARGON2ID);
        }

        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verifica se o hash precisa ser atualizado (rehash)
     */
    public function needsRehash(string $hash): bool
    {
        if (defined('PASSWORD_ARGON2ID')) {
            return password_needs_rehash($hash, PASSWORD_ARGON2ID);
        }

        return password_needs_rehash($hash, PASSWORD_BCRYPT, ['cost' => 12]);
    }
}
