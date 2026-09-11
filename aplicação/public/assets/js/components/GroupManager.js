/**
 * Intranet Flowti — Group Manager Component
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
            <div class="card" style="border-left: 3px solid ${g.color || 'var(--vem-blue-500)'};">
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
                <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                    <span><i class="ri-user-line"></i> ${g.member_count || 0} membros</span>
                    <span><i class="ri-layout-grid-line"></i> ${g.panel_count || 0} painéis</span>
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
                btn.style.borderColor = 'var(--vem-blue-500)';
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
};
