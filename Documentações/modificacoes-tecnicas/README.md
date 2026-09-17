# 📜 Catálogo de Registros de Modificações Técnicas (RMT)

Este diretório contém o histórico oficial de todas as alterações técnicas implementadas no projeto **Omniflowti**.

---

## 🎯 Regra Obrigatória de Governança

> [!IMPORTANT]
> **SEMPRE que for realizada qualquer modificação técnica no projeto** (seja no Backend, Frontend, Banco de Dados, Docker/Infraestrutura, Scripts de Automação ou Dependências), **um novo arquivo de registro deve ser criado neste diretório**.

### Convenção de Nomenclatura:
Os arquivos devem seguir o padrão:
```
RMT-YYYYMMDD-XX-descricao-curta.md
```
- **`YYYYMMDD`**: Ano, mês e dia da alteração.
- **`XX`**: Sequencial numérico do dia (`01`, `02`, etc.).
- **`descricao-curta`**: Palavras-chave em minúsculas separadas por hífen indicando o objetivo da alteração.

### Como criar um novo registro:
1. Copie o arquivo modelo [`TEMPLATE-RMT.md`](TEMPLATE-RMT.md).
2. Salve com o novo nome seguindo a convenção acima.
3. Preencha detalhadamente as seções de contexto, arquivos alterados, aspectos técnicos, impactos e validação/testes.
4. Adicione a nova entrada na tabela abaixo.

---

## 📋 Tabela Cronológica de Registros

| ID | Data | Título / Descrição | Tipo | Autor / Agente | Status |
|:---|:---|:---|:---|:---|:---|
| [RMT-20260911-01](RMT-20260911-01-adicao-gitignore-e-politica-de-modificacoes-tecnicas.md) | 2026-09-11 | Inclusão de .gitignore e Criação da Política de Registro de Modificações Técnicas | Architecture / Governance | Antigravity AI / @SoftwareArchitect | ✅ Aplicada |
| [RMT-20260911-02](RMT-20260911-02-script-automacao-git-sync.md) | 2026-09-11 | Criação do Script de Automação Git Sync (Commit, Rebase e Push) | Infra/DevOps / Automation | Antigravity AI / @DevOpsSenior | ✅ Aplicada |
| [RMT-20260911-03](RMT-20260911-03-funcionalidade-paineis-favoritos-fixados-sidebar.md) | 2026-09-11 | Implementação da Funcionalidade de Fixar/Favoritar Painéis na Barra Lateral | Feature / UI-UX | Antigravity AI / @FullstackDeveloper | ✅ Aplicada |
| [RMT-20260911-04](RMT-20260911-04-autenticacao-sso-oauth2-e-alertas-operacionais-navegador.md) | 2026-09-11 | Autenticação SSO Moderna (OAuth2/OIDC) e Alertas Operacionais no Navegador | Feature / Security / UI-UX | Antigravity AI / @SecOpsEngineer & @FullstackDeveloper | ✅ Aplicada |
| [RMT-20260911-05](RMT-20260911-05-command-palette-busca-global-ctrl-k.md) | 2026-09-11 | Implementação da Command Palette Global (Ctrl + K) | Feature / UI-UX / Productivity | Antigravity AI / @UIUXDesigner & @FullstackDeveloper | ✅ Aplicada |
| [RMT-20260911-06](RMT-20260911-06-pwa-progressive-web-app.md) | 2026-09-11 | Suporte a PWA (Progressive Web App) e Instalação Desktop | Feature / PWA / Architecture | Antigravity AI / @FullstackDeveloper & @UIUXDesigner | ✅ Aplicada |
| [RMT-20260911-07](RMT-20260911-07-reordenacao-drag-and-drop-e-modo-densidade.md) | 2026-09-11 | Reordenação por Drag & Drop e Modo de Densidade de Tela (Compacto NOC) | Feature & UX Enhancement | Antigravity AI / @FullstackDeveloper | ✅ Aplicada |
| [RMT-20260911-08](RMT-20260911-08-autodeteccao-e-download-automatico-de-favicons.md) | 2026-09-11 | Autodetecção e Download Automático de Favicons das URLs | Feature & Automation | Antigravity AI / @FullstackDeveloper | ✅ Aplicada |
| [RMT-20260911-09](RMT-20260911-09-mural-de-avisos-e-broadcast-banner.md) | 2026-09-11 | Mural de Avisos Corporativos & Broadcast Banner | Feature & Architecture | Antigravity AI / @FullstackDeveloper | ✅ Aplicada |
| [RMT-20260917-01](RMT-20260917-01-nova-identidade-visual-logo-e-tela-de-login-cyber-flowti-hub.md) | 2026-09-17 | Nova Identidade Visual (Logo Flowti Hub) e Tela de Login Cyber Imersiva | Feature / UI-UX / Identity / Security | Antigravity AI / @FullstackDeveloper & @UIUXDesigner | ✅ Aplicada |
| [RMT-20260917-02](RMT-20260917-02-retorno-da-tela-de-login-padrao-com-logo-flowti-hub.md) | 2026-09-17 | Retorno da Tela de Login Padrão com Aplicação do Novo Logotipo Flowti Hub | UI-UX / Refactor / Rollback Parcial | Antigravity AI / @FullstackDeveloper & @UIUXDesigner | ✅ Aplicada |