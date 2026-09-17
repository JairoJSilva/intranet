# 📝 RMT-20260917-01: Novo Layout Bento Grid no Dashboard

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-17  
> **Autor / Agente Responsável**: @Antigravity (AI Agent)  
> **Tipo de Mudança**: Feature / Refactor (Frontend)  
> **Versão Afetada**: v2.2.0

---

## 1. 🎯 Contexto e Motivação

O usuário solicitou uma troca completa de layout do Dashboard, substituindo o design anterior (lista de cards padronizados + table) por um **Bento Grid moderno** — estilo iOS/Notion com blocos de tamanhos variados, hierarquia visual forte e micro-animações de hover.

O objetivo é que o novo layout seja impactante visualmente ao ser entregue via pipeline CI/CD + GitOps ArgoCD.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/public/assets/js/components/Dashboard.js` | Modificado | Substituição completa do método `render()` e refatoração de `renderStats()` e `renderQuickAccess()` |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Backend
Nenhuma alteração.

### 3.2. Frontend

#### `render()` — Novo Bento Grid
- Adicionado bloco de estilos inline com `.bento-grid` (CSS Grid 12 colunas), `.bento-cell`, `.bento-hero`, `.bento-uptime`, `.bento-link-card`, `.bento-sectors` e `.bento-incidents`.
- Header dinâmico com saudação baseada na hora do dia (`☀️ Bom dia`, `☁️ Boa tarde`, `🌙 Boa noite`) e data formatada em pt-BR.
- **Hero Card** (`span 8 colunas`): título do portal com gradiente de texto, KPIs embutidos via `#stats-grid` interno.
- **Uptime Ring** (`span 4 colunas`): círculo `conic-gradient` com porcentagem real de disponibilidade animada dinamicamente pelo `renderStats()`.
- **Bento Links** (`span 3-4 colunas`, via `display:contents`): cards individuais de acesso rápido injetados diretamente no grid.
- **Visão por Setor**: seção com border-radius 16px, cabeçalho e tabela de saúde existente.
- Media queries responsivas para tablet (≤1024px) e mobile (≤640px).

#### `renderStats()` — KPIs Compactos
- Redesenhados para o espaço compacto dentro do hero bento: números grandes (1.8rem), rótulo uppercase + ícone.
- Adicionada lógica de **atualização do uptime ring**: `conic-gradient` calculado em graus a partir do percentual real, com `box-shadow` colorido proporcional ao status.

#### `renderQuickAccess()` — Bento Cards
- Mudança de `#quick-access-grid` para `#quick-access-bento-wrapper` com `display: contents`.
- Cards agora são filhos diretos do `.bento-grid`, com `grid-column: span 3` (4 para o primeiro).
- Status indicator: bolinha colorida com `box-shadow` glow em vez de badge texto.
- Hover com glow na cor do painel (`border-color` + `box-shadow`).

### 3.3. Banco de Dados / Persistência
Nenhuma alteração.

### 3.4. Infraestrutura & DevOps
Nenhuma alteração. Mudança puramente de frontend, entregável via pipeline CI/CD + ArgoCD.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências

- **Breaking Changes?** Não — todas as funções de carregamento de dados (`loadData`, `renderIncidents`, `renderSectorsTable`, `togglePin`, `renderSkeletons`, `renderIcon`, `initEvents`) permanecem inalteradas.
- **Variáveis de Ambiente**: Nenhuma.
- **Migrações / Seeders**: Não necessário.
- **Compatibilidade com versões anteriores**: Backup do layout anterior disponível como `Dashboard.js.original`.

---

## 5. 🧪 Testes e Validação

- [x] Verificação visual do HTML gerado (estrutura Bento Grid)
- [x] IDs mantidos: `stats-grid`, `dashboard-incidents-section`, `sectors-health-table`, `btn-dashboard-healthcheck`
- [ ] Testes unitários (sem alteração de lógica)
- [ ] Validação visual em browser pós-deploy via ArgoCD

---

## 6. 📌 Referências e Links Relacionados

- RMT anterior: [RMT-20260916-06](./RMT-20260916-06-teste-layout-pipeline-ci-cd.md) — Layout de teste CI/CD
- Backup do layout anterior: `aplicação/public/assets/js/components/Dashboard.js.original`
