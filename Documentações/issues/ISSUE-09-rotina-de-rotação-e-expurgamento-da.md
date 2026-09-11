# 🧹 Rotina de Rotação e Expurgamento da audit_log

> **ID**: `ISSUE-09`  
> **Labels**: `database, backend, performance, maintenance`  
> **Weight (Complexidade)**: `2`  

### 🎯 Objetivo & User Story
Como DBA e administrador do sistema, quero uma rotina agendada para expurgar registros de auditoria com mais de 365 dias, para prevenir o crescimento descontrolado do banco e manter consultas rápidas.

---

### 📋 Critérios de Aceite
- [ ] Criar script CLI `bin/audit-purge.php --days=365` ou procedure MySQL.
- [ ] Executar deleção ou arquivamento em lotes (`LIMIT 1000`) para evitar bloqueios de tabela (locks) no MySQL.
- [ ] Registrar evento de auditoria informando a quantidade de registros expurgados.
- [ ] Parâmetro configurável em `.env` (`AUDIT_RETENTION_DAYS=365`).
