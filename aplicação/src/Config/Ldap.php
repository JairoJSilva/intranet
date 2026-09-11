<?php
declare(strict_types=1);

namespace App\Config;

/**
 * Configuração do LDAP / Active Directory.
 * Valores carregados do .env via App\Config\Env.
 */
final class Ldap
{
    /**
     * Verifica se a autenticação LDAP está habilitada
     */
    public static function isEnabled(): bool
    {
        return Env::getBool('LDAP_ENABLED', false);
    }

    /**
     * Retorna a configuração LDAP completa como array
     */
    public static function getConfig(): array
    {
        return [
            'host'          => Env::get('LDAP_HOST', 'ldap://localhost'),
            'port'          => Env::getInt('LDAP_PORT', 389),
            'base_dn'       => Env::get('LDAP_BASE_DN', ''),
            'bind_dn'       => Env::get('LDAP_BIND_DN', ''),
            'bind_pass'     => Env::get('LDAP_BIND_PASS', ''),
            'search_filter' => Env::get('LDAP_SEARCH_FILTER', '(sAMAccountName={username})'),
            'default_group' => Env::get('LDAP_DEFAULT_GROUP', 'Colaboradores'),
        ];
    }
}
