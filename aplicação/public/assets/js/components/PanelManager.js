/**
 * Omniflowti — Panel & Link Manager Component
 * 1. Catálogo Principal (#/panels): Exibe os quadrados (cards) de cada painel/setor.
 * 2. Visualização Dedicada (#/panels/:id): Ao clicar num painel (ex: DevOps),
 *    o usuário é direcionado para a página exclusiva contendo apenas os links daquele painel.
 */
const PanelManager = {
    allPanels: [],
    activePanelId: null, // null = catálogo de painéis; number = painel específico
    searchQuery: '',
    statusFilter: 'all', // 'all', 'online', 'offline'
    viewMode: 'tiles',   // 'tiles' (grade) ou 'table' (tabela)

    setActivePanelId(id) {
        this.activePanelId = id ? parseInt(id, 10) : null;
        this.searchQuery = '';
        this.statusFilter = 'all';
    },

    extractDomain(url) {
        if (!url) return '';
        try {
            const formatted = url.match(/^[a-zA-Z]+:\/\//) ? url : `https://${url}`;
            const parsed = new URL(formatted);
            return parsed.hostname + (parsed.port ? `:${parsed.port}` : '');
        } catch (e) {
            return url.replace(/^https?:\/\//, '').split('/')[0];
        }
    },

    async render() {
        if (this.activePanelId !== null) {
            return this.renderSinglePanelPage();
        }
        return this.renderCatalogPage();
    },

    /**
     * 1. Página Principal de Painéis (#/panels) — Grid com os "Quadrados" dos Painéis
     */
    renderCatalogPage() {
        const canManage = AppState.isAdmin() || AppState.isSupervisor();

        return `
        <div class="page-header" style="margin-bottom: 24px;">
            <div>
                <h3 class="page-title">Painéis e Setores</h3>
                <p class="page-subtitle">Selecione um painel para visualizar e acessar suas aplicações dedicadas</p>
            </div>
            ${canManage ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" id="btn-import-csv-catalog" title="Importar links em massa via arquivo .CSV">
                    <i class="ri-file-upload-line"></i> Importar CSV
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-new-link" title="Cadastrar nova aplicação">
                    <i class="ri-link"></i> Novo Link
                </button>
                <button class="btn btn-primary btn-sm" id="btn-new-panel" title="Criar novo painel ou setor">
                    <i class="ri-add-line"></i> Novo Painel
                </button>
            </div>
            ` : ''}
        </div>

        <!-- Barra de Busca de Painéis -->
        <div class="card" style="margin-bottom: 28px; padding: 16px 20px; box-shadow: var(--shadow-card);">
            <div style="position: relative; width: 100%;">
                <i class="ri-search-line" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.1rem;"></i>
                <input type="text" class="form-input" id="catalog-search-input" 
                       placeholder="Filtrar painéis e setores por nome ou descrição..." 
                       style="padding-left: 42px; border-radius: var(--radius); height: 44px;" />
            </div>
        </div>

        <!-- Grade de Quadrados dos Painéis -->
        <div class="panel-folders-grid" id="catalog-grid-container">
            ${this.renderFolderSkeletons(6)}
        </div>`;
    },

    /**
     * 2. Página Dedicada de um Painel (#/panels/:id) — Contém apenas os links daquele painel
     */
    renderSinglePanelPage() {
        if (!this.allPanels || this.allPanels.length === 0) {
            this.allPanels = AppState.get('panels') || [];
        }
        const panel = this.allPanels.find(p => p.id == this.activePanelId);
        const canManage = AppState.isAdmin() || AppState.isSupervisor();

        if (!panel) {
            return `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('#/panels')" style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);">
                    <i class="ri-arrow-left-line"></i> Voltar para Todos os Painéis
                </button>
            </div>
            <div id="single-panel-hero-container">
                <div class="panel-hero-card">
                    <div class="skeleton" style="height: 80px; width: 100%;"></div>
                </div>
            </div>
            <div class="apps-grid" id="single-panel-links-container">
                ${this.renderLinkSkeletons(3)}
            </div>`;
        }

        const links = panel.links || [];
        const panelColor = panel.color || 'var(--theme-primary)';
        const isPinned = AppState.isPanelPinned(panel.id);

        return `
        <!-- Botão Voltar -->
        <div style="margin-bottom: 18px;">
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('#/panels')" style="display: inline-flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.88rem; padding: 6px 12px; border-radius: var(--radius-sm); background: var(--bg-card); border: 1px solid var(--border-color);">
                <i class="ri-arrow-left-line"></i> Voltar para Painéis
            </button>
        </div>

        <!-- Card Hero do Painel Selecionado -->
        <div class="panel-hero-card" style="border-left: 4px solid ${panelColor};">
            <div class="panel-hero-left">
                <div class="panel-hero-icon" style="background: ${panelColor}1a; color: ${panelColor}; border: 1px solid ${panelColor}33;">
                    <i class="${panel.icon || 'ri-dashboard-line'}"></i>
                </div>
                <div>
                    <h3 class="panel-hero-title">${panel.title}</h3>
                    <p class="panel-hero-desc">${panel.description || 'Painel corporativo de aplicações'}</p>
                    <div style="margin-top: 6px; display: flex; gap: 8px; align-items: center;">
                        <span class="badge" style="background: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border-color); font-size: 0.78rem;">
                            <i class="ri-links-line"></i> <strong>${links.length}</strong> ${links.length === 1 ? 'aplicação' : 'aplicações'}
                        </span>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <!-- Botão Fixar / Desafixar Painel na Barra Lateral -->
                <button class="btn ${isPinned ? 'btn-secondary pinned' : 'btn-ghost'} btn-sm btn-pin-hero" 
                        id="btn-hero-pin-panel"
                        onclick="PanelManager.togglePin(${panel.id}, event)" 
                        title="${isPinned ? 'Desafixar da barra lateral' : 'Fixar na barra lateral'}"
                        style="gap: 6px;">
                    <i class="${isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}" style="${isPinned ? 'color: var(--theme-primary);' : ''}"></i>
                    <span>${isPinned ? 'Fixado na Barra' : 'Fixar na Barra'}</span>
                </button>
                ${canManage ? `
                <button class="btn btn-primary btn-sm" onclick="PanelManager.openLinkForm(null, ${panel.id})" title="Adicionar link neste painel" style="gap: 6px;">
                    <i class="ri-add-line"></i> Adicionar Link
                </button>
                <button class="btn btn-secondary btn-sm" onclick="PanelManager.openCsvImportModal(${panel.id})" title="Subir links em massa via .CSV neste painel" style="gap: 6px;">
                    <i class="ri-file-upload-line"></i> Importar CSV
                </button>
                <button class="btn btn-secondary btn-sm" onclick="PanelManager.openPanelForm(${panel.id})" title="Editar Informações do Painel" style="gap: 6px;">
                    <i class="ri-edit-line"></i> Editar Painel
                </button>
                ` : ''}
                <button class="btn btn-ghost btn-sm" onclick="PanelManager.checkAllLinksInPanel(${panel.id})" title="Verificar status de todos os links deste painel">
                    <i class="ri-refresh-line"></i> Testar Saúde
                </button>
            </div>
        </div>

        <!-- Barra de Busca, Filtros de Status e Alternador de Modo -->
        <div class="card" style="margin-bottom: 24px; padding: 16px 20px; box-shadow: var(--shadow-card);">
            <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                <!-- Busca nos links do painel -->
                <div style="position: relative; flex: 1; min-width: 260px;">
                    <i class="ri-search-line" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.1rem;"></i>
                    <input type="text" class="form-input" id="single-panel-search-input" 
                           placeholder="Buscar sistemas deste painel por nome ou URL..." 
                           style="padding-left: 42px; border-radius: var(--radius); height: 42px;" />
                </div>

                <!-- Filtros de Status -->
                <div style="display: flex; gap: 6px; align-items: center;">
                    <span style="font-size: 0.82rem; color: var(--text-muted); margin-right: 4px; font-weight: 500;">Status:</span>
                    <button class="filter-pill ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">Todos</button>
                    <button class="filter-pill ${this.statusFilter === 'online' ? 'active' : ''}" data-status="online">
                        <span class="health-dot" style="background: var(--status-online); width: 7px; height: 7px; display: inline-block; border-radius: 50%;"></span> Online
                    </button>
                    <button class="filter-pill ${this.statusFilter === 'offline' ? 'active' : ''}" data-status="offline">
                        <span class="health-dot" style="background: var(--status-offline); width: 7px; height: 7px; display: inline-block; border-radius: 50%;"></span> Offline
                    </button>
                </div>

                <!-- Alternador Grade / Tabela -->
                <div class="view-switcher">
                    <button class="view-btn ${this.viewMode === 'tiles' ? 'active' : ''}" id="btn-view-tiles" title="Visualizar em Grade">
                        <i class="ri-grid-fill"></i> Grade
                    </button>
                    <button class="view-btn ${this.viewMode === 'table' ? 'active' : ''}" id="btn-view-table" title="Visualizar em Tabela">
                        <i class="ri-table-line"></i> Tabela
                    </button>
                </div>
            </div>
        </div>

        <!-- Conteúdo dos Links Exclusivos deste Painel -->
        <div id="single-panel-links-container">
            ${this.renderLinksContent(panel)}
        </div>`;
    },

    async loadData() {
        try {
            const res = await API.getPanels();
            this.allPanels = res.data || [];
            AppState.set('panels', this.allPanels);
            AppState.syncPinnedPanelsWith(this.allPanels);

            if (this.activePanelId !== null) {
                const heroContainer = document.getElementById('single-panel-hero-container');
                if (heroContainer) {
                    const contentArea = document.getElementById('content-area');
                    if (contentArea) {
                        contentArea.innerHTML = this.renderSinglePanelPage();
                        this.initEvents();
                    }
                } else {
                    this.renderSinglePanelLinks();
                }
            } else {
                this.renderCatalogGrid();
            }
        } catch (e) {
            console.error('[PanelManager] Erro ao carregar painéis:', e);
            Toast.error('Erro ao carregar catálogo de painéis.');
        }
    },

    initEvents() {
        // Eventos da tela de catálogo (#/panels)
        const catalogSearch = document.getElementById('catalog-search-input');
        if (catalogSearch) {
            catalogSearch.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderCatalogGrid();
            });
        }

        document.getElementById('btn-new-panel')?.addEventListener('click', () => this.openPanelForm());
        document.getElementById('btn-new-link')?.addEventListener('click', () => this.openLinkForm(null, this.activePanelId));
        document.getElementById('btn-import-csv-catalog')?.addEventListener('click', () => this.openCsvImportModal());

        // Eventos da tela de painel específico (#/panels/:id)
        const singleSearch = document.getElementById('single-panel-search-input');
        if (singleSearch) {
            singleSearch.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderSinglePanelLinks();
            });
        }

        document.querySelectorAll('button[data-status]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('button[data-status]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.statusFilter = btn.dataset.status;
                this.renderSinglePanelLinks();
            });
        });

        document.getElementById('btn-view-tiles')?.addEventListener('click', () => {
            this.viewMode = 'tiles';
            document.getElementById('btn-view-tiles')?.classList.add('active');
            document.getElementById('btn-view-table')?.classList.remove('active');
            this.renderSinglePanelLinks();
        });

        document.getElementById('btn-view-table')?.addEventListener('click', () => {
            this.viewMode = 'table';
            document.getElementById('btn-view-table')?.classList.add('active');
            document.getElementById('btn-view-tiles')?.classList.remove('active');
            this.renderSinglePanelLinks();
        });

        if (this.activePanelId !== null) {
            this.initLinksDragDrop(this.activePanelId);
        } else {
            this.initPanelsDragDrop();
        }
    },

    /**
     * Alterna o estado de fixação de um painel na barra lateral
     */
    togglePin(panelId, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        const panel = this.allPanels.find(p => p.id == panelId);
        const isPinned = AppState.togglePinPanel(panel || panelId);

        // Atualiza botão no card do catálogo (se presente no DOM)
        const cardBtn = document.querySelector(`.btn-pin-panel[data-panel-id="${panelId}"]`);
        if (cardBtn) {
            cardBtn.classList.toggle('pinned', isPinned);
            cardBtn.title = isPinned ? 'Desafixar da barra lateral' : 'Fixar na barra lateral';
            const icon = cardBtn.querySelector('i');
            if (icon) {
                icon.className = isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line';
            }
        }

        // Atualiza botão no hero do painel dedicado (se presente no DOM)
        const heroBtn = document.getElementById('btn-hero-pin-panel');
        if (heroBtn && this.activePanelId == panelId) {
            heroBtn.classList.toggle('pinned', isPinned);
            heroBtn.title = isPinned ? 'Desafixar da barra lateral' : 'Fixar na barra lateral';
            const icon = heroBtn.querySelector('i');
            const span = heroBtn.querySelector('span');
            if (icon) {
                icon.className = isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line';
                icon.style.color = isPinned ? 'var(--theme-primary)' : '';
            }
            if (span) {
                span.textContent = isPinned ? 'Fixado na Barra' : 'Fixar na Barra';
            }
        }
    },

    /**
     * Renderiza o Grid de Quadrados dos Painéis no Catálogo (#/panels)
     */
    renderCatalogGrid() {
        const container = document.getElementById('catalog-grid-container');
        if (!container) return;

        let filtered = this.allPanels;
        if (this.searchQuery) {
            const q = this.searchQuery;
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(q) || 
                (p.description && p.description.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; padding: 48px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                    <i class="ri-folder-unknow-line" style="font-size: 3rem; color: var(--text-muted);"></i>
                    <p style="font-size: 1.15rem; font-weight: 600; margin-top: 14px; color: var(--text-primary);">Nenhum painel encontrado</p>
                    <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 420px; margin: 6px auto 0;">Não encontramos painéis que correspondam à sua pesquisa.</p>
                </div>
            `;
            return;
        }

        const canManage = AppState.isAdmin() || AppState.isSupervisor();

        container.innerHTML = filtered.map(panel => {
            const links = panel.links || [];
            const panelColor = panel.color || 'var(--theme-primary)';
            const onlineCount = links.filter(l => l.health_status === 'online').length;
            const isPinned = AppState.isPanelPinned(panel.id);
            const isDraggable = canManage && !this.searchQuery;

            return `
            <div class="panel-folder-card ${isDraggable ? 'draggable-card' : ''}" data-panel-id="${panel.id}" 
                 draggable="${isDraggable ? 'true' : 'false'}"
                 style="border-top: 4px solid ${panelColor};"
                 onclick="Router.navigate('#/panels/${panel.id}')"
                 title="Clique para abrir as aplicações de ${panel.title}${isDraggable ? ' (arraste para reordenar)' : ''}">
                
                <div class="panel-folder-header">
                    <div class="panel-folder-icon" style="background: ${panelColor}1a; color: ${panelColor}; border: 1px solid ${panelColor}33;">
                        <i class="${panel.icon || 'ri-dashboard-line'}"></i>
                    </div>

                    <div style="display: flex; gap: 4px; align-items: center;" onclick="event.stopPropagation();">
                        ${isDraggable ? `
                        <span class="card-drag-handle panel-drag-handle" title="Arraste para reordenar painel" onclick="event.stopPropagation();">
                            <i class="ri-drag-move-2-line"></i>
                        </span>
                        ` : ''}

                        <!-- Botão Fixar / Desafixar da Barra Lateral -->
                        <button class="btn-pin-panel ${isPinned ? 'pinned' : ''}" 
                                data-panel-id="${panel.id}"
                                onclick="PanelManager.togglePin(${panel.id}, event)" 
                                title="${isPinned ? 'Desafixar da barra lateral' : 'Fixar na barra lateral'}">
                            <i class="${isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}"></i>
                        </button>

                        ${canManage ? `
                        <button class="btn btn-ghost btn-sm" onclick="PanelManager.openPanelForm(${panel.id})" title="Editar Painel" style="padding: 4px 8px;">
                            <i class="ri-edit-line"></i>
                        </button>
                        ${AppState.isAdmin() ? `
                        <button class="btn btn-ghost btn-sm" onclick="PanelManager.deletePanel(${panel.id}, '${panel.title}')" title="Excluir Painel" style="color: var(--status-offline); padding: 4px 8px;">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                        ` : ''}
                        ` : ''}
                    </div>
                </div>

                <div>
                    <h4 class="panel-folder-title">${panel.title}</h4>
                    <p class="panel-folder-desc">${panel.description || 'Painel corporativo de aplicações e sistemas'}</p>
                </div>

                <div class="panel-folder-footer">
                    <span class="panel-folder-count">
                        <i class="ri-links-line" style="color: ${panelColor};"></i>
                        <span><strong>${links.length}</strong> ${links.length === 1 ? 'aplicação' : 'aplicações'}</span>
                    </span>

                    <span class="panel-folder-cta">
                        <span>Acessar</span>
                        <i class="ri-arrow-right-line"></i>
                    </span>
                </div>
            </div>
            `;
        }).join('') + (canManage ? `
            <div class="panel-folder-add" onclick="PanelManager.openPanelForm()" title="Criar um novo painel ou setor">
                <div class="panel-folder-add-icon">
                    <i class="ri-add-line"></i>
                </div>
                <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">Novo Painel</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Adicione um novo setor corporativo</div>
            </div>
        ` : '');

        this.initPanelsDragDrop();
    },

    /**
     * Renderiza o conteúdo da página exclusiva do painel (#/panels/:id)
     */
    renderSinglePanelLinks() {
        const container = document.getElementById('single-panel-links-container');
        if (!container) return;

        const panel = this.allPanels.find(p => p.id == this.activePanelId);
        if (!panel) return;

        container.innerHTML = this.renderLinksContent(panel);
        this.initLinksDragDrop(panel.id);
    },

    /**
     * Renderiza ícone ou imagem de favicon com fallback automático
     */
    renderIcon(icon, defaultIcon = 'ri-global-line') {
        if (!icon) icon = defaultIcon;
        if (icon.startsWith('/') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image/')) {
            return `<img src="${icon}" class="app-icon-img" alt="" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline-block';" /><i class="${defaultIcon}" style="display: none;"></i>`;
        }
        return `<i class="${icon}"></i>`;
    },

    renderLinksContent(panel) {
        let links = panel.links || [];
        const panelColor = panel.color || 'var(--theme-primary)';
        const canManage = AppState.isAdmin() || AppState.isSupervisor();

        // Filtro por busca
        if (this.searchQuery) {
            const q = this.searchQuery;
            links = links.filter(l => 
                (l.title && l.title.toLowerCase().includes(q)) ||
                (l.url && l.url.toLowerCase().includes(q)) ||
                (l.description && l.description.toLowerCase().includes(q))
            );
        }

        // Filtro por status
        if (this.statusFilter === 'online') {
            links = links.filter(l => l.health_status === 'online');
        } else if (this.statusFilter === 'offline') {
            links = links.filter(l => l.health_status === 'offline');
        }

        if (links.length === 0) {
            return `
                <div class="empty-state" style="padding: 48px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); text-align: center;">
                    <i class="ri-search-eye-line" style="font-size: 3rem; color: var(--text-muted);"></i>
                    <p style="font-size: 1.15rem; font-weight: 600; margin-top: 14px; color: var(--text-primary);">Nenhuma aplicação encontrada</p>
                    <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 420px; margin: 6px auto 16px;">
                        ${this.searchQuery || this.statusFilter !== 'all' 
                            ? 'Nenhum link corresponde aos filtros ativos.' 
                            : 'Este painel ainda não possui nenhuma aplicação cadastrada.'}
                    </p>
                    ${canManage ? `
                    <button class="btn btn-primary btn-sm" onclick="PanelManager.openLinkForm(null, ${panel.id})">
                        <i class="ri-add-line"></i> Cadastrar Primeira Aplicação
                    </button>
                    ` : ''}
                </div>
            `;
        }

        // Modo Grade de Cards (Tiles)
        if (this.viewMode === 'tiles') {
            return `
            <div class="apps-grid" style="padding: 0;">
                ${links.map(link => {
                    const domain = this.extractDomain(link.url);
                    const isDraggable = canManage && !this.searchQuery && this.statusFilter === 'all';
                    return `
                    <div class="app-tile ${isDraggable ? 'draggable-card' : ''}" 
                         data-link-id="${link.id}" 
                         draggable="${isDraggable ? 'true' : 'false'}"
                         onclick="window.open('${link.url}', '_blank', 'noopener,noreferrer')" 
                         style="cursor: pointer;" 
                         title="Acessar ${link.title} em nova aba${isDraggable ? ' (arraste para reordenar)' : ''}">
                        <div class="app-tile-header">
                            <div class="app-tile-icon" style="background: ${panelColor}18; color: ${panelColor};">
                                ${this.renderIcon(link.icon, 'ri-global-line')}
                            </div>
                            <div class="app-tile-meta">
                                ${isDraggable ? `
                                <span class="card-drag-handle link-drag-handle" title="Arraste para reordenar aplicação" onclick="event.stopPropagation();">
                                    <i class="ri-drag-move-2-line"></i>
                                </span>
                                ` : ''}
                                <span class="health-badge ${link.health_status || 'unknown'}" title="Última checagem: ${link.last_checked_at || 'Nunca'}">
                                    <span class="health-dot"></span>
                                    ${link.health_status === 'online' ? 'Online' : (link.health_status === 'offline' ? 'Offline' : 'Aguardando')}
                                </span>
                                ${link.response_time_ms ? `<span class="health-response">${link.response_time_ms}ms</span>` : ''}
                            </div>
                        </div>

                        <div class="app-tile-body">
                            <div class="app-tile-title">${link.title}</div>
                            <div class="app-tile-domain">
                                <i class="ri-link-m" style="font-size: 0.85rem; color: var(--theme-primary); flex-shrink: 0;"></i>
                                <span style="word-break: break-all;">${domain}</span>
                            </div>
                            ${link.description ? `<div class="app-tile-desc">${link.description}</div>` : ''}
                        </div>

                        <div class="app-tile-footer">
                            <a href="${link.url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="app-tile-access-btn" title="Acessar ${link.title} em nova aba">
                                <span>Acessar Sistema</span>
                                <i class="ri-arrow-right-up-line"></i>
                            </a>

                            <div class="app-tile-actions" onclick="event.stopPropagation()">
                                <button class="btn btn-ghost btn-sm" onclick="PanelManager.copyUrl('${link.url}')" title="Copiar URL" style="padding: 6px 8px;">
                                    <i class="ri-file-copy-line"></i>
                                </button>
                                <button class="btn btn-ghost btn-sm" onclick="PanelManager.checkSingleLink(${link.id}, this)" title="Testar Disponibilidade Agora" style="padding: 6px 8px;">
                                    <i class="ri-refresh-line"></i>
                                </button>
                                ${canManage ? `
                                <button class="btn btn-ghost btn-sm" onclick="PanelManager.openLinkForm(${link.id}, ${panel.id})" title="Editar Link" style="padding: 6px 8px;">
                                    <i class="ri-edit-line"></i>
                                </button>
                                <button class="btn btn-ghost btn-sm" onclick="PanelManager.deleteLink(${link.id}, '${link.title}')" title="Excluir Link" style="color: var(--status-offline); padding: 6px 8px;">
                                    <i class="ri-delete-bin-line"></i>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}

                ${canManage ? `
                <div class="app-tile-add" onclick="PanelManager.openLinkForm(null, ${panel.id})" title="Cadastrar nova aplicação em ${panel.title}">
                    <div class="app-tile-add-icon">
                        <i class="ri-add-line"></i>
                    </div>
                    <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Adicionar Aplicação</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Novo link em ${panel.title}</div>
                </div>
                ` : ''}
            </div>
            `;
        }

        // Modo Tabela Detalhada
        return `
        <div class="app-table-container" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-card);">
            <table class="app-table">
                <thead>
                    <tr>
                        <th>Aplicação</th>
                        <th>Endereço / Domínio</th>
                        <th>Status</th>
                        <th>Latência</th>
                        <th style="text-align: right;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${links.map(link => {
                        const domain = this.extractDomain(link.url);
                        return `
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="link-icon" style="background: ${panelColor}15; color: ${panelColor}; width: 38px; height: 38px; border-radius: var(--radius-sm); font-size: 1.15rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                        ${this.renderIcon(link.icon, 'ri-global-line')}
                                    </div>
                                    <div style="min-width: 0;">
                                        <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem; word-break: break-word;">${link.title}</div>
                                        ${link.description ? `<div style="font-size: 0.78rem; color: var(--text-muted); word-break: break-word;">${link.description}</div>` : ''}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary); font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px; word-break: break-all;">
                                    <span>${domain}</span>
                                    <i class="ri-external-link-line" style="font-size: 0.75rem; color: var(--theme-primary);"></i>
                                </a>
                            </td>
                            <td>
                                <span class="health-badge ${link.health_status || 'unknown'}">
                                    <span class="health-dot"></span>
                                    ${link.health_status === 'online' ? 'Online' : (link.health_status === 'offline' ? 'Offline' : 'Aguardando')}
                                </span>
                            </td>
                            <td>
                                ${link.response_time_ms ? `<span class="health-response">${link.response_time_ms}ms</span>` : '<span style="color: var(--text-muted); font-size: 0.8rem;">—</span>'}
                            </td>
                            <td style="text-align: right;">
                                <div style="display: inline-flex; align-items: center; gap: 6px;">
                                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="padding: 5px 10px; font-size: 0.8rem;">
                                        <i class="ri-arrow-right-up-line"></i> Acessar
                                    </a>
                                    <button class="btn btn-ghost btn-sm" onclick="PanelManager.copyUrl('${link.url}')" title="Copiar Link" style="padding: 5px 7px;">
                                        <i class="ri-file-copy-line"></i>
                                    </button>
                                    <button class="btn btn-ghost btn-sm" onclick="PanelManager.checkSingleLink(${link.id}, this)" title="Testar Saúde" style="padding: 5px 7px;">
                                        <i class="ri-refresh-line"></i>
                                    </button>
                                    ${canManage ? `
                                    <button class="btn btn-ghost btn-sm" onclick="PanelManager.openLinkForm(${link.id}, ${panel.id})" title="Editar Link" style="padding: 5px 7px;">
                                        <i class="ri-edit-line"></i>
                                    </button>
                                    <button class="btn btn-ghost btn-sm" onclick="PanelManager.deleteLink(${link.id}, '${link.title}')" title="Excluir Link" style="color: var(--status-offline); padding: 5px 7px;">
                                        <i class="ri-delete-bin-line"></i>
                                    </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    /**
     * Habilita reordenação por arrastar e soltar (Drag & Drop) dos Links de um painel
     */
    initLinksDragDrop(panelId) {
        const canManage = AppState.isAdmin() || AppState.isSupervisor();
        if (!canManage || this.searchQuery || this.statusFilter !== 'all' || this.viewMode !== 'tiles') {
            return;
        }

        const grid = document.querySelector('#single-panel-links-container .apps-grid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.app-tile[draggable="true"]');
        let draggedCard = null;

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedCard = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.dataset.linkId);
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (card !== draggedCard) {
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', async (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');
                if (draggedCard && card !== draggedCard) {
                    const rect = card.getBoundingClientRect();
                    const next = (e.clientX - rect.left) / (rect.right - rect.left) > 0.5;
                    grid.insertBefore(draggedCard, next ? card.nextSibling : card);

                    const orderedIds = Array.from(grid.querySelectorAll('.app-tile'))
                        .map(el => parseInt(el.dataset.linkId, 10))
                        .filter(id => !isNaN(id) && id > 0);

                    try {
                        await API.reorderLinks(orderedIds);
                        Toast.success('Ordem das aplicações atualizada com sucesso!');
                        const p = this.allPanels.find(x => x.id == panelId);
                        if (p && p.links) {
                            p.links.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
                        }
                    } catch (err) {
                        console.error('[PanelManager] Erro ao reordenar links:', err);
                        Toast.error('Erro ao salvar nova ordem dos links.');
                    }
                }
            });

            card.addEventListener('dragend', () => {
                cards.forEach(c => {
                    c.classList.remove('dragging');
                    c.classList.remove('drag-over');
                });
                draggedCard = null;
            });
        });
    },

    /**
     * Habilita reordenação por arrastar e soltar (Drag & Drop) dos Painéis no Catálogo
     */
    initPanelsDragDrop() {
        const canManage = AppState.isAdmin() || AppState.isSupervisor();
        if (!canManage || this.searchQuery) return;

        const grid = document.getElementById('catalog-grid-container');
        if (!grid) return;

        const cards = grid.querySelectorAll('.panel-folder-card[draggable="true"]');
        let draggedCard = null;

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedCard = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.dataset.panelId);
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (card !== draggedCard) {
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', async (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');
                if (draggedCard && card !== draggedCard) {
                    const rect = card.getBoundingClientRect();
                    const next = (e.clientX - rect.left) / (rect.right - rect.left) > 0.5;
                    grid.insertBefore(draggedCard, next ? card.nextSibling : card);

                    const orderedIds = Array.from(grid.querySelectorAll('.panel-folder-card'))
                        .map(el => parseInt(el.dataset.panelId, 10))
                        .filter(id => !isNaN(id) && id > 0);

                    try {
                        await API.reorderPanels(orderedIds);
                        Toast.success('Ordem dos painéis atualizada com sucesso!');
                        this.allPanels.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
                        AppState.set('panels', this.allPanels);
                    } catch (err) {
                        console.error('[PanelManager] Erro ao reordenar painéis:', err);
                        Toast.error('Erro ao salvar nova ordem dos painéis.');
                    }
                }
            });

            card.addEventListener('dragend', () => {
                cards.forEach(c => {
                    c.classList.remove('dragging');
                    c.classList.remove('drag-over');
                });
                draggedCard = null;
            });
        });
    },

    copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            Toast.success('Link copiado para a área de transferência!');
        }).catch(() => {
            Toast.info(url);
        });
    },

    async checkSingleLink(linkId, buttonEl) {
        const icon = buttonEl?.querySelector('i');
        if (icon) icon.className = 'ri-refresh-line spin';

        try {
            await API.healthCheck();
            Toast.success('Health check concluído.');
            this.loadData();
        } catch (e) {
            Toast.error('Erro ao verificar disponibilidade.');
        } finally {
            if (icon) icon.className = 'ri-refresh-line';
        }
    },

    async checkAllLinksInPanel(panelId) {
        try {
            Toast.info('Executando health check nos serviços...');
            await API.healthCheck();
            Toast.success('Health check concluído.');
            this.loadData();
        } catch (e) {
            Toast.error('Erro ao verificar disponibilidade.');
        }
    },

    async openPanelForm(panelId = null) {
        const isEdit = panelId !== null;
        const panel = isEdit ? this.allPanels.find(p => p.id === panelId) : null;

        const iconOptions = [
            'ri-dashboard-line', 'ri-cloud-line', 'ri-lock-line', 'ri-tools-line',
            'ri-money-dollar-circle-line', 'ri-user-heart-line', 'ri-global-line',
            'ri-database-line', 'ri-shield-keyhole-line', 'ri-cpu-line', 'ri-server-line', 'ri-pulse-line'
        ];

        const colorOptions = [
            '#AB17EE', '#8129A9', '#00c4bf', '#008c77', '#f05a28',
            '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'
        ];

        Modal.open({
            title: isEdit ? 'Editar Painel' : 'Novo Painel / Setor',
            content: `
                <div class="form-group">
                    <label class="form-label">Nome do Painel</label>
                    <input type="text" class="form-input" id="form-panel-title" value="${panel?.title || ''}" placeholder="Ex.: DevOps & Cloud" />
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <input type="text" class="form-input" id="form-panel-desc" value="${panel?.description || ''}" placeholder="Sistemas e ferramentas de infraestrutura" />
                </div>
                <div class="form-group">
                    <label class="form-label">Ícone</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                        ${iconOptions.map(ico => `
                            <button type="button" class="icon-option ${panel?.icon === ico ? 'active' : ''}" data-icon="${ico}" 
                                    style="width: 38px; height: 38px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-elevated); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                                <i class="${ico}"></i>
                            </button>
                        `).join('')}
                    </div>
                    <input type="text" class="form-input" id="form-panel-icon" value="${panel?.icon || 'ri-dashboard-line'}" placeholder="Ou digite a classe RemixIcon" />
                </div>
                <div class="form-group">
                    <label class="form-label">Cor de Destaque</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                        ${colorOptions.map(col => `
                            <div class="color-option ${panel?.color === col ? 'active' : ''}" data-color="${col}" 
                                 style="width: 32px; height: 32px; border-radius: 50%; background: ${col}; cursor: pointer; border: 2px solid ${(panel?.color === col || (!panel?.color && col === '#AB17EE')) ? '#ffffff' : 'transparent'};"></div>
                        `).join('')}
                    </div>
                    <input type="hidden" id="form-panel-color" value="${panel?.color || '#AB17EE'}" />
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-panel">
                    <i class="ri-save-line"></i> ${isEdit ? 'Salvar Alterações' : 'Criar Painel'}
                </button>
            `
        });

        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.icon-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('form-panel-icon').value = btn.dataset.icon;
            });
        });

        document.querySelectorAll('.color-option').forEach(div => {
            div.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(d => {
                    d.classList.remove('active');
                    d.style.borderColor = 'transparent';
                });
                div.classList.add('active');
                div.style.borderColor = '#ffffff';
                document.getElementById('form-panel-color').value = div.dataset.color;
            });
        });

        document.getElementById('btn-save-panel')?.addEventListener('click', async () => {
            const title = document.getElementById('form-panel-title').value.trim();
            if (!title) {
                Toast.error('Informe o título do painel.');
                return;
            }

            const data = {
                title,
                description: document.getElementById('form-panel-desc').value.trim(),
                icon: document.getElementById('form-panel-icon').value,
                color: document.getElementById('form-panel-color').value,
            };

            try {
                if (isEdit) {
                    await API.updatePanel(panelId, data);
                    Toast.success('Painel atualizado com sucesso.');
                } else {
                    await API.createPanel(data);
                    Toast.success('Painel criado com sucesso.');
                }
                Modal.close();
                this.loadData();
            } catch (e) {
                Toast.error(e.message || 'Erro ao salvar painel.');
            }
        });
    },

    async deletePanel(panelId, title) {
        const confirmed = await Modal.confirm({
            title: 'Excluir Painel',
            message: `Tem certeza que deseja excluir o painel <strong>${title}</strong> e todos os seus links?`,
            confirmText: 'Excluir',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await API.deletePanel(panelId);
                Toast.success('Painel removido com sucesso.');
                if (this.activePanelId == panelId) {
                    Router.navigate('#/panels');
                } else {
                    this.loadData();
                }
            } catch (e) {
                Toast.error(e.message || 'Erro ao excluir painel.');
            }
        }
    },

    async openLinkForm(linkId = null, targetPanelId = null) {
        const isEdit = linkId !== null;
        let link = null;
        
        let currentPanelId = targetPanelId !== null 
            ? targetPanelId 
            : (this.activePanelId !== null ? this.activePanelId : (this.allPanels[0]?.id || 0));

        if (isEdit) {
            for (const p of this.allPanels) {
                const found = (p.links || []).find(l => l.id === linkId);
                if (found) {
                    link = found;
                    currentPanelId = p.id;
                    break;
                }
            }
        }

        Modal.open({
            title: isEdit ? 'Editar Link de Aplicação' : 'Novo Link de Aplicação',
            content: `
                <div class="form-group">
                    <label class="form-label">Painel / Setor de Destino</label>
                    <select class="form-input form-select" id="form-link-panel">
                        ${this.allPanels.map(p => `
                            <option value="${p.id}" ${currentPanelId == p.id ? 'selected' : ''}>${p.title}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nome da Aplicação</label>
                    <input type="text" class="form-input" id="form-link-title" value="${link?.title || ''}" placeholder="Ex.: Flowti Agent, Cloud Inventory, etc." />
                </div>
                <div class="form-group">
                    <label class="form-label">URL ou Domínio</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" class="form-input" id="form-link-url" value="${link?.url || ''}" placeholder="ex.: https://dash.flowti.com.br ou sistema.flowti.com.br" style="flex: 1;" />
                        <button type="button" class="btn-detect-favicon" id="btn-detect-favicon" title="Detectar e baixar favicon automaticamente">
                            <i class="ri-magic-line"></i> <span>Detectar</span>
                        </button>
                    </div>
                    <small style="color: var(--text-muted); font-size: 0.78rem; margin-top: 4px; display: block;">
                        <i class="ri-information-line"></i> Aceita URLs completas com <code>https://</code> ou domínios diretos. O favicon é detectado automaticamente ao preencher.
                    </small>
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição da Aplicação (Opcional)</label>
                    <input type="text" class="form-input" id="form-link-desc" value="${link?.description || ''}" placeholder="Ex.: Portal de monitoramento e NOC" />
                </div>
                <div class="form-group">
                    <label class="form-label">Ícone ou Favicon</label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="link-icon-preview-box" id="link-icon-preview">
                            ${this.renderIcon(link?.icon || 'ri-global-line')}
                        </div>
                        <div style="flex: 1;">
                            <input type="text" class="form-input" id="form-link-icon" value="${link?.icon || 'ri-global-line'}" placeholder="ri-global-line ou caminho do favicon" />
                            <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px; display: block;">
                                Use uma classe RemixIcon (ex: <code>ri-cloud-line</code>) ou o caminho do favicon detectado.
                            </small>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-link">
                    <i class="ri-save-line"></i> ${isEdit ? 'Salvar Alterações' : 'Cadastrar Aplicação'}
                </button>
            `
        });

        // Eventos do Formulário de Link & Detecção de Favicon
        const urlInput = document.getElementById('form-link-url');
        const iconInput = document.getElementById('form-link-icon');
        const iconPreview = document.getElementById('link-icon-preview');
        const detectBtn = document.getElementById('btn-detect-favicon');

        const updatePreview = (val) => {
            if (iconPreview) {
                iconPreview.innerHTML = this.renderIcon(val || 'ri-global-line');
            }
        };

        iconInput?.addEventListener('input', (e) => {
            updatePreview(e.target.value.trim());
        });

        const runFaviconDetection = async (showToast = false) => {
            const url = urlInput?.value.trim();
            if (!url || url.length < 4) {
                if (showToast) Toast.error('Informe uma URL válida para detectar o favicon.');
                return;
            }

            if (detectBtn) {
                detectBtn.disabled = true;
                detectBtn.innerHTML = '<i class="ri-loader-4-line spin"></i> <span>Detectando...</span>';
            }

            try {
                const res = await API.detectFavicon(url);
                if (res.data && res.data.found && res.data.icon_url) {
                    iconInput.value = res.data.icon_url;
                    updatePreview(res.data.icon_url);
                    if (showToast) Toast.success('Favicon detectado e baixado com sucesso!');
                } else if (res.data && res.data.suggested_icon) {
                    const current = iconInput.value.trim();
                    if (!current || current === 'ri-global-line' || current === 'ri-links-line') {
                        iconInput.value = res.data.suggested_icon;
                        updatePreview(res.data.suggested_icon);
                    }
                    if (showToast) Toast.info(res.data.message || 'Ícone contextual sugerido.');
                }
            } catch (err) {
                if (showToast) Toast.error('Não foi possível obter o favicon do destino.');
            } finally {
                if (detectBtn) {
                    detectBtn.disabled = false;
                    detectBtn.innerHTML = '<i class="ri-magic-line"></i> <span>Detectar</span>';
                }
            }
        };

        detectBtn?.addEventListener('click', () => runFaviconDetection(true));

        // Auto-detect ao perder foco da URL se for novo link ou ícone padrão
        urlInput?.addEventListener('blur', () => {
            const current = iconInput?.value.trim();
            if (!current || current === 'ri-global-line' || current === 'ri-links-line') {
                runFaviconDetection(false);
            }
        });

        document.getElementById('btn-save-link')?.addEventListener('click', async () => {
            const title = document.getElementById('form-link-title').value.trim();
            const url = document.getElementById('form-link-url').value.trim();
            const panelId = parseInt(document.getElementById('form-link-panel').value, 10);

            if (!title || !url) {
                Toast.error('Preencha o título e o endereço (URL) da aplicação.');
                return;
            }

            const data = {
                panel_id: panelId,
                title,
                url,
                description: document.getElementById('form-link-desc').value.trim(),
                icon: document.getElementById('form-link-icon').value.trim() || 'ri-global-line',
            };

            const saveBtn = document.getElementById('btn-save-link');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="ri-loader-4-line spin"></i> Salvando...';
            }

            try {
                if (isEdit) {
                    await API.updateLink(linkId, data);
                    Toast.success('Aplicação atualizada com sucesso.');
                } else {
                    await API.createLink(data);
                    Toast.success('Aplicação cadastrada com sucesso.');
                }
                Modal.close();
                this.loadData();
            } catch (e) {
                Toast.error(e.message || 'Erro ao salvar aplicação.');
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = `<i class="ri-save-line"></i> ${isEdit ? 'Salvar Alterações' : 'Cadastrar Aplicação'}`;
                }
            }
        });
    },

    async deleteLink(linkId, title) {
        const confirmed = await Modal.confirm({
            title: 'Excluir Link',
            message: `Tem certeza que deseja excluir a aplicação <strong>${title}</strong>?`,
            confirmText: 'Excluir',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await API.deleteLink(linkId);
                Toast.success('Aplicação removida com sucesso.');
                this.loadData();
            } catch (e) {
                Toast.error(e.message || 'Erro ao excluir aplicação.');
            }
        }
    },

    /**
     * Modal de Importação de Links em Massa via Arquivo CSV
     */
    openCsvImportModal(targetPanelId = null) {
        let currentPanelId = targetPanelId || this.activePanelId;
        if (!currentPanelId && this.allPanels.length > 0) {
            currentPanelId = this.allPanels[0].id;
        }

        let parsedCsvData = [];
        let rawCsvContent = '';

        Modal.open({
            title: '<i class="ri-file-excel-2-line" style="color: #10b981; vertical-align: middle; margin-right: 6px;"></i> Importar Links em Massa (.CSV)',
            size: 'lg',
            content: `
                <div style="margin-bottom: 16px;">
                    <label class="form-label" style="font-weight: 600;">Painel de Destino <span style="color: var(--status-offline);">*</span></label>
                    <select class="form-input form-select" id="csv-target-panel" style="font-size: 0.92rem;">
                        ${this.allPanels.map(p => `
                            <option value="${p.id}" ${p.id == currentPanelId ? 'selected' : ''}>
                                ${p.title}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Banner Informativo e Botão Baixar Modelo -->
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 14px 18px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
                    <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45;">
                        <strong style="color: var(--text-primary);">Colunas aceitas:</strong> <code>titulo;url;descricao;icone</code> ou <code>title,url,description,icon</code><br>
                        <span style="color: var(--text-muted); font-size: 0.77rem;">
                            Suporta delimitador vírgula <code>,</code> ou ponto e vírgula <code>;</code>. URLs sem <code>https://</code> são completadas automaticamente.
                        </span>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-download-csv-template" style="gap: 6px; font-weight: 500;">
                        <i class="ri-download-2-line"></i> Baixar Modelo .CSV
                    </button>
                </div>

                <!-- Dropzone de Arquivo CSV -->
                <div id="csv-dropzone" style="border: 2px dashed var(--border-color); border-radius: var(--radius); padding: 26px 20px; text-align: center; background: var(--bg-body); cursor: pointer; transition: all 0.2s ease; margin-bottom: 16px;">
                    <i class="ri-upload-cloud-2-line" style="font-size: 2.4rem; color: var(--theme-primary); display: block; margin-bottom: 8px;"></i>
                    <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 4px;">Arraste e solte o arquivo .CSV aqui</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">ou clique no botão para selecionar do seu dispositivo</div>
                    <input type="file" id="csv-file-input" accept=".csv,text/csv,text/plain" style="display: none;" />
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-browse-csv-file" style="gap: 6px;">
                        <i class="ri-folder-open-line"></i> Procurar Arquivo .CSV
                    </button>
                    <div id="csv-selected-badge" style="display: none; margin-top: 12px;">
                        <span class="badge" style="background: var(--theme-primary)22; color: var(--theme-primary); border: 1px solid var(--theme-primary)44; font-size: 0.82rem; padding: 4px 10px;">
                            <i class="ri-file-text-line"></i> <span id="csv-selected-filename">arquivo.csv</span> (<span id="csv-selected-filesize">0 KB</span>)
                        </span>
                    </div>
                </div>

                <!-- Ou Colar Texto Diretamente -->
                <details id="csv-details-paste" style="margin-bottom: 16px;">
                    <summary style="font-size: 0.82rem; color: var(--text-muted); cursor: pointer; user-select: none; font-weight: 500; padding: 4px 0;">
                        <i class="ri-edit-line"></i> Ou cole o conteúdo do CSV em texto
                    </summary>
                    <div style="margin-top: 8px;">
                        <textarea id="csv-raw-textarea" class="form-input" rows="5" placeholder="titulo;url;descricao;icone&#10;Portal ERP;https://erp.empresa.com.br;Sistema de Gestão Principal;ri-server-line&#10;Grafana;grafana.empresa.com.br;Métricas de Infraestrutura;ri-dashboard-line" style="font-family: monospace; font-size: 0.8rem; resize: vertical;"></textarea>
                    </div>
                </details>

                <!-- Feedback / Erros -->
                <div id="csv-feedback-box" style="display: none; margin-bottom: 14px; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.82rem;"></div>

                <!-- Preview em Tabela -->
                <div id="csv-preview-container" style="display: none; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);">
                            <i class="ri-eye-line"></i> Pré-visualização (<span id="csv-preview-count">0</span> links prontos)
                        </span>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.74rem;">
                            <i class="ri-check-line"></i> CSV Válido
                        </span>
                    </div>
                    <div style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                        <table class="table" style="width: 100%; font-size: 0.78rem; margin: 0;">
                            <thead>
                                <tr style="background: var(--bg-body);">
                                    <th style="padding: 6px 10px;">#</th>
                                    <th style="padding: 6px 10px;">Nome / Título</th>
                                    <th style="padding: 6px 10px;">URL</th>
                                    <th style="padding: 6px 10px;">Descrição</th>
                                    <th style="padding: 6px 10px;">Ícone</th>
                                </tr>
                            </thead>
                            <tbody id="csv-preview-tbody"></tbody>
                        </table>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-submit-csv-import" disabled style="gap: 6px;">
                    <i class="ri-upload-cloud-line"></i> Subir Links (.CSV)
                </button>
            `
        });

        const fileInput = document.getElementById('csv-file-input');
        const dropzone = document.getElementById('csv-dropzone');
        const browseBtn = document.getElementById('btn-browse-csv-file');
        const rawTextarea = document.getElementById('csv-raw-textarea');
        const templateBtn = document.getElementById('btn-download-csv-template');
        const submitBtn = document.getElementById('btn-submit-csv-import');
        const previewContainer = document.getElementById('csv-preview-container');
        const previewCount = document.getElementById('csv-preview-count');
        const previewTbody = document.getElementById('csv-preview-tbody');
        const feedbackBox = document.getElementById('csv-feedback-box');
        const selectedBadge = document.getElementById('csv-selected-badge');
        const selectedFilename = document.getElementById('csv-selected-filename');
        const selectedFilesize = document.getElementById('csv-selected-filesize');

        // 1. Download de Modelo CSV
        templateBtn?.addEventListener('click', () => {
            const templateContent = [
                'titulo;url;descricao;icone',
                'Portal ERP;https://erp.suaempresa.com.br;Sistema ERP e Financeiro;ri-server-line',
                'Monitoramento Grafana;https://grafana.suaempresa.com.br;Dashboards de infra e métricas;ri-dashboard-line',
                'GitLab Corporativo;https://gitlab.suaempresa.com.br;Repositórios e pipelines CI/CD;ri-git-branch-line',
                'Central de Atendimento;https://suporte.suaempresa.com.br;Abertura de chamados internos;ri-customer-service-2-line'
            ].join('\r\n');

            const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'modelo_links_flowti.csv';
            link.click();
            URL.revokeObjectURL(link.href);
        });

        // 2. Parser rápido do lado cliente para Preview
        const parseAndPreviewCsv = (text) => {
            rawCsvContent = text || '';
            feedbackBox.style.display = 'none';

            if (!rawCsvContent.trim()) {
                previewContainer.style.display = 'none';
                submitBtn.disabled = true;
                return;
            }

            const lines = rawCsvContent.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length <= 1) {
                previewContainer.style.display = 'none';
                submitBtn.disabled = true;
                feedbackBox.style.display = 'block';
                feedbackBox.style.background = 'rgba(239, 68, 68, 0.1)';
                feedbackBox.style.color = 'var(--status-offline)';
                feedbackBox.style.border = '1px solid rgba(239, 68, 68, 0.2)';
                feedbackBox.innerHTML = '<i class="ri-error-warning-line"></i> O arquivo precisa ter um cabeçalho e pelo menos 1 linha de dados.';
                return;
            }

            const headerLine = lines[0];
            const delimiter = (headerLine.match(/;/g) || []).length >= (headerLine.match(/,/g) || []).length ? ';' : ',';
            const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

            let colTitle = headers.findIndex(h => ['title', 'titulo', 'título', 'nome', 'name'].includes(h));
            let colUrl = headers.findIndex(h => ['url', 'link', 'uri', 'endereco', 'endereço'].includes(h));
            let colDesc = headers.findIndex(h => ['description', 'descricao', 'descrição', 'desc'].includes(h));
            let colIcon = headers.findIndex(h => ['icon', 'icone', 'ícone'].includes(h));

            if (colTitle === -1) colTitle = 0;
            if (colUrl === -1) colUrl = 1;
            if (colDesc === -1) colDesc = 2;
            if (colIcon === -1) colIcon = 3;

            parsedCsvData = [];
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
                const title = parts[colTitle] || '';
                const url = parts[colUrl] || '';
                const desc = parts[colDesc] || '';
                const icon = parts[colIcon] || 'ri-global-line';

                if (title && url) {
                    parsedCsvData.push({ title, url, desc, icon });
                }
            }

            if (parsedCsvData.length === 0) {
                previewContainer.style.display = 'none';
                submitBtn.disabled = true;
                feedbackBox.style.display = 'block';
                feedbackBox.style.background = 'rgba(239, 68, 68, 0.1)';
                feedbackBox.style.color = 'var(--status-offline)';
                feedbackBox.style.border = '1px solid rgba(239, 68, 68, 0.2)';
                feedbackBox.innerHTML = '<i class="ri-error-warning-line"></i> Nenhuma linha válida com Título e URL foi encontrada no CSV.';
                return;
            }

            // Exibe Preview
            previewCount.textContent = parsedCsvData.length;
            previewTbody.innerHTML = parsedCsvData.slice(0, 8).map((row, idx) => `
                <tr>
                    <td style="padding: 6px 10px; color: var(--text-muted);">${idx + 1}</td>
                    <td style="padding: 6px 10px; font-weight: 500; color: var(--text-primary);">${row.title}</td>
                    <td style="padding: 6px 10px; color: var(--theme-primary); font-family: monospace;">${row.url}</td>
                    <td style="padding: 6px 10px; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${row.desc || '-'}</td>
                    <td style="padding: 6px 10px;"><i class="${row.icon}"></i> <span style="font-size: 0.72rem; color: var(--text-muted);">${row.icon}</span></td>
                </tr>
            `).join('') + (parsedCsvData.length > 8 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 6px; font-style: italic;">... e mais ${parsedCsvData.length - 8} links</td></tr>` : '');

            previewContainer.style.display = 'block';
            submitBtn.disabled = false;
        };

        // 3. Leitura de arquivo selecionado
        const handleFileSelected = (file) => {
            if (!file) return;
            if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'text/plain') {
                Toast.warning('Por favor selecione um arquivo com extensão .csv');
                return;
            }

            selectedFilename.textContent = file.name;
            selectedFilesize.textContent = (file.size / 1024).toFixed(1) + ' KB';
            selectedBadge.style.display = 'inline-block';

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                rawTextarea.value = text;
                parseAndPreviewCsv(text);
            };
            reader.onerror = () => {
                Toast.error('Erro ao ler o arquivo CSV selecionado.');
            };
            reader.readAsText(file, 'UTF-8');
        };

        browseBtn?.addEventListener('click', () => fileInput.click());
        fileInput?.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
            }
        });

        // 4. Drag and Drop no dropzone
        dropzone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--theme-primary)';
            dropzone.style.background = 'var(--bg-elevated)';
        });
        dropzone?.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--border-color)';
            dropzone.style.background = 'var(--bg-body)';
        });
        dropzone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--border-color)';
            dropzone.style.background = 'var(--bg-body)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelected(e.dataTransfer.files[0]);
            }
        });

        // 5. Input manual no textarea
        rawTextarea?.addEventListener('input', (e) => {
            parseAndPreviewCsv(e.target.value);
        });

        // 6. Envio para a API
        submitBtn?.addEventListener('click', async () => {
            const panelSelect = document.getElementById('csv-target-panel');
            const panelId = parseInt(panelSelect.value, 10);

            if (!panelId) {
                Toast.error('Selecione um painel de destino.');
                return;
            }

            if (!rawCsvContent.trim()) {
                Toast.warning('Nenhum dado CSV para importar.');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Importando links...';

                const response = await API.importLinksCsv(panelId, rawCsvContent);
                const data = response.data || {};
                const totalImported = data.total_imported || 0;
                const totalErrors = data.total_errors || 0;

                if (totalImported > 0) {
                    Toast.success(`${totalImported} ${totalImported === 1 ? 'link importado' : 'links importados'} com sucesso!`);
                }

                if (totalErrors > 0) {
                    const errLines = (data.errors || []).map(err => `Linha ${err.line}: ${err.error}`).join('\\n');
                    Toast.warning(`${totalErrors} ${totalErrors === 1 ? 'linha com erro foi ignorada' : 'linhas com erro foram ignoradas'}.`);
                    console.warn('[CSV Import Errors]', errLines);
                }

                Modal.close();
                await this.loadData();
            } catch (err) {
                console.error('[CSV Import Error]', err);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ri-upload-cloud-line"></i> Subir Links (.CSV)';
                feedbackBox.style.display = 'block';
                feedbackBox.style.background = 'rgba(239, 68, 68, 0.1)';
                feedbackBox.style.color = 'var(--status-offline)';
                feedbackBox.style.border = '1px solid rgba(239, 68, 68, 0.2)';
                feedbackBox.innerHTML = `<i class="ri-error-warning-line"></i> ${err.message || 'Falha na importação do CSV.'}`;
            }
        });
    },

    renderFolderSkeletons(count) {
        return Array(count).fill(`
            <div class="panel-folder-card" style="min-height: 180px;">
                <div class="skeleton" style="width: 52px; height: 52px; border-radius: var(--radius); margin-bottom: 12px;"></div>
                <div class="skeleton" style="width: 140px; height: 18px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 200px; height: 12px; margin-bottom: 16px;"></div>
                <div class="skeleton" style="width: 100%; height: 24px; border-radius: var(--radius-sm);"></div>
            </div>
        `).join('');
    },

    renderLinkSkeletons(count) {
        return Array(count).fill(`
            <div class="app-tile">
                <div class="skeleton" style="height: 40px; border-radius: var(--radius-sm); margin-bottom: 12px;"></div>
                <div class="skeleton" style="height: 16px; margin-bottom: 6px;"></div>
                <div class="skeleton" style="height: 12px; margin-bottom: 12px;"></div>
                <div class="skeleton" style="height: 36px; border-radius: var(--radius-sm);"></div>
            </div>
        `).join('');
    }
};
