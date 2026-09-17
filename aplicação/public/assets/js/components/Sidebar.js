/**
 * Omniflowti — Sidebar Navigation
 * Barra lateral com navegação principal, gestão e seção reativa de Painéis Fixados / Favoritos.
 */
const Sidebar = {
    render() {
        const isAdmin = AppState.isAdmin();
        const isSupervisor = AppState.isSupervisor();
        const currentRoute = AppState.get('currentRoute') || '#/dashboard';
        const collapsed = AppState.get('sidebarCollapsed');

        return `
        <aside class="sidebar ${collapsed ? 'collapsed' : ''}" id="sidebar">
            <div class="sidebar-header">
                <a href="#/dashboard" class="sidebar-logo-link" title="Flowti Hub — Home / Dashboard" onclick="Router.navigate('#/dashboard'); return false;">
                    <img src="/assets/img/flowti-hub-logo.svg" alt="Flowti Hub" class="sidebar-logo-img" />
                </a>
                <button class="sidebar-toggle" id="sidebar-toggle" title="${collapsed ? 'Expandir menu' : 'Recolher menu'}">
                    <i class="${collapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'}"></i>
                </button>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section-title">Principal</div>

                <div class="nav-item ${currentRoute === '#/dashboard' ? 'active' : ''}" 
                     onclick="Router.navigate('#/dashboard')">
                    <i class="ri-dashboard-3-line"></i>
                    <span class="nav-label">Dashboard</span>
                </div>

                <div class="nav-item ${currentRoute === '#/panels' ? 'active' : ''}" 
                     onclick="Router.navigate('#/panels')">
                    <i class="ri-layout-grid-line"></i>
                    <span class="nav-label">Painéis</span>
                </div>

                ${isAdmin || isSupervisor ? `
                <div class="nav-section-title">Gestão</div>

                ${isAdmin ? `
                <div class="nav-item ${currentRoute === '#/users' ? 'active' : ''}" 
                     onclick="Router.navigate('#/users')">
                    <i class="ri-user-settings-line"></i>
                    <span class="nav-label">Usuários</span>
                </div>
                ` : ''}

                ${isAdmin ? `
                <div class="nav-item ${currentRoute === '#/groups' ? 'active' : ''}" 
                     onclick="Router.navigate('#/groups')">
                    <i class="ri-team-line"></i>
                    <span class="nav-label">Grupos</span>
                </div>
                ` : ''}
                ` : ''}

                <!-- Seção Dinâmica de Painéis Fixados / Favoritos -->
                <div id="sidebar-pinned-container">
                    ${this.renderPinnedSection()}
                </div>
            </nav>

            <div style="padding: 16px 12px; border-top: 1px solid var(--border-color);">
                <div class="nav-item" onclick="App.logout()" style="color: var(--status-offline);">
                    <i class="ri-logout-box-r-line"></i>
                    <span class="nav-label">Sair</span>
                </div>
            </div>
        </aside>`;
    },

    /**
     * Renderiza a lista de painéis fixados / favoritos na barra lateral
     */
    renderPinnedSection() {
        const pinned = AppState.getPinnedPanels ? AppState.getPinnedPanels() : [];
        if (!pinned || pinned.length === 0) {
            return '';
        }

        const currentRoute = AppState.get('currentRoute') || '';

        return `
        <div class="sidebar-pinned-section">
            <div class="nav-section-title" style="display: flex; align-items: center; justify-content: space-between;">
                <span style="display: flex; align-items: center; gap: 6px;">
                    <i class="ri-pushpin-2-fill" style="font-size: 0.82rem; color: var(--theme-primary);"></i>
                    <span>Fixados</span>
                </span>
                <span class="sidebar-pinned-badge" title="${pinned.length} painéis fixados">${pinned.length}</span>
            </div>

            ${pinned.map((panel, index) => {
                const isActive = currentRoute === `#/panels/${panel.id}`;
                const panelColor = panel.color || 'var(--theme-primary)';
                return `
                <div class="nav-item sidebar-pinned-item ${isActive ? 'active' : ''}" 
                     draggable="true"
                     data-pinned-index="${index}"
                     data-panel-id="${panel.id}"
                     onclick="Router.navigate('#/panels/${panel.id}')"
                     title="Acessar painel: ${panel.title} (arraste para reordenar)">
                    <i class="ri-drag-move-2-line sidebar-pinned-drag-handle" style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.5; margin-right: -4px;"></i>
                    <i class="${panel.icon || 'ri-dashboard-line'}" style="color: ${panelColor};"></i>
                    <span class="nav-label" style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 6px;">
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${panel.title}</span>
                        <button class="btn-sidebar-unpin" 
                                onclick="event.stopPropagation(); AppState.togglePinPanel(${panel.id});" 
                                title="Desafixar painel da barra">
                            <i class="ri-close-line"></i>
                        </button>
                    </span>
                </div>
                `;
            }).join('')}
        </div>
        `;
    },

    /**
     * Atualiza a seção de painéis fixados reativamente no DOM
     */
    updatePinned() {
        const container = document.getElementById('sidebar-pinned-container');
        if (container) {
            container.innerHTML = this.renderPinnedSection();
            this.initPinnedDragDrop();
        }
    },

    /**
     * Habilita reordenação por arrastar e soltar (Drag & Drop) dos painéis fixados
     */
    initPinnedDragDrop() {
        const items = document.querySelectorAll('.sidebar-pinned-item');
        let draggedIndex = null;

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedIndex = parseInt(item.dataset.pinnedIndex, 10);
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(draggedIndex));
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                item.classList.add('drag-over');
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const targetIndex = parseInt(item.dataset.pinnedIndex, 10);
                if (draggedIndex !== null && draggedIndex !== targetIndex) {
                    AppState.reorderPinnedPanels(draggedIndex, targetIndex);
                }
            });

            item.addEventListener('dragend', () => {
                items.forEach(i => {
                    i.classList.remove('dragging');
                    i.classList.remove('drag-over');
                });
                draggedIndex = null;
            });
        });
    },

    /**
     * Inicializa event listeners do sidebar
     */
    initEvents() {
        this.initPinnedDragDrop();

        const toggle = document.getElementById('sidebar-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                const isCollapsed = sidebar.classList.toggle('collapsed');
                AppState.set('sidebarCollapsed', isCollapsed);
                
                // Atualiza ícone e título do toggle
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.className = isCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line';
                }
                toggle.title = isCollapsed ? 'Expandir menu' : 'Recolher menu';
            });
        }
    }
};
