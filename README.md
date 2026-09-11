# 🌐 Omniflowti — Portal Unificado Corporativo

Portal unificado para centralizar todas as aplicações internas da empresa em um único ponto de acesso. Construído com **PHP 8.2+**, **MySQL 8.0**, **Vanilla JS** e design system **VEM** com tema dark nativo.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|:---|:---|
| 🔐 **Autenticação Híbrida** | Login via Active Directory (LDAP) + contas locais com auto-provisionamento |
| 👥 **RBAC N:N** | Modelo de permissões Usuário ↔ Grupos ↔ Painéis ↔ Links |
| 📊 **Dashboard Executivo** | Métricas em tempo real: uptime, sistemas online/offline, disponibilidade |
| ❤️ **Health Check** | Monitoramento assíncrono via cURL multi com timeout de 2000ms |
| 🎨 **Design System VEM** | Dark mode nativo, glassmorphism, micro-animações, Poppins + Remix Icons |
| 📥 **Import CSV** | Importação em lote de usuários via arquivo CSV |
| 📋 **Auditoria** | Log automático de todas as ações com IP e user-agent |
| 🐳 **Docker Ready** | Docker Compose com App + MySQL + phpMyAdmin |

## 🏗️ Arquitetura

```
                           ┌─────────────────────────────┐
                           │   Frontend SPA (Vanilla JS)  │
                           │   Poppins • Remix Icons       │
                           │   Dark Mode • Glassmorphism   │
                           └───────────┬─────────────────┘
                                       │ REST API
                           ┌───────────▼─────────────────┐
                           │   Backend PHP 8.2+ (PSR-4)   │
                           │   Controllers → Services      │
                           │   → Repositories → PDO        │
                           └───────────┬─────────────────┘
                                       │
                           ┌───────────▼─────────────────┐
                           │       MySQL 8.0 (utf8mb4)     │
                           │   RBAC N:N • Audit Log        │
                           └───────────────────────────────┘
```

## 🚀 Quick Start (Docker)

```bash
# 1. Clone o repositório
git clone <repo-url> intranet && cd intranet

# 2. Suba os containers
cd docker && docker compose up -d --build

# 3. Aguarde o MySQL inicializar (~30s) e regenere as senhas
docker exec flowti-app php src/seed.php

# 4. Acesse
# App:        http://localhost:8080
# phpMyAdmin:  http://localhost:8081
```

### Credenciais Padrão

| Usuário | Senha | Perfil |
|:--------|:------|:-------|
| `admin` | `Admin@Flowti2024` | Administrador (acesso total) |
| `suporte` | `Suporte@Flowti2024` | Supervisor (TIC) |
| `usuario` | `Usuario@Flowti2024` | Colaborador (Financeiro) |

## 📁 Estrutura do Projeto

```
intranet/
├── aplicação/               # Código-fonte da aplicação
│   ├── public/              # Document Root (Apache)
│   │   ├── index.html       # SPA Entry Point
│   │   ├── index.php        # API Entry Point
│   │   └── assets/          # CSS, JS, Imagens
│   └── src/                 # Backend PHP (PSR-4)
│       ├── Config/          # Database, Env, LDAP
│       ├── Controllers/     # REST Controllers
│       ├── Middleware/       # Auth, Admin, CORS
│       ├── Repositories/    # Data Access (PDO)
│       ├── Services/        # Business Logic
│       └── Helpers/         # Response, Validator
├── database/                # Schema DDL + Seed SQL
├── docker/                  # Dockerfile + docker-compose
├── agents/                  # Definições de agentes AI
├── Documentações/           # ADRs e docs técnicos
└── id-visual/               # Design tokens VEM
```

## 🔧 Configuração LDAP/AD

Edite o arquivo `aplicação/.env`:

```env
LDAP_ENABLED=true
LDAP_HOST=ldap://ad.suaempresa.com.br
LDAP_PORT=389
LDAP_BASE_DN=dc=suaempresa,dc=com,dc=br
LDAP_BIND_DN=cn=svc-intranet,ou=Service Accounts,dc=suaempresa,dc=com,dc=br
LDAP_BIND_PASS=sua-senha-segura
LDAP_SEARCH_FILTER=(sAMAccountName={username})
LDAP_DEFAULT_GROUP=Colaboradores
```

O primeiro login via AD auto-provisiona o usuário localmente.

## 🛡️ Modelo de Permissões (RBAC)

| Perfil | Visualização | Gestão de Links/Painéis | Gestão de Usuários |
|:-------|:------------|:-----------------------|:------------------|
| **Administrador** | Bypass Global (tudo) | ✅ Todos | ✅ Completa |
| **Supervisor** | Apenas seus grupos | ✅ Apenas seus setores | ❌ |
| **Colaborador** | Apenas seus grupos | ❌ | ❌ |

## 📡 API REST

Documentação completa dos endpoints disponível em `aplicação/src/routes.php`.

| Método | Rota | Auth | Permissão |
|--------|------|:----:|:---------:|
| `POST` | `/api/auth/login` | — | — |
| `POST` | `/api/auth/logout` | ✅ | — |
| `GET` | `/api/auth/me` | ✅ | — |
| `GET` | `/api/panels` | ✅ | RBAC filtered |
| `POST` | `/api/health/check` | ✅ | — |
| `GET/POST/PUT/DELETE` | `/api/users/*` | ✅ | Admin |
| `GET/POST/PUT/DELETE` | `/api/groups/*` | ✅ | Admin |
| `POST/PUT/DELETE` | `/api/panels/*` | ✅ | Supervisor+ |
| `POST/PUT/DELETE` | `/api/links/*` | ✅ | Supervisor+ |

## 📄 Licença

Proprietary — © Flowti
