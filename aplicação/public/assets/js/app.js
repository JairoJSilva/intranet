/**
 * Portal Unificado — App Orchestrator
 * Inicializa estado, registra rotas e gerencia layout.
 */
const App = {
    /**
     * Inicializa a aplicação
     */
    init() {
        AppState.init();
        ThemeManager.init();
        CommandPalette.init();

        // Registra rotas
        Router
            .add('#/login', () => this.renderLogin())
            .add('#/dashboard', () => this.renderPage('Dashboard Operacional', Dashboard))
            .add('#/panels', () => {
                PanelManager.setActivePanelId(null);
                this.renderPage('Painéis & Setores', PanelManager);
            })
            .add('#/panels/:id', (params) => {
                PanelManager.setActivePanelId(params.id);
                this.renderPage('Aplicações do Painel', PanelManager);
            })
            .add('#/users', () => this.renderPage('Usuários & Permissões', UserManager))
            .add('#/groups', () => this.renderPage('Grupos & Setores', GroupManager));

        // Inicia router
        Router.init();

        console.log('%c🚀 Portal Unificado Corporativo', 
            'color: #0165aa; font-size: 14px; font-weight: bold;');
    },

    /**
     * Renderiza a página de login (sem sidebar/topbar)
     */
    renderLogin() {
        const app = document.getElementById('app');
        app.innerHTML = LoginForm.render();
        LoginForm.initEvents();
    },

    /**
     * Renderiza uma página interna com layout completo (sidebar + topbar + content)
     */
    async renderPage(title, component) {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${Sidebar.render()}
            <div class="main-content" id="main-content">
                ${Topbar.render(title)}
                <div id="broadcast-banner-container" class="broadcast-banner-container" style="display: none;"></div>
                <div class="content-area" id="content-area">
                    ${await component.render()}
                </div>
            </div>
        `;

        // Inicializa eventos dos componentes de layout
        Sidebar.initEvents();
        Topbar.initEvents();

        // Inicializa banners de avisos operacionais e comunicados
        if (typeof BroadcastBanner !== 'undefined') {
            BroadcastBanner.init();
        }

        // Inicializa eventos do componente da página
        if (typeof component.initEvents === 'function') {
            component.initEvents();
        }

        // Carrega dados assíncronos
        if (typeof component.loadData === 'function') {
            component.loadData();
        }
    },

    /**
     * Logout do usuário
     */
    async logout() {
        try {
            await API.logout();
        } catch (e) {
            // Ignora erro de logout
        }

        AppState.clear();
        Toast.info('Você saiu do sistema.');
        Router.navigate('#/login');
    }
};

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => App.init());
