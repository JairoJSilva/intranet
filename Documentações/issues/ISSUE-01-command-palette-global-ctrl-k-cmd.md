# ⚡ Command Palette Global (Ctrl + K / Cmd + K)

> **ID**: `ISSUE-01`  
> **Labels**: `frontend, ui/ux, enhancement, priority::high`  
> **Weight (Complexidade)**: `3`  

### 🎯 Objetivo & User Story
Como operador ou administrador do Omniflowti, quero pressionar `Ctrl + K` (ou `Cmd + K`) em qualquer tela do portal para abrir uma paleta de busca global rápida estilo *Spotlight / VS Code*, para navegar e abrir sistemas corporativos instantaneamente sem precisar tirar as mãos do teclado.

---

### 📋 Critérios de Aceite
- [ ] O atalho `Ctrl + K` e `Cmd + K` deve abrir o modal centralizado da Command Palette de qualquer tela.
- [ ] A tecla `Escape` deve fechar o modal.
- [ ] Navegação completa por teclado: setas `Up` / `Down` selecionam o item, `Enter` aciona o item focado.
- [ ] Ao dar `Enter` em um sistema/link, abre a URL em nova aba.
- [ ] Ao dar `Enter` em um painel, redireciona o router para `#/panels/:id`.
- [ ] Busca em tempo real com filtro por título, descrição, domínio e tags.
- [ ] Badge colorido indicando status em tempo real (`online`, `warning`, `offline`) ao lado de cada link sugerido.
- [ ] Design System em Glassmorphism integrado aos temas do Omniflowti.
