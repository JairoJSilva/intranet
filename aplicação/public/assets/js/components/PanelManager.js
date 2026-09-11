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
            <div style="display: flex; gap: 8px;">
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
        const panel = this.allPanels.find(p => p.id == this.activePanelId);
        const canManage = AppState.isAdmin() || AppState.isSupervisor();

        if (!panel) {
            return `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('#/panels')" style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);">
                    <i class="ri-arrow-left-line"></i> Voltar para Todos os Painéis
                </button>
            </div>
            <div class="panel-hero-card">
                <div class="skeleton" style="height: 80px; width: 100%;"></div>
            </div>
            <div class="apps-grid" id="single-panel-links-container">
                ${this.renderLinkSkeletons(3)}
            </div>`;
        }

        const links = panel.links || [];
        const panelColor = panel.color || 'var(--theme-primary)';

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
                ${canManage ? `
                <button class="btn btn-primary btn-sm" onclick="PanelManager.openLinkForm(null, ${panel.id})" title="Adicionar link neste painel" style="gap: 6px;">
                    <i class="ri-add-line"></i> Adicionar Link
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

            if (this.activePanelId !== null) {
                this.renderSinglePanelLinks();
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

            return `
            <div class="panel-folder-card" data-panel-id="${panel.id}" 
                 style="border-top: 4px solid ${panelColor};"
                 onclick="Router.navigate('#/panels/${panel.id}')"
                 title="Clique para abrir as aplicações de ${panel.title}">
                
                <div class="panel-folder-header">
                    <div class="panel-folder-icon" style="background: ${panelColor}1a; color: ${panelColor}; border: 1px solid ${panelColor}33;">
                        <i class="${panel.icon || 'ri-dashboard-line'}"></i>
                    </div>

                    ${canManage ? `
                    <div style="display: flex; gap: 4px;" onclick="event.stopPropagation();">
                        <button class="btn btn-ghost btn-sm" onclick="PanelManager.openPanelForm(${panel.id})" title="Editar Painel" style="padding: 4px 8px;">
                            <i class="ri-edit-line"></i>
                        </button>
                        ${AppState.isAdmin() ? `
                        <button class="btn btn-ghost btn-sm" onclick="PanelManager.deletePanel(${panel.id}, '${panel.title}')" title="Excluir Painel" style="color: var(--status-offline); padding: 4px 8px;">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                        ` : ''}
                    </div>
                    ` : ''}
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
                    return `
                    <div class="app-tile" data-link-id="${link.id}">
                        <div class="app-tile-header">
                            <div class="app-tile-icon" style="background: ${panelColor}18; color: ${panelColor};">
                                <i class="${link.icon || 'ri-global-line'}"></i>
                            </div>
                            <div class="app-tile-meta">
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
                            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="app-tile-access-btn" title="Acessar ${link.title} em nova aba">
                                <span>Acessar Sistema</span>
                                <i class="ri-arrow-right-up-line"></i>
                            </a>

                            <div class="app-tile-actions">
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
                                    <div class="link-icon" style="background: ${panelColor}15; color: ${panelColor}; width: 38px; height: 38px; border-radius: var(--radius-sm); font-size: 1.15rem; flex-shrink: 0;">
                                        <i class="${link.icon || 'ri-global-line'}"></i>
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
                    <input type="text" class="form-input" id="form-link-url" value="${link?.url || ''}" placeholder="ex.: https://dash.flowti.com.br ou sistema.flowti.com.br" />
                    <small style="color: var(--text-muted); font-size: 0.78rem; margin-top: 4px; display: block;">
                        <i class="ri-information-line"></i> Aceita URLs completas com <code>https://</code> ou domínios diretos (será prefixado automaticamente com https://).
                    </small>
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição da Aplicação (Opcional)</label>
                    <input type="text" class="form-input" id="form-link-desc" value="${link?.description || ''}" placeholder="Ex.: Portal de monitoramento e NOC" />
                </div>
                <div class="form-group">
                    <label class="form-label">Ícone RemixIcon</label>
                    <input type="text" class="form-input" id="form-link-icon" value="${link?.icon || 'ri-global-line'}" placeholder="ri-global-line" />
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Sugestões: <code>ri-cloud-line</code>, <code>ri-database-line</code>, <code>ri-shield-keyhole-line</code>, <code>ri-dashboard-line</code>, <code>ri-global-line</code></small>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-link">
                    <i class="ri-save-line"></i> ${isEdit ? 'Salvar Alterações' : 'Cadastrar Aplicação'}
                </button>
            `
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
