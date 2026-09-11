# 📢 Mural de Avisos & Manutenções Programadas (Broadcast Banner)

> **ID**: `ISSUE-05`  
> **Labels**: `backend, frontend, feature, priority::high`  
> **Weight (Complexidade)**: `4`  

### 🎯 Objetivo & User Story
Como administrador ou supervisor, quero publicar avisos corporativos e comunicados de manutenção programada no topo do portal, para manter todos os colaboradores informados sobre instabilidades planejadas ou comunicados urgentes da TIC.

---

### 📋 Critérios de Aceite
- [ ] Criar tabela `announcements` no banco MySQL com campos: `title`, `message`, `severity` (`info`, `warning`, `critical`), `starts_at`, `expires_at`, `is_active`, `created_by`.
- [ ] Criar Controller e rotas REST: `GET /api/announcements/active`, `POST /api/announcements`, `PUT /api/announcements/:id`, `DELETE /api/announcements/:id`.
- [ ] Banner no topo do layout do portal com ícone, cor de severidade e animação suave.
- [ ] Permitir ao colaborador clicar em "Entendido / Fechar" (ocultando o aviso específico naquela sessão).
- [ ] Modal administrativo para publicação rápida de avisos.
