# 🖱️ Reordenação por Arrastar e Soltar (Drag & Drop de Cartões e Painéis)

> **ID**: `ISSUE-03`  
> **Labels**: `frontend, ui/ux, interactivity, enhancement`  
> **Weight (Complexidade)**: `3`  

### 🎯 Objetivo & User Story
Como supervisor ou operador, quero poder arrastar e soltar os cartões de links dentro dos painéis e os painéis fixados na barra lateral, para personalizar a hierarquia visual conforme as prioridades do meu dia a dia.

---

### 📋 Critérios de Aceite
- [ ] Implementar suporte a drag and drop nativo ou biblioteca leve sem dependências externas.
- [ ] Permitir reordenar os painéis fixados na barra lateral esquerda, persistindo a ordem no `localStorage`.
- [ ] Permitir reordenar os cartões de sistemas (`app-tile`) dentro do painel para administradores e supervisores.
- [ ] Criar endpoint `PUT /api/links/reorder` para salvar o `sort_order` no banco MySQL quando persistido pelo gestor do painel.
- [ ] Feedback visual suave com placeholder indicador de soltura (*drop target*).
