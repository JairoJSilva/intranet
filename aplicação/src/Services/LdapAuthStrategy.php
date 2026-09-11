<?php
declare(strict_types=1);

namespace App\Services;

use App\Config\Ldap;

/**
 * Strategy de autenticação via LDAP / Active Directory.
 * Realiza bind e busca de atributos do usuário no AD.
 */
final class LdapAuthStrategy
{
    /**
     * Tenta autenticar usuário no LDAP/AD
     * 
     * @return array|false Retorna dados do usuário se autenticado, false caso contrário
     */
    public function authenticate(string $username, string $password): array|false
    {
        if (!Ldap::isEnabled()) {
            return false;
        }

        $config = Ldap::getConfig();

        // Verifica se a extensão ldap está disponível
        if (!function_exists('ldap_connect')) {
            error_log('[LDAP] Extensão PHP LDAP não está instalada.');
            return false;
        }

        $conn = @ldap_connect($config['host'], $config['port']);

        if (!$conn) {
            error_log("[LDAP] Falha ao conectar em {$config['host']}:{$config['port']}");
            return false;
        }

        // Configurações padrão para AD
        ldap_set_option($conn, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($conn, LDAP_OPT_REFERRALS, 0);
        ldap_set_option($conn, LDAP_OPT_NETWORK_TIMEOUT, 5);

        try {
            // 1. Bind com conta de serviço para buscar o DN do usuário
            $bindResult = @ldap_bind($conn, $config['bind_dn'], $config['bind_pass']);

            if (!$bindResult) {
                error_log('[LDAP] Falha no bind com conta de serviço: ' . ldap_error($conn));
                return false;
            }

            // 2. Buscar o usuário pelo filtro
            $filter = str_replace('{username}', ldap_escape($username, '', LDAP_ESCAPE_FILTER), $config['search_filter']);

            $search = @ldap_search(
                $conn,
                $config['base_dn'],
                $filter,
                ['dn', 'cn', 'displayName', 'mail', 'sAMAccountName', 'memberOf', 'department']
            );

            if (!$search) {
                error_log('[LDAP] Falha na busca: ' . ldap_error($conn));
                return false;
            }

            $entries = ldap_get_entries($conn, $search);

            if ($entries['count'] === 0) {
                return false; // Usuário não encontrado no AD
            }

            $userDn = $entries[0]['dn'];

            // 3. Bind com as credenciais do usuário (valida senha)
            $userBind = @ldap_bind($conn, $userDn, $password);

            if (!$userBind) {
                return false; // Senha incorreta
            }

            // 4. Retorna dados do usuário do AD
            return [
                'username'     => $entries[0]['samaccountname'][0] ?? $username,
                'display_name' => $entries[0]['displayname'][0] ?? $entries[0]['cn'][0] ?? $username,
                'email'        => $entries[0]['mail'][0] ?? "{$username}@" . explode(',', str_replace('dc=', '', $config['base_dn']))[0],
                'department'   => $entries[0]['department'][0] ?? null,
            ];

        } catch (\Exception $e) {
            error_log('[LDAP] Erro: ' . $e->getMessage());
            return false;
        } finally {
            @ldap_unbind($conn);
        }
    }
}
