# 🗺️ Roadmap Interativo de Evolução — Omniflowti

Este documento é a central interativa de priorização da branch **`melhorias`**.  
Marque com um `[x]` as funcionalidades que deseja que sejam desenvolvidas. Assim que salvar ou confirmar, daremos início à implementação contínua na ordem definida!

---

## 🌟 Grupo A: Usabilidade, Produtividade & Experiência (UI/UX)

- [x] **⚡ 1. Command Palette Global (`Ctrl + K` / `Cmd + K`)**
  - Barra de busca universal instantânea estilo *Spotlight / VS Code / Raycast*.
  - Ativação via atalho `Ctrl + K` de qualquer tela.
  - Navegação 100% via teclado (setas para cima/baixo, `Enter` para abrir o sistema em nova aba ou saltar para o painel).
  - Indicadores em tempo real de status dos sistemas nos resultados da busca.

- [x] **📲 2. PWA (Progressive Web App — Instalar como Aplicativo no Desktop)**
  - Adição de manifesto web `manifest.json` e Service Worker com suporte offline básico.
  - Permite aos colaboradores instalarem o portal no Windows, Mac ou Linux como app nativo com ícone próprio na barra de tarefas, sem poluição da moldura do navegador.

- [x] **🖱️ 3. Reordenação por Arrastar e Soltar (Drag & Drop)**
  - Arrastar e soltar cartões para personalizar a ordem de prioridade visual nos painéis e na barra lateral esquerda.
  - Persistência da ordenação customizada para o usuário.

- [x] **📱 4. Alternador de Densidade de Tela (Modo Compacto vs. Confortável)**
  - Botão na interface para alternar entre visão em cartões expandidos e visualização ultra-compacta em grade densa (estilo console NOC/SOC).

---

## 📢 Grupo B: Comunicação Corporativa & Negócio (Product Management)

- [x] **📢 5. Mural de Avisos & Manutenções Programadas (Broadcast Banner)**
  - Banner informativo expansível no topo do portal gerenciado por Administradores e Supervisores.
  - Classificação visual de severidade: Informativo (Azul), Atenção/Manutenção (Amarelo) e Alerta Crítico (Vermelho).
  - Controle de período de vigência e opção para o colaborador marcar como "Ciente" (dispensar).

- [x] **🏷️ 6. Tags Transversais de Sistemas (`#producao`, `#homologacao`, `#observabilidade`)**
  - Criação de tags para classificar sistemas além da separação por setor/painel.
  - Filtro rápido na Topbar por tags para encontrar aplicações correlatas com um clique.

- [ ] **📊 7. Seção "Mais Acessados por Você" (Top Sistemas Mais Utilizados)**
  - Contador local/global de cliques que exibe automaticamente os 5 sistemas mais utilizados pelo colaborador no Dashboard.

- [ ] ~~**🙋 8. Workflow de Solicitação de Acesso com 1 Clique**~~ *(Descartado)*

---

## ⚙️ Grupo C: Automação Inteligente & Engenharia (Fullstack & Arquitetura)

- [x] **🌐 9. Autodetecção e Download Automático de Favicons das URLs**
  - Ao cadastrar uma URL (ex: `https://grafana.empresa.com`), o sistema consulta automaticamente o `/favicon.ico` do destino e preenche o ícone do card sozinho.

- [x] **⏱️ 10. Worker Assíncrono de Monitoramento Periódico (Cron Job / Background)**
  - Script CLI (`php cli/healthcheck-worker.php`) para checar links a cada 5 ou 10 minutos via cron, sem depender de cliques manuais no navegador.

- [ ] **📑 11. Documentação Viva de API (Swagger / OpenAPI 3.0)**
  - Endpoint `/api/docs` com interface gráfica interativa Swagger UI documentando todos os contratos REST.

- [ ] **📤 12. Exportação de Relatórios de Inventário & SLA (CSV / PDF)**
  - Ferramenta de exportação com métricas de disponibilidade dos serviços e inventário consolidado de links por setor.

---

## 🗄️ Grupo D: Performance & Banco de Dados (DBA)

- [x] **🧹 13. Rotina de Rotação e Expurgamento da `audit_log`**
  - Script automatizado de expurgo para arquivar eventos de auditoria com mais de 1 ano, mantendo o banco sempre rápido.

- [x] **📈 14. View Materializada de Métricas Operacionais (`vw_dashboard_stats`)**
  - View SQL otimizada para consolidar indicadores de uptime e totais com consumo mínimo de I/O.

---

## 📌 Já Concluídos na Branch `melhorias`:
- [x] **Fixar/Favoritar Painéis na Barra Lateral** (RMT-20260911-03)
- [x] **🔑 Autenticação SSO Moderna (OAuth2 / OIDC / Azure AD / Keycloak)** (RMT-20260911-04)
- [x] **🔔 Central de Alertas Operacionais no Navegador (Web Notifications API)** (RMT-20260911-04)
- [x] **Navegação Direta em Toda a Área do Card de Sistemas** (RMT-20260911-04)
- [x] **⌨️ Command Palette Global (Ctrl + K)** (RMT-20260911-05)
- [x] **📱 PWA & Instalação Desktop** (RMT-20260911-06)
- [x] **🖱️ Reordenação Drag & Drop e Modo Densidade NOC** (RMT-20260911-07)
- [x] **🌐 Autodetecção e Download Automático de Favicons das URLs** (RMT-20260911-08)
- [x] **📢 Mural de Avisos & Manutenções Programadas (Broadcast Banner)** (RMT-20260911-09)

---
*Como usar: Marque com `[x]` os itens que deseja priorizar e me avise aqui no chat!*
