/**
 * Omniflowti — Sidebar Navigation
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
                <a href="#/dashboard" class="sidebar-logo-link" title="Omniflowti — Home / Dashboard" onclick="Router.navigate('#/dashboard'); return false;">
                    <img src="/assets/img/flowti-label.svg" alt="Omniflowti" class="sidebar-logo-img" />
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

                <div class="nav-item ${currentRoute.startsWith('#/panels') ? 'active' : ''}" 
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
     * Inicializa event listeners do sidebar
     */
    initEvents() {
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
