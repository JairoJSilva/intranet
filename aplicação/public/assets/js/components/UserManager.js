/**
 * Intranet Flowti — User Manager Component
 * Gestão completa de usuários (CRUD + import CSV).
 * Disponível apenas para Administradores.
 */
const UserManager = {
    async render() {
        return `
        <div class="page-header">
            <div>
                <h3 class="page-title">Gestão de Usuários</h3>
                <p class="page-subtitle">Gerenciar contas, permissões e grupos de acesso</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary btn-sm" id="btn-import-csv">
                    <i class="ri-upload-2-line"></i> Importar CSV
                </button>
                <button class="btn btn-primary btn-sm" id="btn-new-user">
                    <i class="ri-user-add-line"></i> Novo Usuário
                </button>
            </div>
        </div>

        <div class="card" style="overflow-x: auto;">
            <table class="data-table" id="users-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Email</th>
                        <th>Perfil</th>
                        <th>Grupos</th>
                        <th>Provedor</th>
                        <th>Status</th>
                        <th>Último Login</th>
                        <th style="width: 100px;">Ações</th>
                    </tr>
                </thead>
                <tbody id="users-tbody">
                    <tr><td colspan="8" style="text-align: center; padding: 40px;">
                        <div class="spinner" style="margin: 0 auto; width: 24px; height: 24px; border-color: var(--border-color); border-top-color: var(--vem-blue-500);"></div>
                    </td></tr>
                </tbody>
            </table>
        </div>`;
    },

    async loadData() {
        try {
            const [usersRes, groupsRes] = await Promise.all([
                API.getUsers(),
                API.getGroups()
            ]);

            AppState.set('users', usersRes.data);
            AppState.set('groups', groupsRes.data);
            this.renderTable(usersRes.data);
        } catch (e) {
            Toast.error('Erro ao carregar usuários.');
        }
    },

    renderTable(users) {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>Nenhum usuário cadastrado.</p></td></tr>';
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.7rem;">
                            ${u.display_name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${u.display_name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">@${u.username}</div>
                        </div>
                    </div>
                </td>
                <td style="color: var(--text-secondary);">${u.email}</td>
                <td>
                    ${u.is_admin ? '<span class="badge badge-admin">Admin</span>' :
                      u.is_supervisor ? '<span class="badge badge-supervisor">Supervisor</span>' :
                      '<span class="badge badge-user">Colaborador</span>'}
                </td>
                <td>
                    ${(u.groups || []).map(g => `<span class="multi-select-tag" style="font-size: 0.7rem; padding: 2px 8px;">${g.name}</span>`).join(' ')}
                </td>
                <td><span style="text-transform: uppercase; font-size: 0.75rem; color: var(--text-muted);">${u.auth_provider}</span></td>
                <td>
                    <span class="badge ${u.is_active ? 'badge-active' : 'badge-inactive'}">
                        ${u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">
                    ${u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('pt-BR') : 'Nunca'}
                </td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="UserManager.editUser(${u.id})" title="Editar">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="UserManager.deleteUser(${u.id}, '${u.display_name}')" title="Desativar" style="color: var(--status-offline);">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    initEvents() {
        document.getElementById('btn-new-user')?.addEventListener('click', () => this.openUserForm());
        document.getElementById('btn-import-csv')?.addEventListener('click', () => this.openImportModal());
    },

    openUserForm(user = null) {
        const isEdit = user !== null;
        const groups = AppState.get('groups') || [];

        Modal.open({
            title: isEdit ? 'Editar Usuário' : 'Novo Usuário',
            content: `
                <div class="form-group">
                    <label class="form-label">Nome de Exibição</label>
                    <input type="text" class="form-input" id="form-display-name" value="${user?.display_name || ''}" placeholder="Nome completo" />
                </div>
                ${!isEdit ? `
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-input" id="form-username" value="" placeholder="usuario.login" />
                </div>` : ''}
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="form-email" value="${user?.email || ''}" placeholder="email@flowti.com.br" />
                </div>
                <div class="form-group">
                    <label class="form-label">${isEdit ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}</label>
                    <input type="password" class="form-input" id="form-password" placeholder="${isEdit ? '••••••••' : 'Mín. 8 caracteres'}" />
                </div>
                <div class="form-group">
                    <label class="form-label">Perfil de Acesso</label>
                    <select class="form-input form-select" id="form-role">
                        <option value="user" ${!user?.is_admin && !user?.is_supervisor ? 'selected' : ''}>Colaborador</option>
                        <option value="supervisor" ${user?.is_supervisor ? 'selected' : ''}>Supervisor</option>
                        <option value="admin" ${user?.is_admin ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Grupos</label>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${groups.map(g => `
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="group_ids" value="${g.id}" 
                                    ${(user?.groups || []).some(ug => ug.id == g.id) ? 'checked' : ''} />
                                <span>${g.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="form-save-user">
                    <i class="ri-save-line"></i> ${isEdit ? 'Salvar' : 'Criar'}
                </button>
            `,
        });

        document.getElementById('form-save-user').addEventListener('click', async () => {
            const role = document.getElementById('form-role').value;
            const groupCheckboxes = document.querySelectorAll('input[name="group_ids"]:checked');
            const groupIds = Array.from(groupCheckboxes).map(cb => parseInt(cb.value));

            const data = {
                display_name: document.getElementById('form-display-name').value.trim(),
                email: document.getElementById('form-email').value.trim(),
                is_admin: role === 'admin',
                is_supervisor: role === 'supervisor',
                group_ids: groupIds,
            };

            if (!isEdit) {
                data.username = document.getElementById('form-username').value.trim();
            }

            const password = document.getElementById('form-password').value;
            if (password) data.password = password;

            try {
                if (isEdit) {
                    await API.updateUser(user.id, data);
                    Toast.success('Usuário atualizado com sucesso.');
                } else {
                    await API.createUser(data);
                    Toast.success('Usuário criado com sucesso.');
                }
                Modal.close();
                this.loadData();
            } catch (e) {
                Toast.error(e.message);
            }
        });
    },

    async editUser(id) {
        try {
            const groups = AppState.get('groups');
            if (!groups || groups.length === 0) {
                const groupsRes = await API.getGroups();
                AppState.set('groups', groupsRes.data);
            }
            const users = AppState.get('users') || [];
            const user = users.find(u => u.id === id);
            if (user) this.openUserForm(user);
        } catch (e) {
            Toast.error('Erro ao carregar dados do usuário.');
        }
    },

    async deleteUser(id, name) {
        const confirmed = await Modal.confirm({
            title: 'Desativar Usuário',
            message: `Tem certeza que deseja desativar o usuário <strong>${name}</strong>? Ele perderá acesso ao portal.`,
            confirmText: 'Desativar',
            type: 'danger',
        });

        if (confirmed) {
            try {
                await API.deleteUser(id);
                Toast.success('Usuário desativado com sucesso.');
                this.loadData();
            } catch (e) {
                Toast.error(e.message);
            }
        }
    },

    openImportModal() {
        Modal.open({
            title: 'Importar Usuários via CSV',
            content: `
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 16px;">
                    Formato: <code style="background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px;">username,display_name,email,password,is_admin,is_supervisor,group_ids</code>
                </p>
                <div class="form-group">
                    <textarea class="form-input" id="csv-content" rows="8" 
                              placeholder="username,display_name,email,password,is_admin,is_supervisor,group_ids&#10;joao.silva,João Silva,joao@flowti.com.br,Senha@123,0,0,1;2"
                              style="font-family: monospace; font-size: 0.8rem;"></textarea>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-do-import">
                    <i class="ri-upload-2-line"></i> Importar
                </button>
            `,
        });

        document.getElementById('btn-do-import')?.addEventListener('click', async () => {
            const csv = document.getElementById('csv-content').value.trim();
            if (!csv) {
                Toast.warning('Cole o conteúdo CSV antes de importar.');
                return;
            }

            try {
                const result = await API.request('POST', '/users/import-csv', null, {
                    headers: { 'Content-Type': 'text/plain' },
                    body: csv,
                });
                Toast.success(result.message);
                Modal.close();
                this.loadData();
            } catch (e) {
                Toast.error(e.message);
            }
        });
    },
};
