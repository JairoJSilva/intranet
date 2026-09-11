# 📈 View Materializada de Métricas Operacionais (vw_dashboard_stats)

> **ID**: `ISSUE-10`  
> **Labels**: `database, performance, sql, enhancement`  
> **Weight (Complexidade)**: `2`  

### 🎯 Objetivo & User Story
Como engenheiro de software, quero que as métricas consolidadas do Dashboard sejam geradas via queries agregadas otimizadas no MySQL, garantindo tempo de resposta inferior a 10ms mesmo com milhares de acessos e links cadastrados.

---

### 📋 Critérios de Aceite
- [ ] Criar DDL com view ou stored query `vw_dashboard_stats` totalizando links online, offline, warnings e tempo médio de resposta por painel.
- [ ] Otimizar índices na tabela `links` (`INDEX idx_links_health (panel_id, health_status)`).
- [ ] Integrar o método `DashboardController::stats()` para consumir os dados consolidados.
