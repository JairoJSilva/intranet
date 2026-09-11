/**
 * Omniflowti — API Client
 * Wrapper Fetch com interceptors, auth, error handling e JSON auto-parse.
 */
const API = {
    baseUrl: '/api',

    /**
     * Requisição HTTP genérica
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers,
            },
            credentials: 'same-origin', // Envia cookies de sessão
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const json = await response.json();

            // Interceptor: 401 — redireciona para login
            if (response.status === 401) {
                AppState.clear();
                if (!window.location.pathname.includes('/login')) {
                    window.location.hash = '#/login';
                }
                throw new Error(json.message || 'Sessão expirada.');
            }

            // Interceptor: 403 — acesso negado
            if (response.status === 403) {
                Toast.show(json.message || 'Acesso negado.', 'error');
                throw new Error(json.message || 'Acesso negado.');
            }

            if (!response.ok) {
                throw new Error(json.message || `Erro ${response.status}`);
            }

            return json;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                Toast.show('Erro de conexão com o servidor.', 'error');
            }
            throw error;
        }
    },

    // Métodos de conveniência
    get(endpoint)             { return this.request('GET', endpoint); },
    post(endpoint, data)      { return this.request('POST', endpoint, data); },
    put(endpoint, data)       { return this.request('PUT', endpoint, data); },
    delete(endpoint)          { return this.request('DELETE', endpoint); },

    // --- Auth ---
    login(username, password) { return this.post('/auth/login', { username, password }); },
    logout()                  { return this.post('/auth/logout'); },
    me()                      { return this.get('/auth/me'); },

    // --- Users ---
    getUsers()                { return this.get('/users'); },
    createUser(data)          { return this.post('/users', data); },
    updateUser(id, data)      { return this.put(`/users/${id}`, data); },
    deleteUser(id)            { return this.delete(`/users/${id}`); },
    importCsv(csv)            { return this.request('POST', '/users/import-csv', null, { body: csv }); },

    // --- Groups ---
    getGroups()                                { return this.get('/groups'); },
    getGroup(id)                               { return this.get(`/groups/${id}`); },
    createGroup(data)                          { return this.post('/groups', data); },
    updateGroup(id, data)                      { return this.put(`/groups/${id}`, data); },
    deleteGroup(id)                            { return this.delete(`/groups/${id}`); },
    getGroupMembers(groupId)                   { return this.get(`/groups/${groupId}/members`); },
    updateGroupMember(groupId, userId, data)   { return this.put(`/groups/${groupId}/members/${userId}`, data); },
    removeGroupMember(groupId, userId)         { return this.delete(`/groups/${groupId}/members/${userId}`); },

    // --- Panels ---
    getPanels()               { return this.get('/panels'); },
    createPanel(data)         { return this.post('/panels', data); },
    updatePanel(id, data)     { return this.put(`/panels/${id}`, data); },
    deletePanel(id)           { return this.delete(`/panels/${id}`); },

    // --- Links ---
    getLinks(panelId)         { return this.get(`/links?panel_id=${panelId}`); },
    createLink(data)          { return this.post('/links', data); },
    updateLink(id, data)      { return this.put(`/links/${id}`, data); },
    deleteLink(id)            { return this.delete(`/links/${id}`); },

    // --- Health & Dashboard ---
    healthCheck()             { return this.post('/health/check'); },
    dashboardStats()          { return this.get('/dashboard/stats'); },
};
