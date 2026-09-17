/**
 * Portal Unificado — User Manager Component
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
                        <div class="spinner" style="margin: 0 auto; width: 24px; height: 24px; border-color: var(--border-color); border-top-color: var(--theme-primary);"></div>
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
                    ${(u.groups || []).map(g => {
                        const roleLabel = g.role === 'admin' ? 'Gestor' : (g.role === 'supervisor' ? 'Supervisor' : 'Membro');
                        const roleIcon = g.role === 'admin' ? 'ri-shield-star-line' : (g.role === 'supervisor' ? 'ri-user-star-line' : 'ri-user-line');
                        const perms = [];
                        if (g.can_manage_links) perms.push('Links');
                        if (g.can_manage_members) perms.push('Membros');
                        const permsText = perms.length > 0 ? ` (${perms.join(', ')})` : '';
                        return `<span class="multi-select-tag" style="font-size: 0.72rem; padding: 2px 8px; margin: 2px;" title="Setor: ${g.name} | Papel: ${roleLabel}${permsText}">
                            <i class="${roleIcon}"></i> ${g.name} <strong style="opacity: 0.85;">· ${roleLabel}</strong>
                        </span>`;
                    }).join(' ') || '<span style="color: var(--text-muted); font-size: 0.75rem;">Nenhum grupo</span>'}
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
            title: isEdit ? 'Editar Usuário & Permissões' : 'Novo Usuário',
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
                    <input type="email" class="form-input" id="form-email" value="${user?.email || ''}" placeholder="email@portal.local" />
                </div>
                <div class="form-group">
                    <label class="form-label">${isEdit ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}</label>
                    <input type="password" class="form-input" id="form-password" placeholder="${isEdit ? '••••••••' : 'Mín. 8 caracteres'}" />
                </div>
                <div class="form-group">
                    <label class="form-label">Perfil Geral de Acesso (Global)</label>
                    <select class="form-input form-select" id="form-role">
                        <option value="user" ${!user?.is_admin && !user?.is_supervisor ? 'selected' : ''}>Colaborador</option>
                        <option value="supervisor" ${user?.is_supervisor ? 'selected' : ''}>Supervisor</option>
                        <option value="admin" ${user?.is_admin ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Grupos & Permissões por Grupo</span>
                        <small style="color: var(--text-muted); font-weight: normal;">Defina o papel e autonomia em cada setor</small>
                    </label>
                    <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 4px;">
                        ${groups.map(g => {
                            const userGroup = (user?.groups || []).find(ug => ug.id == g.id);
                            const isChecked = !!userGroup;
                            const role = userGroup?.role || 'member';
                            const canLinks = !!userGroup?.can_manage_links;
                            const canMembers = !!userGroup?.can_manage_members;
                            return `
                            <div class="card" style="padding: 10px 12px; margin: 0; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <label class="checkbox-wrapper" style="font-weight: 500;">
                                        <input type="checkbox" name="group_ids" value="${g.id}" id="chk-group-${g.id}"
                                            ${isChecked ? 'checked' : ''} 
                                            onchange="document.getElementById('group-config-${g.id}').style.display = this.checked ? 'flex' : 'none';" />
                                        <span><i class="${g.icon || 'ri-group-line'}" style="color: ${g.color || 'var(--theme-primary)'};"></i> ${g.name}</span>
                                    </label>
                                </div>
                                <div id="group-config-${g.id}" style="display: ${isChecked ? 'flex' : 'none'}; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color); font-size: 0.8rem;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--text-muted); width: 110px;">Papel no Grupo:</span>
                                        <select class="form-input form-select" id="group-role-${g.id}" style="padding: 4px 8px; font-size: 0.8rem; height: auto;">
                                            <option value="member" ${role === 'member' ? 'selected' : ''}>Colaborador (Membro)</option>
                                            <option value="supervisor" ${role === 'supervisor' ? 'selected' : ''}>Supervisor do Grupo</option>
                                            <option value="admin" ${role === 'admin' ? 'selected' : ''}>Gestor do Grupo</option>
                                        </select>
                                    </div>
                                    <div style="display: flex; gap: 16px; margin-left: 118px;">
                                        <label class="checkbox-wrapper" style="font-size: 0.78rem;">
                                            <input type="checkbox" id="group-can-links-${g.id}" ${canLinks ? 'checked' : ''} />
                                            <span>Gerenciar Links</span>
                                        </label>
                                        <label class="checkbox-wrapper" style="font-size: 0.78rem;">
                                            <input type="checkbox" id="group-can-members-${g.id}" ${canMembers ? 'checked' : ''} />
                                            <span>Gerenciar Membros</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="form-save-user">
                    <i class="ri-save-line"></i> ${isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
            `,
        });

        document.getElementById('form-save-user').addEventListener('click', async () => {
            const role = document.getElementById('form-role').value;
            const groupsPayload = Array.from(document.querySelectorAll('input[name="group_ids"]:checked')).map(cb => {
                const gId = parseInt(cb.value);
                const roleEl = document.getElementById(`group-role-${gId}`);
                const linksEl = document.getElementById(`group-can-links-${gId}`);
                const membersEl = document.getElementById(`group-can-members-${gId}`);
                return {
                    group_id: gId,
                    role: roleEl ? roleEl.value : 'member',
                    can_manage_links: linksEl && linksEl.checked ? 1 : 0,
                    can_manage_members: membersEl && membersEl.checked ? 1 : 0,
                };
            });

            const data = {
                display_name: document.getElementById('form-display-name').value.trim(),
                email: document.getElementById('form-email').value.trim(),
                is_admin: role === 'admin',
                is_supervisor: role === 'supervisor',
                groups: groupsPayload,
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
                              placeholder="username,display_name,email,password,is_admin,is_supervisor,group_ids&#10;joao.silva,João Silva,joao@portal.local,Senha@123,0,0,1;2"
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
