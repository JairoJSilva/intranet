<?php
declare(strict_types=1);

namespace App\Config;

/**
 * Configuração de SSO / OAuth2 / OpenID Connect (Azure AD / Keycloak / Google / Generic OIDC).
 * Valores carregados do .env via App\Config\Env.
 */
final class Sso
{
    /**
     * Verifica se a autenticação SSO está habilitada
     */
    public static function isEnabled(): bool
    {
        return Env::getBool('SSO_ENABLED', false);
    }

    /**
     * Retorna o identificador do provedor (azure-ad, keycloak, google, generic)
     */
    public static function getProvider(): string
    {
        return Env::get('SSO_PROVIDER', 'azure-ad');
    }

    /**
     * Retorna a configuração SSO completa como array
     */
    public static function getConfig(): array
    {
        return [
            'enabled'         => self::isEnabled(),
            'provider'        => self::getProvider(),
            'client_id'       => Env::get('SSO_CLIENT_ID', ''),
            'client_secret'   => Env::get('SSO_CLIENT_SECRET', ''),
            'authorize_url'   => Env::get('SSO_AUTHORIZE_URL', ''),
            'token_url'       => Env::get('SSO_TOKEN_URL', ''),
            'userinfo_url'    => Env::get('SSO_USERINFO_URL', ''),
            'scopes'          => Env::get('SSO_SCOPES', 'openid profile email'),
            'default_group'   => Env::get('SSO_DEFAULT_GROUP', 'Colaboradores'),
            'button_label'    => Env::get('SSO_BUTTON_LABEL', 'SSO Corporativo (Azure AD / Keycloak)'),
        ];
    }
}
