/**
 * Omniflowti — Group Manager Component
 * Gestão de grupos/setores com associação de painéis.
 */
const GroupManager = {
    async render() {
        return `
        <div class="page-header">
            <div>
                <h3 class="page-title">Gestão de Grupos</h3>
                <p class="page-subtitle">Gerenciar setores e suas associações com painéis</p>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-new-group">
                <i class="ri-add-line"></i> Novo Grupo
            </button>
        </div>

        <div class="panels-grid" id="groups-grid">
            <div class="skeleton" style="height: 200px;"></div>
            <div class="skeleton" style="height: 200px;"></div>
            <div class="skeleton" style="height: 200px;"></div>
        </div>`;
    },

    async loadData() {
        try {
            const res = await API.getGroups();
            AppState.set('groups', res.data);
            this.renderGroups(res.data);
        } catch (e) {
            Toast.error('Erro ao carregar grupos.');
        }
    },

    renderGroups(groups) {
        const grid = document.getElementById('groups-grid');
        if (!grid) return;

        if (groups.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="ri-team-line"></i><p>Nenhum grupo cadastrado.</p></div>';
            return;
        }

        grid.innerHTML = groups.map(g => `
            <div class="card" style="border-left: 3px solid ${g.color || 'var(--theme-primary)'};">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="panel-icon" style="background: ${g.color}20; color: ${g.color};">
                            <i class="${g.icon || 'ri-group-line'}"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; font-size: 1.05rem;">${g.name}</div>
                            <div style="font-size: 0.78rem; color: var(--text-muted);">${g.description || ''}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn btn-ghost btn-sm" onclick="GroupManager.editGroup(${g.id})">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="GroupManager.deleteGroup(${g.id}, '${g.name}')" style="color: var(--status-offline);">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-secondary);">
                    <div style="display: flex; gap: 14px;">
                        <span><i class="ri-user-line"></i> ${g.member_count || 0} membros</span>
                        <span><i class="ri-layout-grid-line"></i> ${g.panel_count || 0} painéis</span>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="GroupManager.openMembersModal(${g.id}, '${g.name}')" style="font-size: 0.78rem; padding: 4px 10px;">
                        <i class="ri-shield-user-line"></i> Membros & Permissões
                    </button>
                </div>
            </div>
        `).join('');
    },

    initEvents() {
        document.getElementById('btn-new-group')?.addEventListener('click', () => this.openGroupForm());
    },

    openGroupForm(group = null) {
        const isEdit = group !== null;

        const iconOptions = [
            'ri-computer-line', 'ri-money-dollar-circle-line', 'ri-team-line',
            'ri-building-2-line', 'ri-customer-service-line', 'ri-store-2-line',
            'ri-hospital-line', 'ri-truck-line', 'ri-bar-chart-grouped-line',
            'ri-shield-check-line', 'ri-code-s-slash-line', 'ri-megaphone-line'
        ];

        const colorOptions = ['#0165aa', '#10b981', '#8b5cf6', '#f67f1d', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

        Modal.open({
            title: isEdit ? 'Editar Grupo' : 'Novo Grupo',
            content: `
                <div class="form-group">
                    <label class="form-label">Nome do Grupo</label>
                    <input type="text" class="form-input" id="form-group-name" value="${group?.name || ''}" placeholder="Ex.: Financeiro" />
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <input type="text" class="form-input" id="form-group-desc" value="${group?.description || ''}" placeholder="Breve descrição do setor" />
                </div>
                <div class="form-group">
                    <label class="form-label">Ícone</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${iconOptions.map(icon => `
                            <button type="button" class="btn btn-ghost icon-picker-btn ${group?.icon === icon ? 'active' : ''}" 
                                    data-icon="${icon}" style="font-size: 1.3rem; padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                                <i class="${icon}"></i>
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="form-group-icon" value="${group?.icon || iconOptions[0]}" />
                </div>
                <div class="form-group">
                    <label class="form-label">Cor</label>
                    <div style="display: flex; gap: 8px;">
                        ${colorOptions.map(color => `
                            <button type="button" class="color-picker-btn" data-color="${color}"
                                    style="width: 32px; height: 32px; border-radius: 50%; background: ${color}; border: 2px solid ${group?.color === color ? 'white' : 'transparent'}; cursor: pointer; transition: all var(--transition-fast);">
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="form-group-color" value="${group?.color || colorOptions[0]}" />
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="form-save-group">
                    <i class="ri-save-line"></i> ${isEdit ? 'Salvar' : 'Criar'}
                </button>
            `,
        });

        // Icon picker
        document.querySelectorAll('.icon-picker-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.icon-picker-btn').forEach(b => b.style.borderColor = 'var(--border-color)');
                btn.style.borderColor = 'var(--theme-primary)';
                document.getElementById('form-group-icon').value = btn.dataset.icon;
            });
        });

        // Color picker
        document.querySelectorAll('.color-picker-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-picker-btn').forEach(b => b.style.borderColor = 'transparent');
                btn.style.borderColor = 'white';
                document.getElementById('form-group-color').value = btn.dataset.color;
            });
        });

        // Save
        document.getElementById('form-save-group').addEventListener('click', async () => {
            const data = {
                name: document.getElementById('form-group-name').value.trim(),
                description: document.getElementById('form-group-desc').value.trim(),
                icon: document.getElementById('form-group-icon').value,
                color: document.getElementById('form-group-color').value,
            };

            if (!data.name) {
                Toast.warning('Nome do grupo é obrigatório.');
                return;
            }

            try {
                if (isEdit) {
                    await API.updateGroup(group.id, data);
                    Toast.success('Grupo atualizado com sucesso.');
                } else {
                    await API.createGroup(data);
                    Toast.success('Grupo criado com sucesso.');
                }
                Modal.close();
                this.loadData();
            } catch (e) {
                Toast.error(e.message);
            }
        });
    },

    async editGroup(id) {
        try {
            const res = await API.getGroup(id);
            this.openGroupForm(res.data);
        } catch (e) {
            Toast.error('Erro ao carregar grupo.');
        }
    },

    async deleteGroup(id, name) {
        const confirmed = await Modal.confirm({
            title: 'Remover Grupo',
            message: `Tem certeza que deseja remover o grupo <strong>${name}</strong>? Os membros perderão acesso aos painéis associados.`,
            confirmText: 'Remover',
            type: 'danger',
        });

        if (confirmed) {
            try {
                await API.deleteGroup(id);
                Toast.success('Grupo removido com sucesso.');
                this.loadData();
            } catch (e) {
                Toast.error(e.message);
            }
        }
    },

    async openMembersModal(groupId, groupName) {
        try {
            const [membersRes, allUsersRes] = await Promise.all([
                API.getGroupMembers(groupId),
                API.getUsers()
            ]);

            const members = membersRes.data || [];
            const allUsers = allUsersRes.data || [];
            const nonMembers = allUsers.filter(u => !members.some(m => m.id === u.id));

            const renderModalContent = (currentMembers, currentNonMembers) => `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- Adicionar novo membro -->
                    <div class="card" style="margin: 0; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color);">
                        <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                            <i class="ri-user-add-line" style="color: var(--theme-primary);"></i> Associar Novo Usuário a este Grupo
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                            <select class="form-input form-select" id="new-member-user-id" style="flex: 2; min-width: 160px; font-size: 0.82rem; height: 36px;">
                                <option value="">Selecione um usuário...</option>
                                ${currentNonMembers.map(u => `<option value="${u.id}">${u.display_name} (@${u.username})</option>`).join('')}
                            </select>
                            <select class="form-input form-select" id="new-member-role" style="flex: 1; min-width: 130px; font-size: 0.82rem; height: 36px;">
                                <option value="member">Membro</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="admin">Gestor</option>
                            </select>
                            <button class="btn btn-primary btn-sm" id="btn-add-member" style="height: 36px;">
                                <i class="ri-add-line"></i> Adicionar
                            </button>
                        </div>
                    </div>

                    <!-- Lista de membros atuais -->
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                            <span>Membros Ativos (${currentMembers.length})</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">Defina papéis e permissões individuais</span>
                        </div>

                        ${currentMembers.length === 0 ? `
                            <div class="empty-state" style="padding: 24px;">
                                <i class="ri-user-unfollow-line"></i>
                                <p>Nenhum membro vinculado a este grupo no momento.</p>
                            </div>
                        ` : `
                            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; padding-right: 4px;">
                                ${currentMembers.map(m => `
                                    <div class="card" style="margin: 0; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;">
                                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.8rem; background: var(--theme-primary);">
                                                    ${m.display_name ? m.display_name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div style="font-weight: 600; font-size: 0.88rem;">${m.display_name}</div>
                                                    <div style="font-size: 0.75rem; color: var(--text-muted);">${m.email}</div>
                                                </div>
                                            </div>
                                            <button class="btn btn-ghost btn-sm" onclick="GroupManager.removeMemberFromGroup(${groupId}, '${groupName}', ${m.id}, '${m.display_name}')" title="Remover do Grupo" style="color: var(--status-offline); padding: 4px 8px;">
                                                <i class="ri-user-unfollow-line"></i>
                                            </button>
                                        </div>

                                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color); font-size: 0.8rem;">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <span style="color: var(--text-muted);">Papel:</span>
                                                <select class="form-input form-select" id="member-role-${m.id}" style="padding: 2px 6px; font-size: 0.78rem; height: 28px; width: 130px;">
                                                    <option value="member" ${m.role === 'member' ? 'selected' : ''}>Colaborador</option>
                                                    <option value="supervisor" ${m.role === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                                                    <option value="admin" ${m.role === 'admin' ? 'selected' : ''}>Gestor</option>
                                                </select>
                                            </div>

                                            <div style="display: flex; align-items: center; gap: 14px;">
                                                <label class="checkbox-wrapper" style="font-size: 0.76rem;">
                                                    <input type="checkbox" id="member-links-${m.id}" ${m.can_manage_links ? 'checked' : ''} />
                                                    <span>Links</span>
                                                </label>
                                                <label class="checkbox-wrapper" style="font-size: 0.76rem;">
                                                    <input type="checkbox" id="member-members-${m.id}" ${m.can_manage_members ? 'checked' : ''} />
                                                    <span>Membros</span>
                                                </label>
                                                <button class="btn btn-secondary btn-sm" onclick="GroupManager.saveMemberPermission(${groupId}, '${groupName}', ${m.id})" style="padding: 3px 8px; font-size: 0.75rem;">
                                                    <i class="ri-save-line"></i> Salvar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;

            Modal.open({
                title: `Permissões & Membros — ${groupName}`,
                content: renderModalContent(members, nonMembers),
                footer: `<button class="btn btn-secondary" onclick="Modal.close()">Fechar</button>`
            });

            document.getElementById('btn-add-member')?.addEventListener('click', async () => {
                const userId = document.getElementById('new-member-user-id').value;
                const role = document.getElementById('new-member-role').value;
                if (!userId) {
                    Toast.error('Selecione um usuário para adicionar.');
                    return;
                }
                try {
                    await API.updateGroupMember(groupId, userId, {
                        role,
                        can_manage_links: role !== 'member' ? 1 : 0,
                        can_manage_members: role === 'admin' ? 1 : 0,
                    });
                    Toast.success('Membro associado com sucesso.');
                    this.loadData();
                    this.openMembersModal(groupId, groupName);
                } catch (e) {
                    Toast.error(e.message || 'Erro ao adicionar membro.');
                }
            });

        } catch (e) {
            Toast.error('Erro ao carregar membros do grupo.');
        }
    },

    async saveMemberPermission(groupId, groupName, userId) {
        const role = document.getElementById(`member-role-${userId}`)?.value || 'member';
        const canLinks = document.getElementById(`member-links-${userId}`)?.checked ? 1 : 0;
        const canMembers = document.getElementById(`member-members-${userId}`)?.checked ? 1 : 0;

        try {
            await API.updateGroupMember(groupId, userId, {
                role,
                can_manage_links: canLinks,
                can_manage_members: canMembers
            });
            Toast.success('Permissões salvas com sucesso.');
            this.loadData();
        } catch (e) {
            Toast.error(e.message || 'Erro ao salvar permissões.');
        }
    },

    async removeMemberFromGroup(groupId, groupName, userId, userName) {
        const confirmed = await Modal.confirm({
            title: 'Remover Membro',
            message: `Remover <strong>${userName}</strong> deste grupo? O usuário perderá o acesso aos painéis deste setor.`,
            confirmText: 'Remover',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await API.removeGroupMember(groupId, userId);
                Toast.success('Membro removido do grupo com sucesso.');
                this.loadData();
                this.openMembersModal(groupId, groupName);
            } catch (e) {
                Toast.error(e.message || 'Erro ao remover membro.');
            }
        }
    }
};
