/**
 * Portal Unificado — App State Manager
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
        const saved = sessionStorage.getItem('portal_state') || sessionStorage.getItem('omniflowti_state') || sessionStorage.getItem('flowti_state');
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
        return this._data[key] ?? null;
    },

    /**
     * Define valor do estado e notifica listeners
     */
    set(key, value) {
        this._data[key] = value;
        this._persist();
        this._notify(key, value);
    },

    /**
     * Define múltiplos valores de uma vez
     */
    setMultiple(obj) {
        Object.assign(this._data, obj);
        this._persist();
        Object.keys(obj).forEach(key => this._notify(key, obj[key]));
    },

    /**
     * Helpers de conveniência
     */
    isAuthenticated() {
        return !!this._data.user;
    },

    isAdmin() {
        return !!this._data.user?.is_admin;
    },

    isSupervisor() {
        return !!this._data.user?.is_supervisor || this.isAdmin();
    },

    canManageGroup(groupId) {
        if (this.isAdmin()) return true;
        const g = this._data.user?.groups?.find(grp => grp.id === groupId);
        return g ? (g.role === 'admin' || g.role === 'supervisor') : false;
    },

    getUserInitials() {
        const name = this._data.user?.display_name || this._data.user?.username || '';
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join('') || '?';
    },

    getUserRole() {
        if (this.isAdmin()) return 'Administrador';
        if (this.isSupervisor()) return 'Supervisor';
        return 'Colaborador';
    },

    /**
     * Retorna a lista de painéis fixados (favoritos) do usuário atual
     * @returns {Array<{id: number, title: string, icon: string, color: string}>}
     */
    getPinnedPanels() {
        const userId = this._data.user?.id || 'default';
        const key = `portal_pinned_panels_${userId}`;
        const legacyKey = `omniflowti_pinned_panels_${userId}`;
        try {
            const raw = localStorage.getItem(key) || localStorage.getItem(legacyKey);
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) return list;
            }
        } catch (e) {
            console.warn('[State] Erro ao ler painéis fixados:', e);
        }
        return [];
    },

    /**
     * Verifica se um painel específico está fixado
     * @param {number|string} panelId
     * @returns {boolean}
     */
    isPanelPinned(panelId) {
        if (!panelId) return false;
        const id = parseInt(panelId, 10);
        const pinned = this.getPinnedPanels();
        return pinned.some(p => p.id === id);
    },

    /**
     * Alterna o estado de fixado de um painel (Fixar / Desafixar)
     * @param {object|number} panelOrId
     * @returns {boolean} true se agora está fixado, false se foi desafixado
     */
    togglePinPanel(panelOrId) {
        let panel = null;
        let id = null;

        if (typeof panelOrId === 'object' && panelOrId !== null) {
            panel = panelOrId;
            id = parseInt(panel.id, 10);
        } else {
            id = parseInt(panelOrId, 10);
            const all = this._data.panels || [];
            panel = all.find(p => p.id === id);
        }

        if (!id) return false;

        const userId = this._data.user?.id || 'default';
        const key = `portal_pinned_panels_${userId}`;
        let pinned = this.getPinnedPanels();
        const index = pinned.findIndex(p => p.id === id);
        let isNowPinned = false;

        if (index >= 0) {
            // Desafixar
            const removed = pinned.splice(index, 1)[0];
            isNowPinned = false;
            if (typeof Toast !== 'undefined') {
                Toast.info(`Painel "${removed?.title || panel?.title || 'Selecionado'}" desafixado da barra lateral.`);
            }
        } else {
            // Fixar
            const toAdd = {
                id: id,
                title: panel?.title || `Painel #${id}`,
                icon: panel?.icon || 'ri-dashboard-line',
                color: panel?.color || 'var(--theme-primary)'
            };
            pinned.push(toAdd);
            isNowPinned = true;
            if (typeof Toast !== 'undefined') {
                Toast.success(`Painel "${toAdd.title}" fixado na barra lateral!`);
            }
        }

        try {
            localStorage.setItem(key, JSON.stringify(pinned));
        } catch (e) {
            console.warn('[State] Erro ao salvar painéis fixados:', e);
        }

        this._notify('pinnedPanels', pinned);

        // Atualiza a barra lateral se ela estiver montada no DOM
        if (typeof Sidebar !== 'undefined' && typeof Sidebar.updatePinned === 'function') {
            Sidebar.updatePinned();
        }

        return isNowPinned;
    },

    /**
     * Sincroniza dados atualizados dos painéis (título, cor, ícone) e limpa excluídos
     * @param {Array} panelsList
     */
    syncPinnedPanelsWith(panelsList) {
        if (!Array.isArray(panelsList) || panelsList.length === 0) return;

        const userId = this._data.user?.id || 'default';
        const key = `portal_pinned_panels_${userId}`;
        const pinned = this.getPinnedPanels();
        if (pinned.length === 0) return;

        let changed = false;
        const validPinned = [];

        pinned.forEach(p => {
            const current = panelsList.find(x => x.id === p.id);
            if (current) {
                // Atualiza se título, ícone ou cor mudaram
                if (current.title !== p.title || current.icon !== p.icon || current.color !== p.color) {
                    p.title = current.title;
                    p.icon = current.icon || 'ri-dashboard-line';
                    p.color = current.color || 'var(--theme-primary)';
                    changed = true;
                }
                validPinned.push(p);
            } else {
                // Painel não existe mais no banco
                changed = true;
            }
        });

        if (changed) {
            try {
                localStorage.setItem(key, JSON.stringify(validPinned));
                if (typeof Sidebar !== 'undefined' && typeof Sidebar.updatePinned === 'function') {
                    Sidebar.updatePinned();
                }
            } catch (e) {
                console.warn('[State] Erro ao sincronizar painéis fixados:', e);
            }
        }
    },

    /**
     * Reordena a lista de painéis fixados
     * @param {number} fromIndex
     * @param {number} toIndex
     */
    reorderPinnedPanels(fromIndex, toIndex) {
        const userId = this._data.user?.id || 'default';
        const key = `portal_pinned_panels_${userId}`;
        const pinned = this.getPinnedPanels();

        if (fromIndex < 0 || fromIndex >= pinned.length || toIndex < 0 || toIndex >= pinned.length) {
            return;
        }

        const [moved] = pinned.splice(fromIndex, 1);
        pinned.splice(toIndex, 0, moved);

        try {
            localStorage.setItem(key, JSON.stringify(pinned));
        } catch (e) {
            console.warn('[State] Erro ao salvar reordenação de painéis fixados:', e);
        }

        this._notify('pinnedPanels', pinned);
        if (typeof Sidebar !== 'undefined' && typeof Sidebar.updatePinned === 'function') {
            Sidebar.updatePinned();
        }
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
        sessionStorage.removeItem('portal_state');
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
            sessionStorage.setItem('portal_state', JSON.stringify(toSave));
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
