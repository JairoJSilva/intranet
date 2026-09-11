# 🌐 Autodetecção e Download Automático de Favicons das URLs

> **ID**: `ISSUE-07`  
> **Labels**: `backend, frontend, automation, enhancement`  
> **Weight (Complexidade)**: `2`  

### 🎯 Objetivo & User Story
Como usuário cadastrando um sistema no portal, quero que o sistema descubra e preencha automaticamente o ícone/favicon oficial da aplicação a partir da URL informada, economizando tempo na configuração manual.

---

### 📋 Critérios de Aceite
- [ ] Criar endpoint `GET /api/links/detect-icon?url=https://...` no backend PHP.
- [ ] O backend faz requisição cURL segura (timeout 2s) buscando `<link rel="icon">` no HTML ou testando `/favicon.ico`.
- [ ] Se encontrado, retorna a URL ou SVG do ícone para preview no formulário.
- [ ] Se o usuário optar por manter o favicon externo, o sistema armazena a referência no campo `icon`.
