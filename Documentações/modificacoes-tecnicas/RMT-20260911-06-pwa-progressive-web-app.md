# 📝 RMT-20260911-06: Suporte a PWA (Progressive Web App) e Instalação Desktop

> **RMT (Registro de Modificação Técnica)**  
> **Status**: Aplicada  
> **Data**: 2026-09-11  
> **Autor / Agente Responsável**: Antigravity AI / @FullstackDeveloper & @UIUXDesigner  
> **Tipo de Mudança**: Feature / PWA / Architecture  
> **Versão Afetada**: v1.4.0  
> **Branch**: `melhorias`  

---

## 1. 🎯 Contexto e Motivação
Em conformidade com o Roadmap Interativo (Item 2 / `ISSUE-02`), o portal **Omniflowti** agora possui suporte completo a **Progressive Web App (PWA)**. 

Essa funcionalidade permite que operadores, técnicos e colaboradores corporativos instalem o portal como um aplicativo dedicado no desktop (Windows, Linux, macOS) e dispositivos móveis, proporcionando:
- Abertura em janela limpa e dedicada (*standalone*), sem distração de abas do navegador.
- Ícone na barra de tarefas e menu iniciar.
- Inicialização instantânea com cache inteligente de assets estáticos via Service Worker (`sw.js`).

---

## 2. 📁 Arquivos e Componentes Afetados

| Arquivo / Caminho | Tipo de Alteração | Descrição Resumida |
|:---|:---|:---|
| `aplicação/public/manifest.json` | Criado | Manifesto web com metadados da aplicação, cores de tema, orientação e atalhos rápidos. |
| `aplicação/public/sw.js` | Criado | Service Worker para cache seguro de arquivos estáticos e fallback offline. |
| `aplicação/public/assets/img/pwa-icon.svg` | Criado | Ícone oficial de alta definição em SVG para resoluções 192x192 e 512x512. |
| `aplicação/public/index.html` | Modificado | Inclusão de meta tags Apple/Mobile, manifest link e registro do Service Worker com captura de `beforeinstallprompt`. |
| `aplicação/public/assets/js/components/CommandPalette.js` | Modificado | Inclusão da ação "Instalar Aplicativo Omniflowti (PWA Desktop)" nas ações rápidas da paleta. |
| `Documentações/issues/ISSUE-02-pwa-progressive-web-app---instalação.md` | Criado | Documento de especificação da issue no GitLab. |

---

## 3. ⚙️ Detalhamento Técnico das Modificações

### 3.1. Manifesto (`manifest.json`)
- `display: standalone`: executa sem moldura de navegador.
- `theme_color: #00c4bf` e `background_color: #08131a`: harmonia estética com o design system do portal.
- Atalhos configurados para acesso direto ao Dashboard e aos Painéis.

### 3.2. Service Worker (`sw.js`)
- Estratégia híbrida:
  - Rotas `/api/*`: ignoradas pelo Service Worker para garantir que dados corporativos, status de health check e autenticação nunca fiquem obsoletos.
  - Assets estáticos (CSS, JS, SVG, fontes): *Network-first com fallback para cache local*.
- Limpeza automática de caches de versões legadas no evento `activate`.

---

## 4. ⚠️ Impactos, Compatibilidade e Dependências
- **Breaking Changes?** Não. Usuários que utilizam o navegador tradicional continuam usando o portal sem alterações.
- **Segurança**: Chamadas de API mantêm credenciais e cookies `SameSite` intactos.

---

## 5. 🧪 Testes e Validação
- [x] Teste de carregamento do `manifest.json` com status HTTP 200 e MIME type `application/json`.
- [x] Teste de carregamento do `sw.js` com status HTTP 200 e MIME type `text/javascript`.
- [x] Validação do registro de Service Worker no navegador.
- [x] Teste do gatilho de instalação via Command Palette (`Ctrl + K`).

---

## 6. 📌 Referências e Links Relacionados
- Issue: [`Documentações/issues/ISSUE-02-pwa-progressive-web-app---instalação.md`](../issues/ISSUE-02-pwa-progressive-web-app---instalação.md)
- Roadmap: [`Documentações/ROADMAP-INTERATIVO.md`](../ROADMAP-INTERATIVO.md)
