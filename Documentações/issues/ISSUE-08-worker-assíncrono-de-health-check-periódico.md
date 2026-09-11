# ⏱️ Worker Assíncrono de Health Check Periódico em Background

> **ID**: `ISSUE-08`  
> **Labels**: `backend, devops, worker, priority::high`  
> **Weight (Complexidade)**: `3`  

### 🎯 Objetivo & User Story
Como equipe de operações de TIC, queremos que a disponibilidade de todos os links seja monitorada continuamente a cada 5 minutos via worker em background, sem depender que algum usuário clique manualmente no botão de verificação.

---

### 📋 Critérios de Aceite
- [ ] Criar script executável CLI: `bin/healthcheck-worker.php`.
- [ ] Executar checagens concorrentes de conectividade com `curl_multi` (lotes paralelos de alta performance).
- [ ] Atualizar `health_status`, `response_time_ms` e `last_checked_at` diretamente no banco MySQL.
- [ ] Fornecer configuração no crontab ou suporte a loop daemon com intervalo configurável via `.env` (`HEALTHCHECK_INTERVAL=300`).
- [ ] Registrar logs de execução e detecção de incidentes.
