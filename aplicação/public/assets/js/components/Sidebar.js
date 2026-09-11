/**
 * Intranet Flowti — Sidebar Navigation
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
                <i class="ri-global-line" style="font-size: 1.5rem; color: var(--vem-blue-500);"></i>
                <span class="sidebar-brand">Intranet Flowti</span>
                <button class="sidebar-toggle" id="sidebar-toggle" title="Recolher menu">
                    <i class="ri-menu-fold-line"></i>
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
                const collapsed = sidebar.classList.toggle('collapsed');
                AppState.set('sidebarCollapsed', collapsed);
                
                // Atualiza ícone do toggle
                const icon = toggle.querySelector('i');
                icon.className = collapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line';
            });
        }
    }
};
