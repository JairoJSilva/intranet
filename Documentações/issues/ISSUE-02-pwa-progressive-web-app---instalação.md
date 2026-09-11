# 📲 PWA (Progressive Web App - Instalação Desktop & Offline Cache)

> **ID**: `ISSUE-02`  
> **Labels**: `frontend, pwa, mobile/desktop, enhancement`  
> **Weight (Complexidade)**: `2`  

### 🎯 Objetivo & User Story
Como colaborador corporativo, quero instalar o Omniflowti como um aplicativo no meu computador (Windows, Linux ou Mac), para ter um ícone dedicado na barra de tarefas e inicialização rápida sem a moldura do navegador.

---

### 📋 Critérios de Aceite
- [ ] Criar arquivo `public/manifest.json` configurado com nomes, ícones (192x192, 512x512) e `theme_color: #0B0A0A`.
- [ ] Implementar Service Worker (`public/sw.js`) para interceptação de rede e cache seguro dos recursos estáticos (CSS, JS, fontes RemixIcon).
- [ ] Registrar o Service Worker no carregamento de `index.html`.
- [ ] Exibir botão ou prompt nativo do navegador para "Instalar Aplicativo".
- [ ] Testar modo standalone em janela própria.
