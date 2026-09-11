# 🚀 Omniflowti — Task List

## Phase 1: Database
- [ ] `database/schema.sql` — DDL completo
- [ ] `database/seed.sql` — Seed com admin, suporte, usuario

## Phase 2: Backend Foundation
- [ ] `aplicação/composer.json` — PSR-4 autoload
- [ ] `aplicação/.env.example` e `aplicação/.env`
- [ ] `aplicação/src/Config/Env.php`
- [ ] `aplicação/src/Config/Database.php`
- [ ] `aplicação/src/Config/Ldap.php`
- [ ] `aplicação/src/Helpers/Response.php`
- [ ] `aplicação/src/Helpers/Validator.php`
- [ ] `aplicação/src/bootstrap.php`

## Phase 3: Backend — Middleware
- [ ] `aplicação/src/Middleware/CorsMiddleware.php`
- [ ] `aplicação/src/Middleware/AuthMiddleware.php`
- [ ] `aplicação/src/Middleware/AdminMiddleware.php`
- [ ] `aplicação/src/Middleware/SupervisorMiddleware.php`

## Phase 4: Backend — Repositories
- [ ] `aplicação/src/Repositories/UserRepository.php`
- [ ] `aplicação/src/Repositories/GroupRepository.php`
- [ ] `aplicação/src/Repositories/PanelRepository.php`
- [ ] `aplicação/src/Repositories/LinkRepository.php`
- [ ] `aplicação/src/Repositories/AuditLogRepository.php`

## Phase 5: Backend — Services
- [ ] `aplicação/src/Services/LocalAuthStrategy.php`
- [ ] `aplicação/src/Services/LdapAuthStrategy.php`
- [ ] `aplicação/src/Services/AuthService.php`
- [ ] `aplicação/src/Services/UserService.php`
- [ ] `aplicação/src/Services/GroupService.php`
- [ ] `aplicação/src/Services/PanelService.php`
- [ ] `aplicação/src/Services/LinkService.php`
- [ ] `aplicação/src/Services/HealthCheckService.php`

## Phase 6: Backend — Controllers & Router
- [ ] `aplicação/src/Controllers/AuthController.php`
- [ ] `aplicação/src/Controllers/UserController.php`
- [ ] `aplicação/src/Controllers/GroupController.php`
- [ ] `aplicação/src/Controllers/PanelController.php`
- [ ] `aplicação/src/Controllers/LinkController.php`
- [ ] `aplicação/src/Controllers/HealthController.php`
- [ ] `aplicação/src/routes.php`
- [ ] `aplicação/public/index.php` — API entry point
- [ ] `aplicação/public/.htaccess`

## Phase 7: Frontend — SPA
- [ ] `aplicação/public/index.html`
- [ ] `aplicação/public/assets/css/app.css`
- [ ] `aplicação/public/assets/js/api.js`
- [ ] `aplicação/public/assets/js/state.js`
- [ ] `aplicação/public/assets/js/router.js`
- [ ] `aplicação/public/assets/js/components/Toast.js`
- [ ] `aplicação/public/assets/js/components/Modal.js`
- [ ] `aplicação/public/assets/js/components/Sidebar.js`
- [ ] `aplicação/public/assets/js/components/Topbar.js`
- [ ] `aplicação/public/assets/js/components/LoginForm.js`
- [ ] `aplicação/public/assets/js/components/Dashboard.js`
- [ ] `aplicação/public/assets/js/components/PanelGrid.js`
- [ ] `aplicação/public/assets/js/components/LinkCard.js`
- [ ] `aplicação/public/assets/js/components/UserManager.js`
- [ ] `aplicação/public/assets/js/components/GroupManager.js`
- [ ] `aplicação/public/assets/js/app.js`

## Phase 8: Docker & Docs
- [ ] `docker/Dockerfile`
- [ ] `docker/docker-compose.yml`
- [ ] `README.md`
- [ ] `Documentações/ADR-001-stack-php-mysql.md`
- [ ] `id-visual/tokens.json`
