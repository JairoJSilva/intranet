# 📝 RMT-20260911-04: Autenticação SSO Moderna (OAuth2 / OIDC) e Alertas Operacionais no Navegador

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-11  
> **Autor / Agente Responsável**: Antigravity AI / @SecOpsEngineer & @FullstackDeveloper  
> **Tipo de Mudança**: Feature / Architecture / Security / UI-UX  
> **Versão Afetada**: v1.2.0  
> **Branch**: `melhorias`  

---

## 1. 🎯 Contexto e Motivação
Com a evolução e consolidação do portal corporativo **Omniflowti**, duas necessidades operacionais e de governança foram priorizadas:

1. **🔑 Autenticação SSO Moderna (OAuth2 / OpenID Connect)**:
   - Integração com provedores de identidade corporativos modernos (Microsoft Entra ID / Azure AD, Keycloak, Google Workspace e Okta).
   - Manutenção de 100% de retrocompatibilidade com a autenticação local e Active Directory (LDAP), sem quebras.
   - Auto-provisionamento seguro de contas com sanitização de claims, persistência de `auth_provider = 'sso'` e auditoria completa na tabela `audit_log`.
   - Proteção de segurança contra CSRF e replay attacks via parâmetros `state` e `nonce` assinados criptograficamente na sessão.

2. **🔔 Alertas Operacionais no Navegador (Web Notifications API)**:
   - Notificações em tempo real diretamente na área de trabalho do operador/administrador quando serviços e links monitorados apresentarem instabilidade (`offline` ou `warning`).
   - Central de Notificações interativa no Topbar (ícone de sino com contador pulsante, popover de histórico de incidentes recentes e controle de permissões nativas).
   - Ausência intencional de dependências externas (Slack/Teams/webhooks), rodando 100% no cliente com persistência de histórico local no navegador via `localStorage`.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/src/Config/Sso.php` | Criado | Classe de configuração e validação dos parâmetros de SSO/OAuth2 a partir do `.env`. |
| `aplicação/src/Services/SsoAuthStrategy.php` | Criado | Estratégia de autenticação OAuth2/OIDC com state/nonce anti-CSRF, troca de authorization code via cURL e normalização de claims. |
| `aplicação/src/Services/AuthService.php` | Modificado | Métodos `getSsoAuthorizationUrl()`, `handleSsoCallback()`, auto-provisionamento de usuários SSO e registro em auditoria. |
| `aplicação/src/Controllers/AuthController.php` | Modificado | Endpoints `ssoConfig()`, `ssoRedirect()` e `ssoCallback()` com redirecionamento amigável. |
| `aplicação/src/routes.php` | Modificado | Mapeamento das rotas públicas `/api/auth/sso/config`, `/api/auth/sso/redirect` e `/api/auth/sso/callback`. |
| `database/schema.sql` | Modificado | Extensão da coluna `users.auth_provider` de `ENUM('local','ldap')` para `ENUM('local','ldap','sso')`. |
| `aplicação/.env.example` | Modificado | Template de variáveis de ambiente do SSO (`SSO_ENABLED`, `SSO_PROVIDER`, URLs, Client ID/Secret). |
| `aplicação/.env` | Modificado | Parâmetros de SSO configurados localmente (desabilitado por padrão seguro). |
| `aplicação/public/assets/js/components/NotificationManager.js` | Criado | Singleton gerenciador de incidentes, Web Notifications API nativa, badge e popover. |
| `aplicação/public/index.html` | Modificado | Inclusão do script `NotificationManager.js` no bundle de componentes. |
| `aplicação/public/assets/js/api.js` | Modificado | Inclusão do método `getSsoConfig()` no cliente HTTP. |
| `aplicação/public/assets/js/components/LoginForm.js` | Modificado | Renderização dinâmica do divisor e botão de SSO corporativo com detecção de IdP e exibição de erros. |
| `aplicação/public/assets/js/components/Topbar.js` | Modificado | Inclusão do botão de sino de notificações com badge dinâmico, popover e gatilho de incidentes no health check. |
| `aplicação/public/assets/js/components/PanelManager.js` | Modificado | Abertura direta de sistemas/links corporativos ao clicar em qualquer ponto do card (`app-tile`). |
| `aplicação/public/assets/js/components/Dashboard.js` | Modificado | Disparo de alertas operacionais no navegador ao concluir health check e clique direto nos cards de acesso rápido. |
| `aplicação/public/assets/css/app.css` | Modificado | Estilização Glassmorphism do popover de notificações, animações do badge pulsante e botões SSO. |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Backend
- **Configuração Segura**: `App\Config\Sso` carrega e normaliza dados do IdP a partir de variáveis de ambiente, provendo `isEnabled()`, `getProvider()`, `getConfig()`.
- **Estratégia OIDC/OAuth2 (`SsoAuthStrategy`)**:
  - `getAuthorizationUrl($redirectUri)`: gera URLs contendo `client_id`, `response_type=code`, `scope`, `state` (16 bytes random) e `nonce` (16 bytes random) gravados em `$_SESSION`.
  - `handleCallback($code, $state, $redirectUri)`: valida `hash_equals` entre o state recebido e o gravado na sessão. Executa chamada `POST` via cURL com `Content-Type: application/x-www-form-urlencoded` para obtenção do `access_token` e `id_token`.
  - Normaliza claims de usuários vindos do endpoint `/userinfo` ou do `id_token` JWT payload base64 (suporta `sub`, `email`, `preferred_username`, `name`, `given_name`).
- **Autenticação e Provisionamento (`AuthService`)**:
  - `handleSsoCallback($code, $state, $redirectUri)`: busca usuário por e-mail ou username.
  - Se o usuário não existir, executa `autoProvisionSso()` gerando conta ativa com `auth_provider = 'sso'`, associando-o ao grupo corporativo padrão configurado (`Colaboradores`).
  - Registra o evento de criação e login na tabela `audit_log`.
  - Inicia sessão PHP padrão e segura (`session_regenerate_id(true)`).

### 3.2. Frontend
- **NotificationManager (`NotificationManager.js`)**:
  - Gerencia o ciclo de vida dos incidentes detectados durante health checks.
  - Solicitação explícita de permissão via banner no popover ou botão acionador, sem spam de permissões.
  - Integração com `new Notification(title, options)` com clique direcionando para o painel de links afetado.
  - Armazena histórico local dos últimos 25 alertas operacionais com persistência em `localStorage` (`omniflowti_operational_alerts`).
  - Badge numérico na Topbar com contagem de alertas não lidos e animação `@keyframes notifPulse`.
- **Login com SSO (`LoginForm.js`)**:
  - Ao carregar a tela de login, consulta assincronamente `/api/auth/sso/config`.
  - Se ativado, injeta elegantemente um divisor e botão estilizado com ícone correspondente à tecnologia do IdP (Microsoft/Windows, Keycloak, Google, Okta).
  - Trata parâmetros de erro redirecionados pelo backend (`sso_error`) exibindo mensagem amigável no card de login.
- **Topbar & Dashboard**:
  - Topbar agora possui a Central de Alertas ao lado do botão de health check manual.
  - O botão de verificação no Topbar e no Dashboard acionam `NotificationManager.notifyIncident(item)` para cada serviço offline/warning retornado.

### 3.3. Banco de Dados / Persistência
- **Schema DDL**:
  ```sql
  ALTER TABLE `users` 
  MODIFY COLUMN `auth_provider` ENUM('local','ldap','sso') NOT NULL DEFAULT 'local';
  ```
- **Índice existente mantido**: `idx_users_provider (auth_provider)`.

### 3.4. Infraestrutura & DevOps
- Inclusão das variáveis de configuração corporativa no `.env.example`:
  ```env
  SSO_ENABLED=false
  SSO_PROVIDER=azure
  SSO_PROVIDER_NAME="Microsoft Entra ID"
  SSO_CLIENT_ID=""
  SSO_CLIENT_SECRET=""
  SSO_AUTHORIZE_URL=""
  SSO_TOKEN_URL=""
  SSO_USERINFO_URL=""
  SSO_SCOPES="openid profile email"
  SSO_DEFAULT_GROUP="Colaboradores"
  ```

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não. Usuários locais e LDAP continuam se autenticando exatamente como antes. A opção de SSO é aditiva e opera em conjunto ou isolada.
- **Variáveis de Ambiente**: Novas variáveis descritas acima adicionadas ao `.env.example` e ao `.env`.
- **Migrações / Seeders**: Em ambientes MySQL pré-existentes, basta executar a alteração da coluna `auth_provider` descrita na seção 3.3.
- **Compatibilidade com navegadores**: O NotificationManager valida a existência de `window.Notification` antes de qualquer chamada nativa, garantindo fallback gracioso para navegadores que bloqueiam ou não suportam notificações desktop.

---

## 5. 🧪 Testes e Validação
- [x] Validação sintática e de tipagem estrita nos arquivos PHP (`Sso.php`, `SsoAuthStrategy.php`, `AuthService.php`, `AuthController.php`).
- [x] Verificação do carregamento de configurações de SSO via endpoint `/api/auth/sso/config`.
- [x] Verificação do botão dinâmico de SSO no formulário de login com fallback transparente quando desativado.
- [x] Teste de renderização do sino de notificações e abertura/fechamento do popover no Topbar.
- [x] Teste de integração do gatilho `notifyIncident` com health checks retornando links degradados ou offline.
- [x] Teste de persistência de alertas e contadores não lidos no `localStorage`.

---

## 6. 📌 Referências e Links Relacionados
- Plano de Implementação Aprovado: `implementation_plan.md`
- RMT Anterior: [RMT-20260911-03](RMT-20260911-03-funcionalidade-paineis-favoritos-fixados-sidebar.md)
- Branch: `melhorias`
