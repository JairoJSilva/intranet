# 📝 RMT-20260911-07: Reordenação por Drag & Drop e Modo de Densidade de Tela

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-11  
> **Autor / Agente Responsável**: @Antigravity  
> **Tipo de Mudança**: Feature & UX Enhancement  
> **Versão Afetada**: v1.1.0  

---

## 1. 🎯 Contexto e Motivação
Atendimento aos itens 3 e 4 do Roadmap Interativo de Evoluções e Melhorias Priorizadas:
1. **Reordenação por Arrastar e Soltar (Drag & Drop)**: Permite que supervisores e administradores reordenem os cartões de aplicações dentro de um painel e a ordem dos painéis no catálogo, além de permitir que qualquer usuário reorganize a ordem de seus painéis fixados na barra lateral. A ordenação dos cartões e painéis persiste de forma atômica no banco de dados (`sort_order`), e a barra lateral persiste no `localStorage` por usuário.
2. **Alternador de Densidade de Tela (Modo Compacto NOC vs Confortável)**: Introdução de um botão no Topbar e suporte CSS de alto rendimento (`.density-compact`) permitindo reduzir paddings, margens e ícones para visualização de mais de 20 sistemas simultâneos em telas de monitoramento ou NOC sem necessidade de rolagem.

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/src/Repositories/LinkRepository.php` | Modificado | Adicionado método transacional `reorder(array $orderedIds): bool`. |
| `aplicação/src/Repositories/PanelRepository.php` | Modificado | Adicionado método transacional `reorder(array $orderedIds): bool`. |
| `aplicação/src/Services/LinkService.php` | Modificado | Adicionado método `reorder(array $ids, int $currentUserId): bool` com auditoria em log. |
| `aplicação/src/Services/PanelService.php` | Modificado | Adicionado método `reorder(array $ids, array $currentUser): bool` com auditoria em log. |
| `aplicação/src/Controllers/LinkController.php` | Modificado | Endpoint `PUT /api/links/reorder` com verificação de permissão de supervisor. |
| `aplicação/src/Controllers/PanelController.php` | Modificado | Endpoint `PUT /api/panels/reorder` com verificação de permissão de supervisor. |
| `aplicação/src/routes.php` | Modificado | Registro das rotas `PUT /api/panels/reorder` e `PUT /api/links/reorder`. |
| `aplicação/public/assets/js/api.js` | Modificado | Métodos `API.reorderPanels(ids)` e `API.reorderLinks(ids)`. |
| `aplicação/public/assets/js/state.js` | Modificado | Método `AppState.reorderPinnedPanels(fromIndex, toIndex)` com persistência no `localStorage`. |
| `aplicação/public/assets/js/components/Sidebar.js` | Modificado | Suporte a Drag & Drop nativo na lista de painéis fixados (`initPinnedDragDrop`). |
| `aplicação/public/assets/js/components/PanelManager.js` | Modificado | Drag & Drop nos cartões de links (`initLinksDragDrop`) e painéis do catálogo (`initPanelsDragDrop`). |
| `aplicação/public/assets/js/components/Topbar.js` | Modificado | Botão alternador de densidade de tela (`#density-toggle-btn`), persistência e atualização dinâmica. |
| `aplicação/public/assets/css/app.css` | Modificado | Estilos visuais de arraste (`.draggable-card`, `.card-drag-handle`, `.dragging`, `.drag-over`) e classes de densidade compacta (`.density-compact`). |
| `aplicação/public/index.html` | Modificado | Inicialização imediata da classe `density-compact` no `<head>` para evitar FOUC/Layout shift. |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Backend
- **Repositórios**: Implementação de transações PDO com `sort_order` atualizado sequencialmente (`$index + 1`) de acordo com a ordem da lista enviada pelo frontend.
- **Auditoria**: Cada operação de reordenação em lote gera um registro na tabela `audit_log` contendo os IDs reorganizados.
- **Roteamento**: O router regex do `index.php` trata `reorder` como rota literal, evitando colisão com identificadores numéricos `{id}`.

### 3.2. Frontend
- **Drag & Drop Nativo (HTML5 Drag & Drop API)**: Implementado inteiramente em Vanilla JS ES6+, sem qualquer dependência de bibliotecas externas. Suporta arrastar cartões com feedback visual de arrastando (`.dragging`) e sobreposição (`.drag-over`).
- **Persistência Reativa**: Chamadas assíncronas automáticas para `API.reorderLinks()` e `API.reorderPanels()`, exibindo notificações Toast de sucesso.
- **Modo Compacto NOC**: O botão no Topbar alterna a classe `density-compact` no elemento raiz `<html>`, persistindo a chave `omniflowti_density` no `localStorage`.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes**: Não.
- **Banco de Dados**: As colunas `sort_order` já existiam nas tabelas `panels` e `links`. Nenhuma migração DDL necessária.
- **Permissões / RBAC**: Reordenação de links e painéis no backend é restrita a Supervisores e Administradores. Usuários padrão apenas reordenam seus próprios itens fixados no sidebar.

---

## 5. 🧪 Testes e Validação
- [x] Teste de autorização HTTP via `curl`: rotas protegidas retornam 401 para requisições não autenticadas.
- [x] Teste autenticado de `PUT /api/panels/reorder`: ordenação atualizada no banco com sucesso (HTTP 200).
- [x] Teste autenticado de `PUT /api/links/reorder`: ordenação de links atualizada no banco com sucesso (HTTP 200).
- [x] Verificação anti-FOUC da densidade de tela no carregamento do `index.html`.

---

## 6. 📌 Referências e Links Relacionados
- Roadmap de Evoluções: `Documentações/ROADMAP-INTERATIVO.md` (Itens 3 e 4)
- Branch de Desenvolvimento: `melhorias`
