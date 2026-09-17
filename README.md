# 🌐 Flowti Hub — Portal Unificado Corporativo

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/JairoJSilva/intranet)
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue.svg)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![QA Tests](https://img.shields.io/badge/tests-52%2F52%20passed%20(100%25)-success.svg)](tests/api_test.php)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#)

Portal corporativo unificado desenvolvido para centralizar todos os sistemas, links e acessos internos da empresa em um ponto de entrada moderno, rápido e seguro. Construído com **PHP 8.2+ (Clean Architecture)**, **MySQL 8.0**, **Vanilla JS SPA** e design system corporativo de alta tecnologia alinhado ao ecossistema Flowti.

---

## 🚀 Novidades Recentes (v2.1 / Flowti Hub)

- ⚡ **Nova Tela de Login Cyber Imersiva & Identidade Flowti Hub**:
  - **Identidade Oficial Flowti Hub**: Novo logotipo vetorial oficial [`flowti-hub-logo.svg`](aplicação/public/assets/img/flowti-hub-logo.svg) e imagem transparente [`logo_flowti_branca.png`](aplicação/public/assets/img/logo_flowti_branca.png).
  - **Laser Boot Sequence (`#lp-boot`)**: Linha de scanline laser azul descendo a tela, progresso procedural e inicialização de ambiente.
  - **Wipe Panel 2D em Perspectiva (`#lp-wipe`)**: Painel translúcido em perspectiva com badge **HUB** dotado de contorno animado contínuo em neon azul/ciano via SVG trace.
  - **Fluxo de Solicitação de Acesso (Active Directory)**: Transição fluida entre formulário de login e solicitação de acesso auditada no backend (`POST /api/auth/request`).
  - **Success Veil Overlay (`#lp-veil`)**: Animação de sucesso com anel circular de autorização de acesso e redirecionamento suave.
- 🎨 **Tema Padrão Aura Electric Dark com Glassmorphism**:
  - Paleta baseada em preto profundo (`#0B0A0A`) com gradientes neon elétricos violeta (`#AB17EE`, `#8129A9`, `#360F5A`).
  - Efeito translúcido com jateamento de vidro (`backdrop-filter: blur(16px)`), elevações suaves e brilho neon.
  - Tipografia de alta tecnologia (**Space Grotesk** para títulos e **Inter** para leitura de monitoramento).
- 📥 **Importação em Massa de Links via .CSV (`POST /api/links/import-csv`)**:
  - Suporte completo para planilhas brasileiras e internacionais com autodetecção inteligente de delimitador (`;` ou `,`).
  - Mapeamento flexível de cabeçalhos em português e inglês (`titulo`/`title`, `url`/`link`, `descricao`/`description`, `icone`/`icon`).
  - Modal interativo com drag & drop, download de modelo `.csv` oficial, campo para colar texto diretamente e pré-visualização em tempo real em tabela.
  - Auto-correção de URLs (prefixa automaticamente com `https://` se o usuário esquecer o protocolo).
- 📂 **Nova Arquitetura de Navegação de Painéis**:
  - **Catálogo em Cards (`#/panels`)**: Grade com cartões corporativos de cada painel/setor, métricas de aplicações e acesso direto.
  - **Página Dedicada do Painel (`#/panels/:id`)**: Ao clicar em qualquer painel (como *DevOps*, *Portal-OCI*, *Sistemas Flowti*), o usuário é direcionado para uma tela exclusiva exibindo apenas os links daquele setor.
  - Alternador dinâmico de visualização: **Grade de Aplicações (Tiles)** ou **Tabela Corporativa**.
- 🌐 **Nova Logo Oficial Flowti**:
  - Integração do vetor oficial SVG [flowti-label.svg](id-visual/flowti-label.svg) na barra lateral atuando como atalho interativo para a **Home (`#/dashboard`)** e na tela de login.
- 🎨 **Multi-Temas Dark Mode Integrados (Sem temas claros)**:
  - **Aura Electric Dark** (Padrão Oficial com Glassmorphism)
  - **Electric Ultramarine & Aqua** (Inspirado em `guia-de-estilo-ultramarine.md` — Cyber Navy & Violet)
  - **Dark Mode Tech Neon** (Preto fosco `#121212` com Roxo Elétrico `#6200EA` e Verde Neon `#00E676`)
  - **Safira Night** (Slate Dark com Azul Safira `#0178C8` e Âmbar solar `#F67F1D`)
  - **Terracota Solar** (Gradiente quente de terracota coral `#E75B32` e laranja solar `#F67F1D`)
  - **Flowti Observability** (Monitoramento com Flowti Cyan `#00C4BF` e Coral `#F05A28`)
  - **MV Saúde & Tecnologia** (Verde Esmeralda `#008C77` e Azul Petróleo `#214B63`)
  - **MV Azul Petróleo** (Azul clássico institucional `#214B63`)
  - **Midnight Observability** (Preto puro OLED para NOC)
- 🖥️ **Correção Total de Layout e Responsividade**:
  - Correção de cálculo de largura da área principal (`calc(100% - var(--sidebar-width))`), eliminando 100% de qualquer corte de tela ou scroll horizontal indesejado.
  - Quebra de palavra forçada para URLs longas de cloud e consoles corporativos.
- 🧪 **Suíte de Testes Automatizados QA**:
  - 52 casos de teste cobrindo autenticação, RBAC, CRUD, integridade de painéis, health check e importação CSV (100% de sucesso).

---

## ✨ Funcionalidades Principais

| Funcionalidade | Descrição |
|:---|:---|
| 🔐 **Autenticação Híbrida** | Login integrado via Active Directory (LDAP/AD) + contas locais com auto-provisionamento |
| 👥 **RBAC N:N Granular** | Permissões por perfil (Admin, Supervisor, Colaborador) e por grupo (`can_manage_links`, `can_manage_members`) |
| 📊 **Dashboard Executivo** | Métricas operacionais em tempo real: uptime, aplicações ativas, distribuição por setor e disponibilidade |
| ❤️ **Health Check Assíncrono** | Monitoramento de disponibilidade e latência de rede via multi-cURL com detecção automática de falhas |
| 📥 **Importação em Lote CSV** | Upload rápido de links por arquivo `.csv` ou colagem direta com preview instantâneo |
| 🎨 **Design System Moderno** | Aura Glassmorphism com 9 temas selecionáveis nas propriedades do usuário |
| 📋 **Auditoria Completa** | Log automático de auditoria para todas as operações críticas com registro de IP, data e usuário |
| 🐳 **Pronto para Docker** | Ambiente conteinerizado com PHP 8.2 Apache + MySQL 8.0 + phpMyAdmin |

---

## 🏗️ Arquitetura do Sistema

```
                           ┌─────────────────────────────────────────┐
                           │      Frontend SPA (Vanilla JS)          │
                           │   Space Grotesk • Inter • RemixIcon     │
                           │   Aura Glassmorphism • Dynamic Router   │
                           └────────────────────┬────────────────────┘
                                                │ REST API (JSON / Multipart)
                           ┌────────────────────▼────────────────────┐
                           │      Backend PHP 8.2+ (Clean Arch)      │
                           │   Controllers  ──►  Services            │
                           │   Middleware   ──►  Repositories ──► PDO│
                           └────────────────────┬────────────────────┘
                                                │
                           ┌────────────────────▼────────────────────┐
                           │         MySQL 8.0 (utf8mb4)             │
                           │   RBAC N:N • Audit Logs • App Links     │
                           └─────────────────────────────────────────┘
```

---

## 🚀 Como Executar Localmente (Docker)

### 1. Clonar o repositório
```bash
git clone https://github.com/JairoJSilva/intranet.git
cd intranet
```

### 2. Iniciar os containers
```bash
cd docker && docker compose up -d --build
```

### 3. Acessar a aplicação
- **Portal Unificado:** [http://localhost:8080](http://localhost:8080)
- **phpMyAdmin (Banco de Dados):** [http://localhost:8081](http://localhost:8081)

---

## 🔑 Credenciais Padrão

| Usuário | Senha | Perfil | Setor Associado |
|:--------|:------|:-------|:----------------|
| `admin` | `Admin@Flowti2024` | **Administrador** (Acesso total global) | Todos os setores |
| `suporte` | `Suporte@Flowti2024` | **Supervisor** (Gestão de links) | TIC / Suporte |
| `usuario` | `Usuario@Flowti2024` | **Colaborador** (Acesso padrão) | Financeiro |

---

## 📥 Formato do Arquivo CSV para Importação de Links

Ao importar links em massa via arquivo `.csv` no portal ([#/panels](http://localhost:8080/#/panels)), o sistema aceita delimitador por vírgula (`,`) ou ponto-e-vírgula (`;`):

```csv
titulo;url;descricao;icone
Portal ERP;https://erp.suaempresa.com.br;Sistema de Gestão Financeiro;ri-server-line
Monitoramento Grafana;grafana.suaempresa.com.br;Dashboards de infra e métricas;ri-dashboard-line
GitLab CI/CD;https://gitlab.suaempresa.com.br;Repositórios e pipelines de entrega;ri-git-branch-line
Central de Suporte;https://suporte.suaempresa.com.br;Abertura de chamados internos;ri-customer-service-2-line
```

> **Dica**: A coluna de URL não exige obrigatoriamente o prefixo `https://` — o sistema corrige e adiciona o protocolo de segurança automaticamente durante a importação.

---

## 🧪 Execução de Testes Automatizados

O repositório possui uma suíte completa de testes de integração, segurança e RBAC:

```bash
# Execução direta dentro do container Docker
docker exec flowti-app php tests/api_test.php
```

Resultado da execução:
```
============================================================
🧪 Omniflowti — Suíte de Testes Automatizados (QA Tester)
============================================================
[1/4] Suíte de Autenticação & Segurança de Sessão (9 testes)    ✔ PASS
[2/4] Suíte de Controle de Acesso & RBAC (10 testes)             ✔ PASS
[3/4] Suíte de Integridade dos Links e Pastas (13 testes)        ✔ PASS
[4/4] Suíte de Monitoramento & Health Check (4 testes)           ✔ PASS
[5/5] Suíte de Permissões Granulares por Grupo (8 testes)        ✔ PASS
[6]   Suíte de Importação em Massa de Links via CSV (5 testes)   ✔ PASS
============================================================
📊 Resumo da Execução de Testes:
  Total de Casos de Teste: 52
  Aprovados (Passed):    52 (100% de sucesso!)
  Falhas (Failed):       0
============================================================
```

---

## 📁 Estrutura de Diretórios

```
intranet/
├── aplicação/                    # Código-fonte da aplicação
│   ├── public/                   # Document Root (Apache)
│   │   ├── index.html            # SPA Entry Point & Anti-FOUT
│   │   ├── index.php             # API Front-Controller
│   │   └── assets/
│   │       ├── css/app.css       # Design System, Glassmorphism e Temas
│   │       ├── img/              # Logotipos e ativos visuais (SVG)
│   │       └── js/
│   │           ├── app.js        # Bootstrapper e inicialização
│   │           ├── router.js     # Roteador SPA com rotas dinâmicas (:id)
│   │           ├── api.js        # Cliente HTTP REST
│   │           └── components/   # Componentes modulares (PanelManager, etc.)
│   ├── src/                      # Backend PHP 8.2+ (PSR-4)
│   │   ├── Config/               # Banco de Dados, Env e LDAP
│   │   ├── Controllers/          # REST Controllers
│   │   ├── Middleware/           # Auth, Admin, Supervisor e CORS
│   │   ├── Repositories/         # Acesso a dados via PDO
│   │   ├── Services/             # Regras de Negócio e Serviços
│   │   └── Helpers/              # Validação, Resposta JSON e Utilitários
│   └── tests/
│       └── api_test.php          # Suíte completa de testes automatizados
├── database/                     # Migrações SQL e Seed de Dados
├── docker/                       # Dockerfile e docker-compose.yml
├── agents/                       # Definição dos perfis especializados do time
├── Documentações/                # ADRs (Architecture Decision Records)
└── id-visual/                    # Guias de Estilo e Design Tokens
```

---

## 📡 Endpoints da API REST

| Método | Rota | Autenticação | Descrição |
|:-------|:-----|:------------:|:----------|
| `POST` | `/api/auth/login` | Público | Autenticação de credenciais (LDAP ou Local) |
| `POST` | `/api/auth/logout` | Sessão | Encerramento de sessão segura |
| `GET` | `/api/auth/me` | Sessão | Retorna perfil do usuário logado |
| `GET` | `/api/panels` | Sessão | Lista painéis acessíveis (filtrados por RBAC) |
| `POST` | `/api/panels` | Supervisor+ | Criação de novo painel ou setor |
| `PUT` | `/api/panels/{id}` | Supervisor+ | Atualização de painel |
| `DELETE` | `/api/panels/{id}` | Admin | Exclusão de painel |
| `GET` | `/api/links` | Sessão | Lista links e aplicações acessíveis |
| `POST` | `/api/links` | Supervisor+ | Cadastra novo link de aplicação |
| `POST` | `/api/links/import-csv` | Supervisor+ | **Importação em massa de links via arquivo .CSV** |
| `PUT` | `/api/links/{id}` | Supervisor+ | Edição de link |
| `DELETE` | `/api/links/{id}` | Supervisor+ | Remoção de link |
| `POST` | `/api/health/check` | Sessão | Executa health check e latência dos links |
| `GET` | `/api/dashboard/stats` | Sessão | Estatísticas gerais de uptime e links |
| `GET` | `/api/users` | Admin | Gerenciamento de usuários |
| `GET` | `/api/groups` | Admin | Gerenciamento de grupos |

---

## 📄 Licença

Proprietary — © 2026 Flowti. Todos os direitos reservados.
