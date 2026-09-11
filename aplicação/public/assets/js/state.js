/**
 * Omniflowti — App State Manager
 * Estado global reativo armazenado em memória com persistência em sessionStorage.
 */
const AppState = {
    _data: {
        user: null,
        panels: [],
        groups: [],
        users: [],
        stats: null,
        sidebarCollapsed: false,
        currentRoute: '#/dashboard',
    },

    _listeners: [],

    /**
     * Inicializa estado a partir de sessionStorage
     */
    init() {
        const saved = sessionStorage.getItem('omniflowti_state') || sessionStorage.getItem('flowti_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(this._data, parsed);
            } catch (e) {
                console.warn('[State] Falha ao restaurar estado:', e);
            }
        }
    },

    /**
     * Obtém valor do estado
     */
    get(key) {
        return this._data[key];
    },

    /**
     * Define valor e notifica listeners
     */
    set(key, value) {
        this._data[key] = value;
        this._persist();
        this._notify(key, value);
    },

    /**
     * Verifica se usuário está autenticado
     */
    isAuthenticated() {
        return this._data.user !== null;
    },

    /**
     * Verifica se usuário é admin
     */
    isAdmin() {
        return this._data.user?.is_admin === true;
    },

    /**
     * Verifica se usuário é supervisor (ou admin)
     */
    isSupervisor() {
        return this._data.user?.is_supervisor === true || this.isAdmin();
    },

    /**
     * Retorna iniciais do nome para avatar
     */
    getUserInitials() {
        const name = this._data.user?.display_name || 'U';
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    },

    /**
     * Retorna label do papel do usuário
     */
    getUserRole() {
        if (this._data.user?.is_admin) return 'Administrador';
        if (this._data.user?.is_supervisor) return 'Supervisor';
        return 'Colaborador';
    },

    /**
     * Limpa todo o estado (logout)
     */
    clear() {
        this._data.user = null;
        this._data.panels = [];
        this._data.groups = [];
        this._data.users = [];
        this._data.stats = null;
        sessionStorage.removeItem('omniflowti_state');
        sessionStorage.removeItem('flowti_state');
        this._notify('user', null);
    },

    /**
     * Registra listener de mudança de estado
     */
    on(key, callback) {
        this._listeners.push({ key, callback });
    },

    /**
     * Remove listener
     */
    off(key, callback) {
        this._listeners = this._listeners.filter(
            l => !(l.key === key && l.callback === callback)
        );
    },

    /** @private */
    _persist() {
        try {
            const toSave = { ...this._data };
            // Não persiste dados grandes
            delete toSave.users;
            sessionStorage.setItem('omniflowti_state', JSON.stringify(toSave));
        } catch (e) {
            // sessionStorage full
        }
    },

    /** @private */
    _notify(key, value) {
        this._listeners
            .filter(l => l.key === key || l.key === '*')
            .forEach(l => {
                try { l.callback(key, value); }
                catch (e) { console.error('[State] Listener error:', e); }
            });
    }
};
