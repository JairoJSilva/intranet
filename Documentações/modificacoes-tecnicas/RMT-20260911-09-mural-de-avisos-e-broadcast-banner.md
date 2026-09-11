# 📝 RMT-20260911-09: Mural de Avisos Corporativos & Broadcast Banner

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-11  
> **Autor / Agente Responsável**: @Antigravity  
> **Tipo de Mudança**: Feature & Architecture  
> **Versão Afetada**: v1.4.0  

---

## 1. 🎯 Contexto e Motivação
Implementação do **Item 5 do Roadmap**: *📢 Mural de Avisos & Manutenções Programadas (Broadcast Banner)*.  
A necessidade surgiu para permitir que equipes de Infraestrutura, TIC e Operações comuniquem com antecedência janelas de manutenção, alertas de incidentes em tempo real e comunicados corporativos diretamente no Omniflowti Hub, garantindo máxima visibilidade sem poluir visualmente o fluxo operacional do usuário.

A solução abrange:
1. **Banner Responsivo Superior (Broadcast)**: Renderizado logo abaixo da Topbar em todas as páginas, estilizado com temas dinâmicos glassmorphic e três níveis de severidade (`info`, `warning`, `critical`).
2. **Dispensas Locais ("Marcar como Ciente")**: Capacidade do usuário marcar comunicados como cientes via `localStorage`, mantendo a interface limpa enquanto o comunicado permanece acessível no mural.
3. **Mural de Avisos & Central de Gestão**: Modal interativo acionado pelo ícone de megafone (`#broadcast-manage-btn`) na Topbar e pelo atalho `Ctrl+K` (Command Palette).
4. **CRUD Administrativo**: Supervisores e Administradores podem publicar novos avisos, definir datas de vigência/expiração automática (`starts_at`, `expires_at`), links externos de acompanhamento, alterar estado ativo/inativo e excluir comunicados com registro em trilha de auditoria (`audit_log`).

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/src/Repositories/NoticeRepository.php` | Criado | Criação da tabela `notices` (DDL idempotente), queries de busca ativas/gerais, filtros de vigência e CRUD. |
| `aplicação/src/Services/NoticeService.php` | Criado | Regras de validação, controle de auditoria (`audit_log`) e orquestração de comunicados. |
| `aplicação/src/Controllers/NoticeController.php` | Criado | Endpoints RESTful para consulta ativa, listagem geral, criação, edição e exclusão de avisos. |
| `aplicação/src/routes.php` | Modificado | Registro das rotas `/api/notices` e `/api/notices/active` com middleware de autenticação e RBAC. |
| `database/schema.sql` | Modificado | Inclusão do DDL formal da tabela `notices` para novos deploys e ambientes limpos. |
| `aplicação/public/assets/js/api.js` | Modificado | Métodos de integração com a API (`getActiveNotices`, `getNotices`, `createNotice`, `updateNotice`, `deleteNotice`). |
| `aplicação/public/assets/js/components/BroadcastBanner.js` | Criado | Componente frontend responsável pela renderização dos banners, gestão de dispensas locais e modal administrativo. |
| `aplicação/public/assets/js/components/Topbar.js` | Modificado | Adição do botão de megafone com badge de avisos pendentes e gatilho para o mural de avisos. |
| `aplicação/public/assets/js/components/CommandPalette.js` | Modificado | Adição de ação rápida para acesso ao Mural de Avisos via `Ctrl + K`. |
| `aplicação/public/assets/js/app.js` | Modificado | Injeção do container `#broadcast-banner-container` no layout principal e inicialização do banner. |
| `aplicação/public/assets/css/app.css` | Modificado | Estilos glassmorphic para banners (`.broadcast-info`, `.broadcast-warning`, `.broadcast-critical`), animações de pulse e badge na topbar. |
| `aplicação/public/index.html` | Modificado | Inclusão do script `BroadcastBanner.js`. |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Backend
- **Tabela `notices`**:
  - Campos: `id`, `title`, `message`, `type` (`info`, `warning`, `critical`), `link_url`, `link_text`, `starts_at`, `expires_at`, `is_active`, `created_by`, `created_at`, `updated_at`.
  - Índices compostos em `(is_active, starts_at, expires_at)` para alta performance de consulta.
- **Endpoints REST**:
  - `GET /api/notices/active`: Retorna comunicados ativos e vigentes ordenados por prioridade (`critical` > `warning` > `info`).
  - `GET /api/notices`: Retorna histórico geral de comunicados para gestores e supervisores.
  - `POST /api/notices`: Cria novo comunicado e registra auditoria.
  - `PUT /api/notices/{id}`: Atualiza propriedades do comunicado com auditoria.
  - `DELETE /api/notices/{id}`: Exclui comunicado com auditoria.

### 3.2. Frontend
- **Glassmorphic Broadcast Banners**:
  - `broadcast-info`: Acento azul institucional, ícone informativo (`ri-information-fill`).
  - `broadcast-warning`: Acento âmbar de atenção/manutenção (`ri-tools-fill`).
  - `broadcast-critical`: Acento carmesim com animação de pulso e glow de incidente (`ri-alarm-warning-fill`).
- **Dispensas Inteligentes**:
  - Ao clicar em "Ciente", o ID é salvo na chave `omniflowti_dismissed_notices` do `localStorage`.
  - Botão "Reexibir Avisos Dispensados" permite ao usuário recuperar comunicados dispensados caso precise consultá-los novamente.
- **Topbar & Command Palette**:
  - Ícone de megafone na barra de ferramentas superior com contador dinâmico de avisos não cientes (`#broadcast-badge`).
  - Item rápido na paleta de comando (`Ctrl + K`) com busca semântica por palavras-chave ("mural", "avisos", "manutenção", "broadcast").

### 3.3. Banco de Dados / Persistência
- DDL idempotente inserido no `NoticeRepository::ensureTableExists()`, permitindo migração automática e transparente em ambientes existentes sem intervenção manual.
- Atualizado arquivo principal `database/schema.sql`.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não. Todas as alterações são 100% retrocompatíveis.
- **Variáveis de Ambiente**: Nenhuma nova variável necessária.
- **Migrações / Seeders**: O `NoticeRepository` inicializa a tabela `notices` e faz seed automático caso a tabela não exista.

---

## 5. 🧪 Testes e Validação
- [x] Teste de criação e persistência da tabela `notices` em MySQL 8.0 via container Docker (`flowti-app`).
- [x] Teste autenticado de listagem ativa `GET /api/notices/active` retornando JSON estruturado (HTTP 200).
- [x] Teste de criação `POST /api/notices` com ordenação correta por criticidade (`critical` antes de `warning`).
- [x] Teste de exclusão `DELETE /api/notices/{id}` e verificação de trilha em `audit_log`.
- [x] Verificação de layout de banners, animações e integração com Topbar e Command Palette.

---

## 6. 📌 Referências e Links Relacionados
- Roadmap do Projeto: Item 5 (Mural de Avisos & Manutenções Programadas)
- RMT anterior: `RMT-20260911-08-autodeteccao-e-download-automatico-de-favicons.md`
