/**
 * Portal Unificado — Command Palette Component (Ctrl + K / Cmd + K)
 * Busca universal estilo Spotlight / VS Code com navegação 100% por teclado,
 * atalhos rápidos de navegação, sistemas corporativos e painéis.
 */
const CommandPalette = {
    isOpen: false,
    selectedIndex: 0,
    currentResults: [],

    init() {
        // Injeta o container da paleta no DOM se não existir
        if (!document.getElementById('command-palette-container')) {
            const div = document.createElement('div');
            div.id = 'command-palette-container';
            div.innerHTML = this.render();
            document.body.appendChild(div);
        }

        this.bindGlobalKeys();
        this.bindEvents();
    },

    render() {
        return `
        <div class="command-palette-backdrop" id="cmd-palette-backdrop" style="display: none;">
            <div class="command-palette-modal" id="cmd-palette-modal">
                <div class="command-palette-header">
                    <i class="ri-search-line command-palette-search-icon"></i>
                    <input type="text" id="cmd-palette-input" class="command-palette-input" 
                           placeholder="Buscar sistemas, painéis ou ações rápidas... (Ctrl + K)" 
                           autocomplete="off" spellcheck="false" />
                    <button type="button" class="command-palette-close-btn" id="cmd-palette-close-btn" title="Fechar (Esc)">
                        <kbd>ESC</kbd>
                    </button>
                </div>

                <div class="command-palette-body" id="cmd-palette-results">
                    <!-- Resultados dinâmicos aqui -->
                </div>

                <div class="command-palette-footer">
                    <div class="command-palette-hints">
                        <span><kbd>↑</kbd> <kbd>↓</kbd> Navegar</span>
                        <span><kbd>↵</kbd> Acessar</span>
                        <span><kbd>ESC</kbd> Fechar</span>
                    </div>
                    <span class="command-palette-brand">
                        <i class="ri-flashlight-line"></i> Portal Quick Nav
                    </span>
                </div>
            </div>
        </div>`;
    },

    bindGlobalKeys() {
        window.addEventListener('keydown', (e) => {
            // Não ativa atalhos se estiver digitando em campos normais, exceto se for Ctrl+K
            const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
            const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

            if (isCtrlK || isSlash) {
                e.preventDefault();
                this.toggle();
                return;
            }

            if (!this.isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigate(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigate(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSelected();
            }
        });
    },

    bindEvents() {
        const backdrop = document.getElementById('cmd-palette-backdrop');
        const modal = document.getElementById('cmd-palette-modal');
        const closeBtn = document.getElementById('cmd-palette-close-btn');
        const input = document.getElementById('cmd-palette-input');

        backdrop?.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.close();
            }
        });

        closeBtn?.addEventListener('click', () => this.close());

        input?.addEventListener('input', (e) => {
            this.search(e.target.value.trim().toLowerCase());
        });
    },

    open() {
        if (!AppState.isAuthenticated()) return;

        this.isOpen = true;
        this.selectedIndex = 0;
        const backdrop = document.getElementById('cmd-palette-backdrop');
        const input = document.getElementById('cmd-palette-input');

        if (backdrop && input) {
            backdrop.style.display = 'flex';
            input.value = '';
            this.search('');
            setTimeout(() => input.focus(), 50);
        }
    },

    close() {
        this.isOpen = false;
        const backdrop = document.getElementById('cmd-palette-backdrop');
        if (backdrop) {
            backdrop.style.display = 'none';
        }
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Coleta e filtra itens disponíveis
     */
    search(query = '') {
        const panels = AppState.get('panels') || [];
        const actions = this.getQuickActions();
        const results = [];

        // 1. Ações do Sistema
        actions.forEach(act => {
            if (!query || act.title.toLowerCase().includes(query) || act.keywords?.toLowerCase().includes(query)) {
                results.push({ ...act, type: 'action' });
            }
        });

        // 2. Painéis / Setores
        panels.forEach(p => {
            const matchesPanel = !query || 
                p.title.toLowerCase().includes(query) || 
                (p.description && p.description.toLowerCase().includes(query));

            if (matchesPanel) {
                results.push({
                    type: 'panel',
                    id: p.id,
                    title: p.title,
                    description: p.description || 'Painel de aplicações',
                    icon: p.icon || 'ri-layout-grid-line',
                    color: p.color || 'var(--theme-primary)',
                    linkCount: (p.links || []).length
                });
            }
        });

        // 3. Aplicações e Links
        panels.forEach(p => {
            (p.links || []).forEach(l => {
                const matchesLink = !query || 
                    l.title.toLowerCase().includes(query) || 
                    (l.description && l.description.toLowerCase().includes(query)) ||
                    (l.url && l.url.toLowerCase().includes(query));

                if (matchesLink) {
                    results.push({
                        type: 'link',
                        id: l.id,
                        title: l.title,
                        url: l.url,
                        description: l.description || l.url,
                        icon: l.icon || 'ri-global-line',
                        panelId: p.id,
                        panelTitle: p.title,
                        panelColor: p.color || 'var(--theme-primary)',
                        healthStatus: l.health_status || 'unknown',
                        responseTime: l.response_time_ms
                    });
                }
            });
        });

        this.currentResults = results;
        this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, results.length - 1));
        this.renderResults(results, query);
    },

    getQuickActions() {
        const isAdmin = AppState.isAdmin();
        const actions = [
            {
                title: 'Ir para o Dashboard Operacional',
                icon: 'ri-dashboard-line',
                color: 'var(--theme-primary)',
                keywords: 'inicio home métricas kpi disponibilidade',
                handler: () => Router.navigate('#/dashboard')
            },
            {
                title: 'Explorar Catálogo de Painéis',
                icon: 'ri-layout-grid-line',
                color: 'var(--vem-blue-500)',
                keywords: 'pastas sistemas aplicações setores',
                handler: () => Router.navigate('#/panels')
            },
            {
                title: 'Verificar Saúde de Todos os Sistemas (Health Check)',
                icon: 'ri-pulse-line',
                color: 'var(--status-online)',
                keywords: 'ping testar status integridade conectividade',
                handler: async () => {
                    Toast.info('Executando verificação de integridade...');
                    try {
                        const res = await API.healthCheck();
                        Toast.success(`Health Check concluído: ${res.data.stats.online} online.`);
                        Router.resolve();
                    } catch (e) {
                        Toast.error('Erro ao executar health check.');
                    }
                }
            },
            {
                title: 'Mural de Avisos & Manutenções Programadas',
                icon: 'ri-megaphone-line',
                color: 'var(--status-warning)',
                keywords: 'avisos comunicados manutenção broadcast mural alerta incidentes',
                handler: () => {
                    if (window.BroadcastBanner) {
                        BroadcastBanner.openManageModal();
                    }
                }
            },
            {
                title: 'Personalizar Tema Visual & Propriedades',
                icon: 'ri-palette-line',
                color: 'var(--theme-accent)',
                keywords: 'cor visual escuro claro dark mode',
                handler: () => ThemeManager.openUserProfileModal()
            },
            {
                title: 'Instalar Aplicativo Portal Unificado (PWA Desktop)',
                icon: 'ri-download-2-line',
                color: 'var(--vem-blue-500)',
                keywords: 'pwa instalar aplicativo desktop windows mac',
                handler: () => {
                    if (window.deferredPrompt) {
                        window.deferredPrompt.prompt();
                        window.deferredPrompt.userChoice.then(choice => {
                            if (choice.outcome === 'accepted') {
                                Toast.success('Portal Unificado instalado com sucesso!');
                            }
                            window.deferredPrompt = null;
                        });
                    } else {
                        Toast.info('Para instalar, clique no ícone de instalação na barra de endereços do seu navegador ou no menu de opções.');
                    }
                }
            }
        ];

        if (isAdmin) {
            actions.push({
                title: 'Gerenciar Usuários e Permissões',
                icon: 'ri-user-settings-line',
                color: 'var(--theme-secondary)',
                keywords: 'usuarios contas grupos admin rbac',
                handler: () => Router.navigate('#/users')
            });
            actions.push({
                title: 'Gerenciar Grupos & Setores',
                icon: 'ri-team-line',
                color: 'var(--theme-secondary)',
                keywords: 'grupos setores equipes departamentos',
                handler: () => Router.navigate('#/groups')
            });
        }

        return actions;
    },

    renderResults(results, query) {
        const container = document.getElementById('cmd-palette-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="command-palette-empty">
                    <i class="ri-search-eye-line"></i>
                    <p>Nenhum resultado encontrado para "<strong>${this.escapeHtml(query)}</strong>"</p>
                    <span>Tente pesquisar por nome do sistema, URL, painel ou ação.</span>
                </div>
            `;
            return;
        }

        // Agrupa por tipo
        const groups = {
            action: { title: 'Ações Rápidas', items: [] },
            panel: { title: 'Painéis & Setores', items: [] },
            link: { title: 'Sistemas & Aplicações', items: [] },
        };

        results.forEach((item, index) => {
            if (groups[item.type]) {
                groups[item.type].items.push({ item, globalIndex: index });
            }
        });

        let html = '';

        for (const [key, group] of Object.entries(groups)) {
            if (group.items.length === 0) continue;

            html += `<div class="command-palette-group-title">${group.title}</div>`;

            group.items.forEach(({ item, globalIndex }) => {
                const isSelected = globalIndex === this.selectedIndex;
                const activeClass = isSelected ? 'selected' : '';

                if (item.type === 'action') {
                    html += `
                    <div class="command-palette-item ${activeClass}" data-index="${globalIndex}" onclick="CommandPalette.select(${globalIndex})">
                        <div class="command-palette-item-icon" style="color: ${item.color}; background: ${item.color}15;">
                            <i class="${item.icon}"></i>
                        </div>
                        <div class="command-palette-item-content">
                            <span class="command-palette-item-title">${this.highlightMatch(item.title, query)}</span>
                        </div>
                        <span class="command-palette-item-tag">Ação</span>
                    </div>`;
                } else if (item.type === 'panel') {
                    html += `
                    <div class="command-palette-item ${activeClass}" data-index="${globalIndex}" onclick="CommandPalette.select(${globalIndex})">
                        <div class="command-palette-item-icon" style="color: ${item.color}; background: ${item.color}18;">
                            <i class="${item.icon}"></i>
                        </div>
                        <div class="command-palette-item-content">
                            <span class="command-palette-item-title">${this.highlightMatch(item.title, query)}</span>
                            <span class="command-palette-item-desc">${item.description}</span>
                        </div>
                        <span class="command-palette-item-tag" style="color: ${item.color};">${item.linkCount} app(s)</span>
                    </div>`;
                } else if (item.type === 'link') {
                    const statusClass = item.healthStatus === 'online' ? 'online' : (item.healthStatus === 'offline' ? 'offline' : 'warning');
                    html += `
                    <div class="command-palette-item ${activeClass}" data-index="${globalIndex}" onclick="CommandPalette.select(${globalIndex})">
                        <div class="command-palette-item-icon" style="color: ${item.panelColor}; background: ${item.panelColor}15; display: flex; align-items: center; justify-content: center;">
                            ${this.renderIcon(item.icon, 'ri-global-line')}
                        </div>
                        <div class="command-palette-item-content">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span class="command-palette-item-title">${this.highlightMatch(item.title, query)}</span>
                                <span class="health-dot ${statusClass}" style="width: 6px; height: 6px;" title="Status: ${item.healthStatus}"></span>
                            </div>
                            <span class="command-palette-item-desc">
                                <strong style="color: var(--text-secondary);">${item.panelTitle}</strong> · ${this.extractDomain(item.url)}
                            </span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${item.responseTime ? `<span style="font-size: 0.72rem; color: var(--text-muted);">${item.responseTime}ms</span>` : ''}
                            <span class="command-palette-open-badge"><i class="ri-arrow-right-up-line"></i> Abrir</span>
                        </div>
                    </div>`;
                }
            });
        }

        container.innerHTML = html;
        this.scrollToSelected();
    },

    navigate(delta) {
        if (this.currentResults.length === 0) return;
        this.selectedIndex = (this.selectedIndex + delta + this.currentResults.length) % this.currentResults.length;
        
        // Atualiza classes selecionadas no DOM sem re-renderizar tudo
        const items = document.querySelectorAll('.command-palette-item');
        items.forEach(el => {
            const idx = parseInt(el.getAttribute('data-index'), 10);
            el.classList.toggle('selected', idx === this.selectedIndex);
        });

        this.scrollToSelected();
    },

    scrollToSelected() {
        const active = document.querySelector('.command-palette-item.selected');
        if (active) {
            active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },

    select(index) {
        this.selectedIndex = index;
        this.executeSelected();
    },

    executeSelected() {
        const item = this.currentResults[this.selectedIndex];
        if (!item) return;

        this.close();

        if (item.type === 'action') {
            item.handler?.();
        } else if (item.type === 'panel') {
            Router.navigate(`#/panels/${item.id}`);
        } else if (item.type === 'link') {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    },

    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    },

    escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    },

    highlightMatch(text, query) {
        if (!query) return this.escapeHtml(text);
        const escaped = this.escapeHtml(text);
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return escaped.replace(regex, '<mark class="cmd-highlight">$1</mark>');
    },

    renderIcon(icon, defaultIcon = 'ri-global-line') {
        if (!icon) icon = defaultIcon;
        if (icon.startsWith('/') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image/')) {
            return `<img src="${icon}" class="app-icon-img" alt="" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline-block';" /><i class="${defaultIcon}" style="display: none;"></i>`;
        }
        return `<i class="${icon}"></i>`;
    }
};

// Exporta globalmente
window.CommandPalette = CommandPalette;
