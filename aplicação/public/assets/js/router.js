/**
 * Intranet Flowti — Client-Side Hash Router
 * Gerencia navegação SPA via hash (#/route).
 */
const Router = {
    routes: {},
    currentRoute: null,

    /**
     * Registra uma rota
     */
    add(path, handler) {
        this.routes[path] = handler;
        return this;
    },

    /**
     * Inicializa o router
     */
    init() {
        window.addEventListener('hashchange', () => this.resolve());
        this.resolve();
    },

    /**
     * Navega para uma rota
     */
    navigate(path) {
        window.location.hash = path;
    },

    /**
     * Resolve a rota atual e executa o handler
     */
    resolve() {
        const hash = window.location.hash || '#/login';
        const path = hash.split('?')[0]; // Remove query params

        // Guard: redireciona para login se não autenticado
        if (path !== '#/login' && !AppState.isAuthenticated()) {
            this.navigate('#/login');
            return;
        }

        // Guard: redireciona para dashboard se autenticado e tenta acessar login
        if (path === '#/login' && AppState.isAuthenticated()) {
            this.navigate('#/dashboard');
            return;
        }

        // Busca handler
        const handler = this.routes[path];

        if (handler) {
            this.currentRoute = path;
            AppState.set('currentRoute', path);
            handler();
        } else {
            // 404 — rota não encontrada, redireciona
            console.warn(`[Router] Rota não encontrada: ${path}`);
            this.navigate(AppState.isAuthenticated() ? '#/dashboard' : '#/login');
        }
    }
};
