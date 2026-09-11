/**
 * Omniflowti — Client-Side Hash Router
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

        // Busca handler direto ou por padrão dinâmico (:param)
        let handler = this.routes[path];
        let params = {};

        if (!handler) {
            for (const routePattern in this.routes) {
                if (routePattern.includes(':')) {
                    const patternParts = routePattern.split('/');
                    const pathParts = path.split('/');
                    if (patternParts.length === pathParts.length) {
                        let match = true;
                        const tempParams = {};
                        for (let i = 0; i < patternParts.length; i++) {
                            if (patternParts[i].startsWith(':')) {
                                tempParams[patternParts[i].substring(1)] = pathParts[i];
                            } else if (patternParts[i] !== pathParts[i]) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            handler = this.routes[routePattern];
                            params = tempParams;
                            break;
                        }
                    }
                }
            }
        }

        if (handler) {
            this.currentRoute = path;
            AppState.set('currentRoute', path);
            handler(params);
        } else {
            // 404 — rota não encontrada, redireciona
            console.warn(`[Router] Rota não encontrada: ${path}`);
            this.navigate(AppState.isAuthenticated() ? '#/dashboard' : '#/login');
        }
    }
};
