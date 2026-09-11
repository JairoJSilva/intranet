# 🏷️ Tags Transversais de Sistemas (#producao, #homologacao, #cloud)

> **ID**: `ISSUE-06`  
> **Labels**: `database, backend, frontend, feature`  
> **Weight (Complexidade)**: `3`  

### 🎯 Objetivo & User Story
Como colaborador ou operador, quero filtrar links corporativos por tags temáticas transversais (ex: `#producao`, `#homologacao`, `#observabilidade`, `#cloud`), para cruzar aplicações de diferentes setores em uma única busca.

---

### 📋 Critérios de Aceite
- [ ] Criar tabelas `tags` e `link_tags` (relação N:N) no banco MySQL.
- [ ] Atualizar endpoints de Links para aceitar lista de tags no cadastro/edição (`tags: ['producao', 'cloud']`).
- [ ] Adicionar componente de seleção/criação de tags no modal de link.
- [ ] Exibir tags como badges clicáveis nos cards de links.
- [ ] Seletor rápido de filtro por tag na barra de busca e no catálogo de painéis.
