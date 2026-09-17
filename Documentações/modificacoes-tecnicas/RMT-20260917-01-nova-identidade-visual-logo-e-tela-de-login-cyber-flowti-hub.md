# 📝 RMT-20260917-01: Nova Identidade Visual (Logo Flowti Hub) e Tela de Login Cyber Imersiva

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-17  
> **Autor / Agente Responsável**: Antigravity AI / @FullstackDeveloper & @UIUXDesigner  
> **Tipo de Mudança**: Feature / UI-UX / Identity / Security  
> **Versão Afetada**: v1.5.0  

---

## 1. 🎯 Contexto e Motivação

Alinhamento da identidade visual e da experiência de autenticação do **Flowti Hub** com o padrão high-tech consolidado no ecossistema de ferramentas Flowti (referência: `flowti-agent`).

A modificação substitui a tela de login simples anterior por uma interface cyber-futurista de alta fidelidade com:
1. **Logotipo oficial do Flowti Hub**:
   - Criação de variantes vetoriais SVG (`flowti-hub-logo.svg` e `flowti-hub-logo-dark.svg`) contendo o símbolo da marca Flowti, o wordmark e o badge neon estilizado com a inscrição **HUB**.
   - Integração da imagem raster oficial em alta resolução `logo_flowti_branca.png` preservada do ecossistema para máxima compatibilidade.
   - Aplicação do novo logotipo oficial na barra lateral (`Sidebar.js`), mantendo consistência em todo o portal.
2. **Boot Sequence Overlay (`#lp-boot`)**:
   - Laser scanner horizontal animado com glow azul elétrico.
   - Apresentação da marca Flowti Hub com barra de progresso procedural e status de boot do ambiente ("Inicializando ambiente...").
3. **Sliding 2D Wipe Panel & Perspective (`#lp-wipe`)**:
   - Painel angular com gradiente multi-stop azul marinho / safira profundo e anéis concêntricos decorativos em perspectiva.
   - Logo central com animação contínua de traçado vetorial neon para a palavra **HUB** (`.trace-letter` com stroke-dashoffset em cascata).
4. **Formulário de Login e Modo de Solicitação de Acesso (Active Directory)**:
   - Formulário de login à esquerda com campos glassmorphism, botão de revelar senha ("VER" / "OC."), feedback dinâmico de autenticação e suporte integrado a SSO Corporativo.
   - Transição deslizante suave entre os modos Login e "Solicitar Acesso".
   - Formulário de solicitação de acesso à direita para usuários do Active Directory com justificativa e persistência auditável.
5. **Success Overlay (`#lp-veil`)**:
   - Animação circular procedural de autorização de acesso (`sv-arc` e `sv-tick`) e redirecionamento suave para o Dashboard.
6. **Backend e Rotas**:
   - Endpoint `POST /api/auth/request` adicionado em `AuthController.php` com auditoria na tabela `audit_log`.
   - Compatibilidade com endpoints legados do padrão Flowti Agent (`/api/auth.php?action=login|request`).

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/public/assets/img/flowti-hub-logo.svg` | Criado | Logotipo vetorial oficial do Flowti Hub (fundo escuro / neon blue). |
| `aplicação/public/assets/img/flowti-hub-logo-dark.svg` | Criado | Logotipo vetorial oficial do Flowti Hub (fundo claro / dark blue). |
| `aplicação/public/assets/img/logo_flowti_branca.png` | Criado | Imagem transparente em alta definição do logotipo branco da Flowti. |
| `id-visual/flowti-hub-logo.svg` | Criado | Cópia do logotipo vetorial para o diretório de identidade visual. |
| `id-visual/flowti-hub-logo-dark.svg` | Criado | Cópia do logotipo versão dark para a pasta de identidade visual. |
| `id-visual/logo_flowti_branca.png` | Criado | Cópia do logotipo raster para o repositório de id visual. |
| `aplicação/public/assets/css/login.css` | Criado | Estilos completos da experiência de login cyber: boot, veil, wipe 2D, forms e responsividade. |
| `aplicação/public/assets/js/components/LoginForm.js` | Modificado | Renderização completa dos componentes e lógica de boot, toggle de visualização de senha, login com veil, solicitação de acesso e SSO. |
| `aplicação/public/assets/js/components/Sidebar.js` | Modificado | Atualização do link e imagem da marca na barra lateral para `flowti-hub-logo.svg`. |
| `aplicação/public/index.html` | Modificado | Inclusão de fontes JetBrains Mono, folha de estilos `login.css`, título da página e detecção de `action=login`. |
| `aplicação/public/index.php` | Modificado | Prevenção de loop estático em `/index.php` e compatibilidade com `/api/auth.php?action=login|request`. |
| `aplicação/src/Controllers/AuthController.php` | Modificado | Implementação do método `requestAccess()` com registro em `audit_log`. |
| `aplicação/src/routes.php` | Modificado | Registro da rota REST `POST /api/auth/request`. |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Backend
- **`AuthController::requestAccess()`**:
  - Valida a presença dos parâmetros `ad_username` e `reason`.
  - Conecta via PDO e insere na tabela `audit_log` com ação `request_access`, gravando IP e User Agent.
  - Retorna resposta JSON padronizada via helper `Response::success()`.
- **Roteamento & Compatibilidade**:
  - Rota `POST /api/auth/request` mapeada diretamente em `routes.php`.
  - Inclusão de interceptor no bootstrap de rotas em `index.php` para atender requisições direcionadas a `/api/auth.php?action=login` e `/api/auth.php?action=request`.

### 3.2. Frontend
- **Arquitetura Visual**:
  - CSS modularizado em `login.css` para evitar sobreposição indesejada com os estilos da área logada (`app.css`).
  - Fontes `Inter` (pesos 300 a 900) e `JetBrains Mono` carregadas via Google Fonts.
- **Animações SVG e CSS**:
  - Efeito laser scanline com `lp-scandown` (1.1s cubic-bezier).
  - Traçado vetorial dos caracteres `H`, `U`, `B` via SVG `<text>` e `<tspan class="trace-letter">`, sincronizados com atrasos sequenciais de 0.20s.
  - Animação 2D de deslizamento skew do painel azul escuro com gradientes radiais sobrepostos.
  - Alternância de classes `.lp-mode-request` e `.lp-mode-return` para transição entre o formulário de login e o formulário de solicitação de acesso.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não. Usuários existentes autenticam normalmente pelas credenciais locais ou SSO corporativo.
- **Variáveis de Ambiente**: Nenhuma variável nova obrigatória.
- **Migrações / Seeders**: Não requer alterações de DDL, aproveitando a tabela de infraestrutura existente `audit_log`.
- **Compatibilidade**: Total suporte a navegadores modernos e modo responsivo para telas móveis (`@media (max-width: 860px)`).

---

## 5. 🧪 Testes e Validação
- [x] Criação e verificação de integridade dos arquivos vetoriais SVG e imagens PNG.
- [x] Validação sintática e integridade do código PHP em `AuthController.php`, `routes.php` e `index.php`.
- [x] Validação sintática e integridade do JavaScript modular em `LoginForm.js` e `Sidebar.js`.
- [x] Compatibilidade com rotas SPA e URLs contendo parâmetros `?action=login`.

---

## 6. 📌 Referências e Links Relacionados
- Referência de interface e animações: `https://flowti-agent-develop.flowti.com.br/index.php?action=login`
- Guia de estilo do projeto: `id-visual/guia-identidade-web.md`
