<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\GroupRepository;
use App\Repositories\AuditLogRepository;
use App\Config\Ldap;
use App\Config\Sso;

/**
 * Serviço de autenticação com Strategy Pattern.
 * Suporta Local, LDAP/AD e SSO Moderno (OAuth2 / OIDC).
 * Auto-provisionamento de usuários vindos do AD ou SSO no primeiro login.
 */
final class AuthService
{
    private UserRepository $userRepo;
    private GroupRepository $groupRepo;
    private AuditLogRepository $auditRepo;
    private LocalAuthStrategy $localAuth;
    private LdapAuthStrategy $ldapAuth;
    private SsoAuthStrategy $ssoAuth;

    public function __construct()
    {
        $this->userRepo  = new UserRepository();
        $this->groupRepo = new GroupRepository();
        $this->auditRepo = new AuditLogRepository();
        $this->localAuth = new LocalAuthStrategy();
        $this->ldapAuth  = new LdapAuthStrategy();
        $this->ssoAuth   = new SsoAuthStrategy();
    }

    /**
     * Tenta autenticar o usuário (LDAP → Local)
     * 
     * @return array Dados do usuário autenticado
     * @throws \RuntimeException Se autenticação falhar
     */
    public function login(string $username, string $password): array
    {
        // Validação básica
        if (empty($username) || empty($password)) {
            throw new \RuntimeException('Usuário e senha são obrigatórios.');
        }

        $user = null;

        // 1. Tentar LDAP/AD (se habilitado)
        if (Ldap::isEnabled()) {
            $ldapData = $this->ldapAuth->authenticate($username, $password);

            if ($ldapData !== false) {
                // Busca ou cria o usuário localmente (auto-provisionamento)
                $user = $this->userRepo->findByUsername($username);

                if ($user === null) {
                    // Primeiro login via AD — cria usuário local
                    $userId = $this->autoProvision($ldapData);
                    $user = $this->userRepo->findByUsername($username);
                } else {
                    // Atualiza dados do AD se necessário
                    $this->userRepo->update((int)$user['id'], [
                        'display_name' => $ldapData['display_name'],
                        'email'        => $ldapData['email'],
                    ]);
                    $user = $this->userRepo->findByUsername($username);
                }
            }
        }

        // 2. Fallback: autenticação local
        if ($user === null) {
            $user = $this->userRepo->findByUsername($username);

            if ($user === null) {
                throw new \RuntimeException('Credenciais inválidas.');
            }

            if ($user['auth_provider'] === 'ldap') {
                throw new \RuntimeException('Este usuário deve autenticar via Active Directory.');
            }

            if (empty($user['password_hash']) || !$this->localAuth->verify($password, $user['password_hash'])) {
                throw new \RuntimeException('Credenciais inválidas.');
            }

            // Rehash se necessário (atualização de algoritmo)
            if ($this->localAuth->needsRehash($user['password_hash'])) {
                $this->userRepo->update((int)$user['id'], [
                    'password_hash' => $this->localAuth->hashPassword($password),
                ]);
            }
        }

        // 3. Validações pós-autenticação
        if (!$user['is_active']) {
            throw new \RuntimeException('Conta desativada. Contate o administrador.');
        }

        // 4. Registrar login
        $this->userRepo->updateLastLogin((int)$user['id']);

        // 5. Criar sessão
        $this->createSession($user);

        // 6. Auditoria
        $this->auditRepo->log((int)$user['id'], 'login');

        // Retorna dados seguros (sem hash)
        unset($user['password_hash']);
        $user['groups'] = $this->userRepo->getUserGroups((int)$user['id']);

        return $user;
    }

    /**
     * Encerra a sessão do usuário
     */
    public function logout(): void
    {
        $userId = $_SESSION['user_id'] ?? null;

        if ($userId) {
            $this->auditRepo->log((int)$userId, 'logout');
        }

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();
    }

    /**
     * Retorna dados do usuário logado na sessão atual
     */
    public function getCurrentUser(): ?array
    {
        if (empty($_SESSION['user_id'])) {
            return null;
        }

        $user = $this->userRepo->findById((int)$_SESSION['user_id']);

        if ($user === null) {
            return null;
        }

        return $user;
    }

    /**
     * Auto-provisiona um usuário vindo do AD
     */
    private function autoProvision(array $ldapData): int
    {
        $userId = $this->userRepo->create([
            'username'      => $ldapData['username'],
            'display_name'  => $ldapData['display_name'],
            'email'         => $ldapData['email'],
            'password_hash' => null,
            'auth_provider' => 'ldap',
            'is_admin'      => false,
            'is_supervisor' => false,
            'is_active'     => true,
        ]);

        // Associa ao grupo padrão do LDAP
        $defaultGroup = Ldap::getConfig()['default_group'];
        $group = $this->groupRepo->findBySlug($this->slugify($defaultGroup));

        if ($group) {
            $this->userRepo->syncGroups($userId, [(int)$group['id']]);
        }

        $this->auditRepo->log($userId, 'create', 'user', $userId, null, [
            'source' => 'ldap_auto_provision',
            'username' => $ldapData['username'],
        ]);

        return $userId;
    }

    /**
     * Retorna a URL para redirecionamento ao Identity Provider SSO
     */
    public function getSsoAuthorizationUrl(string $redirectUri): string
    {
        if (!Sso::isEnabled()) {
            throw new \RuntimeException('Autenticação SSO não está habilitada.');
        }

        return $this->ssoAuth->getAuthorizationUrl($redirectUri);
    }

    /**
     * Processa o retorno do SSO, autentica ou auto-provisiona o usuário e cria a sessão
     */
    public function handleSsoCallback(string $code, string $state, string $redirectUri): array
    {
        if (!Sso::isEnabled()) {
            throw new \RuntimeException('Autenticação SSO não está habilitada.');
        }

        $ssoData = $this->ssoAuth->handleCallback($code, $state, $redirectUri);

        // Busca o usuário local por e-mail ou username
        $user = null;
        if (!empty($ssoData['email'])) {
            $user = $this->userRepo->findByEmail($ssoData['email']);
        }

        if ($user === null && !empty($ssoData['username'])) {
            $user = $this->userRepo->findByUsername($ssoData['username']);
        }

        if ($user === null) {
            // Primeiro acesso via SSO — auto-provisionamento
            $userId = $this->autoProvisionSso($ssoData);
            $user = $this->userRepo->findById($userId);
        } else {
            // Atualiza dados e provider se necessário
            $updates = [];
            if (!empty($ssoData['display_name']) && $ssoData['display_name'] !== $user['display_name']) {
                $updates['display_name'] = $ssoData['display_name'];
            }
            if (!empty($updates)) {
                $this->userRepo->update((int)$user['id'], $updates);
                $user = $this->userRepo->findById((int)$user['id']);
            }
        }

        if (!$user['is_active']) {
            throw new \RuntimeException('Conta desativada. Contate o administrador.');
        }

        // Atualiza último login
        $this->userRepo->updateLastLogin((int)$user['id']);

        // Cria sessão
        $this->createSession($user);

        // Auditoria
        $this->auditRepo->log((int)$user['id'], 'login', 'user', (int)$user['id'], null, [
            'auth_method' => 'sso',
            'provider'    => Sso::getProvider(),
        ]);

        unset($user['password_hash']);
        $user['groups'] = $this->userRepo->getUserGroups((int)$user['id']);

        return $user;
    }

    /**
     * Auto-provisiona um usuário vindo do SSO
     */
    private function autoProvisionSso(array $ssoData): int
    {
        // Garante username único caso já exista
        $baseUsername = $ssoData['username'] ?: 'sso_user';
        $username = $baseUsername;
        $counter = 1;
        while ($this->userRepo->findByUsername($username) !== null) {
            $username = "{$baseUsername}_{$counter}";
            $counter++;
        }

        $userId = $this->userRepo->create([
            'username'      => $username,
            'display_name'  => $ssoData['display_name'],
            'email'         => $ssoData['email'],
            'password_hash' => null,
            'auth_provider' => 'sso',
            'is_admin'      => false,
            'is_supervisor' => false,
            'is_active'     => true,
        ]);

        // Associa ao grupo padrão do SSO
        $defaultGroup = Sso::getConfig()['default_group'] ?? 'Colaboradores';
        $group = $this->groupRepo->findBySlug($this->slugify($defaultGroup));

        if ($group) {
            $this->userRepo->syncGroups($userId, [(int)$group['id']]);
        }

        $this->auditRepo->log($userId, 'create', 'user', $userId, null, [
            'source'   => 'sso_auto_provision',
            'provider' => Sso::getProvider(),
            'email'    => $ssoData['email'],
        ]);

        return $userId;
    }

    /**
     * Cria sessão segura para o usuário
     */
    private function createSession(array $user): void
    {
        // Regenera o ID de sessão para prevenir fixation
        session_regenerate_id(true);

        $_SESSION['user_id']       = (int)$user['id'];
        $_SESSION['username']      = $user['username'];
        $_SESSION['display_name']  = $user['display_name'];
        $_SESSION['email']         = $user['email'];
        $_SESSION['is_admin']      = (bool)$user['is_admin'];
        $_SESSION['is_supervisor'] = (bool)$user['is_supervisor'];
        $_SESSION['logged_in_at']  = time();
    }

    /**
     * Converte string para slug URL-friendly
     */
    private function slugify(string $text): string
    {
        $text = mb_strtolower($text, 'UTF-8');
        $text = preg_replace('/[^a-z0-9\s-]/', '', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text) ?: $text);
        $text = preg_replace('/[\s-]+/', '-', $text);
        return trim($text, '-');
    }
}
