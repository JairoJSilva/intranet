<?php
declare(strict_types=1);

namespace App\Services;

use App\Config\Sso;
use App\Config\Env;

/**
 * Estratégia de Autenticação SSO via OAuth2 / OpenID Connect (OIDC).
 * Compatível com Microsoft Entra ID (Azure AD), Keycloak, Google Workspace e IdPs genéricos.
 */
class SsoAuthStrategy
{
    /**
     * Gera a URL de redirecionamento para o Identity Provider com state anti-CSRF
     */
    public function getAuthorizationUrl(string $redirectUri): string
    {
        $config = Sso::getConfig();

        if (empty($config['authorize_url']) || empty($config['client_id'])) {
            throw new \RuntimeException('Configurações de SSO incompletas no servidor.');
        }

        // Gera state e nonce criptograficamente seguros
        $state = bin2hex(random_bytes(16));
        $nonce = bin2hex(random_bytes(16));

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['sso_state'] = $state;
        $_SESSION['sso_nonce'] = $nonce;

        $params = [
            'client_id'     => $config['client_id'],
            'response_type' => 'code',
            'redirect_uri'  => $redirectUri,
            'scope'         => $config['scopes'],
            'state'         => $state,
            'nonce'         => $nonce,
            'response_mode' => 'query',
        ];

        $separator = str_contains($config['authorize_url'], '?') ? '&' : '?';
        return $config['authorize_url'] . $separator . http_build_query($params);
    }

    /**
     * Processa o callback de autorização, troca o code por tokens e obtém dados do usuário
     *
     * @return array Dados normalizados do usuário: username, display_name, email, provider
     * @throws \RuntimeException Se houver falha de validação ou troca de token
     */
    public function handleCallback(string $code, string $state, string $redirectUri): array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $savedState = $_SESSION['sso_state'] ?? null;
        unset($_SESSION['sso_state'], $_SESSION['sso_nonce']);

        if (!$savedState || !hash_equals($savedState, $state)) {
            throw new \RuntimeException('Falha na validação de segurança do SSO (State inválido ou expirado).');
        }

        $config = Sso::getConfig();

        // 1. Troca do authorization code por tokens
        $tokens = $this->exchangeCodeForTokens($code, $redirectUri, $config);

        $accessToken = $tokens['access_token'] ?? null;
        $idToken     = $tokens['id_token'] ?? null;

        if (!$accessToken && !$idToken) {
            throw new \RuntimeException('O servidor de autenticação não retornou tokens válidos.');
        }

        // 2. Extração dos dados do usuário (UserInfo endpoint ou claims do id_token)
        $userData = [];

        if (!empty($config['userinfo_url']) && $accessToken) {
            $userData = $this->fetchUserInfo($config['userinfo_url'], $accessToken);
        }

        if (empty($userData) && $idToken) {
            $userData = $this->decodeIdToken($idToken);
        }

        if (empty($userData)) {
            throw new \RuntimeException('Não foi possível obter o perfil do usuário a partir do SSO.');
        }

        // 3. Normalização dos dados
        return $this->normalizeUserData($userData);
    }

    /**
     * Realiza requisição POST para o token endpoint via cURL
     */
    private function exchangeCodeForTokens(string $code, string $redirectUri, array $config): array
    {
        $postFields = [
            'grant_type'    => 'authorization_code',
            'code'          => $code,
            'redirect_uri'  => $redirectUri,
            'client_id'     => $config['client_id'],
            'client_secret' => $config['client_secret'],
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $config['token_url'],
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => http_build_query($postFields),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \RuntimeException("Erro de comunicação com o provedor SSO: {$error}");
        }

        $json = json_decode((string)$response, true);
        if ($httpCode >= 400 || !is_array($json)) {
            $msg = $json['error_description'] ?? $json['error'] ?? "Código HTTP {$httpCode}";
            throw new \RuntimeException("Falha na troca de token SSO: {$msg}");
        }

        return $json;
    }

    /**
     * Consulta o endpoint UserInfo do IdP com o access_token
     */
    private function fetchUserInfo(string $userInfoUrl, string $accessToken): array
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $userInfoUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer {$accessToken}",
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $json = json_decode((string)$response, true);
        return is_array($json) ? $json : [];
    }

    /**
     * Decodifica a carga útil (payload) de um token JWT sem verificação de assinatura externa
     */
    private function decodeIdToken(string $idToken): array
    {
        $parts = explode('.', $idToken);
        if (count($parts) < 2) {
            return [];
        }

        $payload = base64_decode(strtr($parts[1], '-_', '+/'));
        $json = json_decode((string)$payload, true);
        return is_array($json) ? $json : [];
    }

    /**
     * Normaliza as propriedades de usuário recebidas de provedores heterogêneos
     */
    private function normalizeUserData(array $data): array
    {
        // Email
        $email = $data['email'] ?? $data['upn'] ?? $data['unique_name'] ?? $data['preferred_username'] ?? '';
        
        // Nome de Exibição
        $displayName = $data['name'] ?? trim(($data['given_name'] ?? '') . ' ' . ($data['family_name'] ?? ''));
        if (empty($displayName)) {
            $displayName = $email ? explode('@', $email)[0] : 'Usuário SSO';
        }

        // Username
        $username = $data['preferred_username'] ?? ($email ? explode('@', $email)[0] : '');
        if (empty($username)) {
            $username = 'sso_' . substr(md5($email ?: ($data['sub'] ?? uniqid())), 0, 8);
        }

        // Sanitização simples de username
        $username = mb_strtolower(preg_replace('/[^a-zA-Z0-9._-]/', '', $username) ?: 'sso_user');

        return [
            'username'     => $username,
            'display_name' => $displayName,
            'email'        => $email,
            'auth_provider'=> 'sso',
        ];
    }
}
