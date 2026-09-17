/**
 * Omniflowti — BroadcastBanner Component
 * Mural de Avisos & Manutenções Programadas (Broadcast Banner)
 * Banners dinâmicos globais com suporte a info, warning e critical,
 * persistência local de cientes e painel administrativo de gestão.
 */
const BroadcastBanner = {
    activeNotices: [],

    /**
     * Inicializa o banner carregando avisos ativos da API
     */
    async init() {
        const container = document.getElementById('broadcast-banner-container');
        if (!container) return;

        try {
            const res = await API.getActiveNotices();
            this.activeNotices = res.data || [];
            this.render();
            this.updateTopbarBadge();
        } catch (e) {
            console.debug('[BroadcastBanner] Erro ao carregar avisos:', e);
        }
    },

    /**
     * Retorna a lista de IDs de avisos dispensados pelo usuário atual
     */
    getDismissedIds() {
        try {
            const saved = localStorage.getItem('omniflowti_dismissed_notices');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Salva um aviso como dispensado/ciente
     */
    dismiss(id) {
        const dismissed = this.getDismissedIds();
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem('omniflowti_dismissed_notices', JSON.stringify(dismissed));
        }

        const bannerEl = document.getElementById(`broadcast-banner-${id}`);
        if (bannerEl) {
            bannerEl.classList.add('banner-dismissing');
            setTimeout(() => {
                bannerEl.remove();
                this.updateTopbarBadge();
            }, 300);
        }

        if (typeof Toast !== 'undefined') {
            Toast.info('Aviso marcado como ciente.');
        }
    },

    /**
     * Limpa dispensas locais para rever todos os avisos ativos
     */
    resetDismissed() {
        localStorage.removeItem('omniflowti_dismissed_notices');
        if (typeof Toast !== 'undefined') {
            Toast.success('Histórico de cientes redefinido. Todos os avisos ativos serão exibidos.');
        }
        this.init();
    },

    /**
     * Renderiza os avisos ativos que ainda não foram dispensados
     */
    render() {
        const container = document.getElementById('broadcast-banner-container');
        if (!container) return;

        const dismissed = this.getDismissedIds();
        // Filtra avisos não dispensados
        const visibleNotices = this.activeNotices.filter(n => !dismissed.includes(n.id));

        if (visibleNotices.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = visibleNotices.map(notice => this.renderBannerItem(notice)).join('');
    },

    /**
     * Renderiza o HTML de um item de banner específico
     */
    renderBannerItem(n) {
        const typeConfig = {
            critical: {
                icon: 'ri-alarm-warning-fill',
                label: 'INCIDENTE CRÍTICO',
                colorClass: 'broadcast-critical'
            },
            warning: {
                icon: 'ri-tools-fill',
                label: 'MANUTENÇÃO PROGRAMADA',
                colorClass: 'broadcast-warning'
            },
            info: {
                icon: 'ri-information-fill',
                label: 'COMUNICADO',
                colorClass: 'broadcast-info'
            }
        };

        const config = typeConfig[n.type] || typeConfig.info;
        const canManage = typeof AppState !== 'undefined' && (AppState.isAdmin() || AppState.isSupervisor());

        // Período de vigência amigável
        let dateInfo = '';
        if (n.starts_at || n.expires_at) {
            const start = n.starts_at ? this.formatDateSafe(n.starts_at) : null;
            const end = n.expires_at ? this.formatDateSafe(n.expires_at) : null;

            if (start && end) {
                dateInfo = `<span class="broadcast-banner-date"><i class="ri-calendar-line"></i> ${start} até ${end}</span>`;
            } else if (end) {
                dateInfo = `<span class="broadcast-banner-date"><i class="ri-time-line"></i> Até ${end}</span>`;
            } else if (start) {
                dateInfo = `<span class="broadcast-banner-date"><i class="ri-calendar-check-line"></i> A partir de ${start}</span>`;
            }
        }

        const linkHtml = n.link_url ? `
            <a href="${this.escapeHtml(n.link_url)}" target="_blank" rel="noopener noreferrer" class="broadcast-banner-link">
                <span>${this.escapeHtml(n.link_text || 'Mais Detalhes')}</span>
                <i class="ri-external-link-line"></i>
            </a>
        ` : '';

        const manageBtn = canManage ? `
            <button class="broadcast-btn-icon" onclick="BroadcastBanner.openManageModal(${n.id})" title="Gerenciar este comunicado">
                <i class="ri-settings-3-line"></i>
            </button>
        ` : '';

        return `
        <div class="broadcast-banner ${config.colorClass}" id="broadcast-banner-${n.id}">
            <div class="broadcast-banner-left">
                <div class="broadcast-banner-badge">
                    <i class="${config.icon}"></i>
                    <span>${config.label}</span>
                </div>
            </div>

            <div class="broadcast-banner-body">
                <div class="broadcast-banner-header">
                    <strong class="broadcast-banner-title">${this.escapeHtml(n.title)}</strong>
                    ${dateInfo}
                </div>
                <div class="broadcast-banner-message">${this.escapeHtml(n.message)}</div>
            </div>

            <div class="broadcast-banner-actions">
                ${linkHtml}
                ${manageBtn}
                <button class="broadcast-btn-dismiss" onclick="BroadcastBanner.dismiss(${n.id})" title="Marcar como ciente e ocultar">
                    <i class="ri-check-line"></i>
                    <span>Ciente</span>
                </button>
            </div>
        </div>
        `;
    },

    /**
     * Atualiza o badge do ícone de megafone na Topbar
     */
    updateTopbarBadge() {
        const badge = document.getElementById('broadcast-badge');
        if (!badge) return;

        const dismissed = this.getDismissedIds();
        const activeCount = this.activeNotices.filter(n => !dismissed.includes(n.id)).length;

        if (activeCount > 0) {
            badge.textContent = activeCount > 9 ? '9+' : activeCount;
            badge.style.display = 'flex';
            badge.classList.add('has-active');
        } else {
            badge.style.display = 'none';
            badge.classList.remove('has-active');
        }
    },

    /**
     * Formata data de forma segura e amigável
     */
    formatDateSafe(dateStr, withTime = true) {
        if (!dateStr) return '';
        try {
            const clean = String(dateStr).replace(' ', 'T');
            const d = new Date(clean);
            if (isNaN(d.getTime())) return String(dateStr);
            return d.toLocaleDateString('pt-BR', withTime ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            return String(dateStr);
        }
    },

    /**
     * Abre a Central / Modal do Mural de Avisos
     * Regular users podem consultar avisos ativos e reabrir dispensados.
     * Supervisores e Administradores têm controle total (CRUD).
     */
    async openManageModal(selectedNoticeId = null) {
        const canManage = typeof AppState !== 'undefined' && (AppState.isAdmin() || AppState.isSupervisor());

        try {
            let notices = [];
            try {
                // Se gestor, tenta lista completa; se comum ou se falhar, ativos
                const res = canManage ? await API.getNotices() : await API.getActiveNotices();
                notices = (res && Array.isArray(res.data)) ? res.data : [];
            } catch (err) {
                console.warn('[BroadcastBanner] Falha ao obter lista completa, buscando ativos:', err);
                const fallbackRes = await API.getActiveNotices();
                notices = (fallbackRes && Array.isArray(fallbackRes.data)) ? fallbackRes.data : [];
            }

            let selectedNotice = null;
            if (selectedNoticeId) {
                selectedNotice = notices.find(n => n.id === selectedNoticeId);
            }

            this.renderModalContent(notices, selectedNotice, canManage);
        } catch (e) {
            console.error('[BroadcastBanner] Erro ao abrir modal:', e);
            if (typeof Toast !== 'undefined') {
                Toast.error('Erro ao abrir central de avisos: ' + (e.message || ''));
            }
        }
    },

    /**
     * Constrói o layout interno do modal
     */
    renderModalContent(notices, editingNotice = null, canManage = false) {
        const dismissed = this.getDismissedIds();

        const content = `
        <div class="broadcast-modal-wrapper">
            <div class="broadcast-modal-header-desc">
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">
                    ${canManage 
                        ? 'Publique comunicados corporativos, incidentes e mantenha as equipes cientes de manutenções programadas.'
                        : 'Mural corporativo com comunicados oficiais, janelas de manutenção e alertas de incidentes.'}
                </p>
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <button class="btn btn-secondary btn-sm" id="btn-reset-dismissed" title="Volta a exibir avisos que você já marcou como ciente">
                        <i class="ri-refresh-line"></i> Reexibir Avisos Dispensados
                    </button>
                    ${canManage && !editingNotice ? `
                    <button class="btn btn-primary btn-sm" id="btn-toggle-new-notice">
                        <i class="ri-add-line"></i> Novo Aviso
                    </button>` : ''}
                </div>
            </div>

            ${canManage ? `
            <div id="notice-form-container" class="card" style="margin-top: 16px; padding: 16px; background: var(--bg-primary); border: 1px solid var(--border-color); ${editingNotice ? '' : 'display: none;'}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">
                        <i class="${editingNotice ? 'ri-edit-line' : 'ri-megaphone-line'}" style="color: var(--theme-primary);"></i>
                        ${editingNotice ? 'Editar Comunicado / Alerta' : 'Publicar Novo Comunicado'}
                    </h4>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-form" style="padding: 2px 8px; font-size: 0.75rem;">Fechar</button>
                </div>

                <form id="broadcast-notice-form">
                    <input type="hidden" id="notice-id" value="${editingNotice ? editingNotice.id : ''}" />

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Título do Comunicado *</label>
                            <input type="text" class="form-input" id="notice-title" required 
                                   placeholder="Ex: Janela de Manutenção no Cluster OCI" 
                                   value="${editingNotice ? this.escapeHtml(editingNotice.title) : ''}" />
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Tipo / Gravidade *</label>
                            <select class="form-input form-select" id="notice-type">
                                <option value="info" ${editingNotice?.type === 'info' ? 'selected' : ''}>ℹ️ Informativo / Comunicado</option>
                                <option value="warning" ${editingNotice?.type === 'warning' ? 'selected' : ''}>⚠️ Manutenção Programada</option>
                                <option value="critical" ${editingNotice?.type === 'critical' ? 'selected' : ''}>🚨 Incidente Crítico</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 12px;">
                        <label class="form-label">Mensagem Descritiva *</label>
                        <textarea class="form-input" id="notice-message" rows="3" required
                                  placeholder="Descreva o impacto, sistemas afetados ou orientações para os usuários...">${editingNotice ? this.escapeHtml(editingNotice.message) : ''}</textarea>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Link Externo / Documentação (Opcional)</label>
                            <input type="url" class="form-input" id="notice-link-url" 
                                   placeholder="https://status.flowti.com.br" 
                                   value="${editingNotice?.link_url ? this.escapeHtml(editingNotice.link_url) : ''}" />
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Texto do Botão / Link</label>
                            <input type="text" class="form-input" id="notice-link-text" 
                                   placeholder="Ex: Acompanhar Status" 
                                   value="${editingNotice?.link_text ? this.escapeHtml(editingNotice.link_text) : 'Mais Detalhes'}" />
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Início da Vigência</label>
                            <input type="datetime-local" class="form-input" id="notice-starts-at" 
                                   value="${editingNotice?.starts_at ? editingNotice.starts_at.replace(' ', 'T').substring(0, 16) : ''}" />
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Término / Expiração Automática</label>
                            <input type="datetime-local" class="form-input" id="notice-expires-at" 
                                   value="${editingNotice?.expires_at ? editingNotice.expires_at.replace(' ', 'T').substring(0, 16) : ''}" />
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
                        <label class="checkbox-wrapper" style="font-weight: 500; font-size: 0.85rem;">
                            <input type="checkbox" id="notice-is-active" ${!editingNotice || editingNotice.is_active ? 'checked' : ''} />
                            <span>Ativo Imediatamente</span>
                        </label>
                        <div style="display: flex; gap: 8px;">
                            <button type="submit" class="btn btn-primary btn-sm" id="btn-save-notice">
                                <i class="ri-save-line"></i> ${editingNotice ? 'Salvar Alterações' : 'Publicar Aviso'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>` : ''}

            <div class="broadcast-notices-list" style="margin-top: 16px;">
                <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">
                    Histórico de Comunicados (${notices.length})
                </h4>

                ${notices.length === 0 ? `
                    <div class="empty-state" style="padding: 24px; text-align: center;">
                        <i class="ri-megaphone-line" style="font-size: 2rem; color: var(--text-muted);"></i>
                        <p style="margin-top: 8px; color: var(--text-secondary); font-size: 0.85rem;">Nenhum comunicado cadastrado no momento.</p>
                    </div>
                ` : `
                    <div style="display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 4px;">
                        ${notices.map(n => {
                            const isDismissed = dismissed.includes(n.id);
                            const isActive = !!n.is_active;
                            const typeBadge = n.type === 'critical' ? 'badge-danger' : n.type === 'warning' ? 'badge-warning' : 'badge-primary';
                            const typeLabel = n.type === 'critical' ? 'Incidente' : n.type === 'warning' ? 'Manutenção' : 'Informativo';

                            return `
                            <div class="card" style="padding: 12px; margin: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                            <span class="badge ${typeBadge}" style="font-size: 0.7rem; padding: 2px 6px;">${typeLabel}</span>
                                            <strong style="font-size: 0.9rem; color: var(--text-primary);">${this.escapeHtml(n.title)}</strong>
                                            ${!isActive ? '<span class="badge badge-secondary" style="font-size: 0.65rem;">Inativo</span>' : ''}
                                            ${isDismissed ? '<span class="badge" style="font-size: 0.65rem; background: var(--bg-hover); color: var(--text-muted);">Você dispensou</span>' : ''}
                                        </div>
                                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0 0 6px 0; line-height: 1.4;">
                                            ${this.escapeHtml(n.message)}
                                        </p>
                                        <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.75rem; color: var(--text-muted);">
                                            ${n.author_name ? `<span><i class="ri-user-line"></i> ${this.escapeHtml(n.author_name)}</span>` : ''}
                                            ${n.starts_at ? `<span><i class="ri-calendar-line"></i> Início: ${this.formatDateSafe(n.starts_at)}</span>` : ''}
                                            ${n.expires_at ? `<span><i class="ri-calendar-close-line"></i> Fim: ${this.formatDateSafe(n.expires_at)}</span>` : ''}
                                            ${n.link_url ? `<a href="${this.escapeHtml(n.link_url)}" target="_blank" style="color: var(--theme-primary); text-decoration: none;"><i class="ri-external-link-line"></i> Link</a>` : ''}
                                        </div>
                                    </div>

                                    ${canManage ? `
                                    <div style="display: flex; gap: 4px;">
                                        <button class="btn btn-secondary btn-sm" onclick="BroadcastBanner.editNotice(${n.id})" title="Editar aviso" style="padding: 4px 8px;">
                                            <i class="ri-edit-line"></i>
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="BroadcastBanner.deleteNotice(${n.id})" title="Excluir aviso" style="padding: 4px 8px;">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>` : ''}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>
        `;

        Modal.open({
            title: '📢 Mural de Avisos & Manutenções',
            content: content,
            size: 'lg'
        });

        this.bindModalEvents(canManage);
    },

    /**
     * Vincula eventos internos do modal
     */
    bindModalEvents(canManage) {
        // Reexibir avisos dispensados
        const resetBtn = document.getElementById('btn-reset-dismissed');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetDismissed();
                Modal.close();
            });
        }

        if (!canManage) return;

        // Toggle do form de novo aviso
        const toggleBtn = document.getElementById('btn-toggle-new-notice');
        const formContainer = document.getElementById('notice-form-container');
        const cancelBtn = document.getElementById('btn-cancel-form');

        if (toggleBtn && formContainer) {
            toggleBtn.addEventListener('click', () => {
                formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
                if (formContainer.style.display === 'block') {
                    document.getElementById('notice-title')?.focus();
                }
            });
        }

        if (cancelBtn && formContainer) {
            cancelBtn.addEventListener('click', () => {
                formContainer.style.display = 'none';
            });
        }

        // Submissão do formulário (Criar / Editar)
        const form = document.getElementById('broadcast-notice-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveNoticeForm();
            });
        }
    },

    /**
     * Executa salvar (POST / PUT)
     */
    async saveNoticeForm() {
        const id = document.getElementById('notice-id')?.value;
        const title = document.getElementById('notice-title')?.value.trim();
        const type = document.getElementById('notice-type')?.value;
        const message = document.getElementById('notice-message')?.value.trim();
        const link_url = document.getElementById('notice-link-url')?.value.trim() || null;
        const link_text = document.getElementById('notice-link-text')?.value.trim() || null;
        const starts_at_val = document.getElementById('notice-starts-at')?.value;
        const expires_at_val = document.getElementById('notice-expires-at')?.value;
        const is_active = document.getElementById('notice-is-active')?.checked ? 1 : 0;

        if (!title || !message) {
            Toast.warning('Título e mensagem são obrigatórios.');
            return;
        }

        const payload = {
            title,
            type,
            message,
            link_url,
            link_text,
            starts_at: starts_at_val ? starts_at_val.replace('T', ' ') + ':00' : null,
            expires_at: expires_at_val ? expires_at_val.replace('T', ' ') + ':00' : null,
            is_active
        };

        const saveBtn = document.getElementById('btn-save-notice');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 0.6s linear infinite;"></i> Salvando...';
        }

        try {
            if (id) {
                await API.updateNotice(id, payload);
                Toast.success('Comunicado atualizado com sucesso!');
            } else {
                await API.createNotice(payload);
                Toast.success('Comunicado publicado com sucesso!');
            }

            // Atualiza visual e reabre modal
            await this.init();
            this.openManageModal();
        } catch (err) {
            Toast.error(err.message || 'Erro ao salvar comunicado.');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="ri-save-line"></i> Salvar';
            }
        }
    },

    /**
     * Carrega dados no formulário para edição
     */
    async editNotice(id) {
        this.openManageModal(id);
    },

    /**
     * Remove um aviso após confirmação
     */
    async deleteNotice(id) {
        const confirmed = await Modal.confirm({
            title: 'Excluir Comunicado',
            message: 'Tem certeza que deseja excluir permanentemente este comunicado do mural?',
            confirmText: 'Excluir',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await API.deleteNotice(id);
            Toast.success('Comunicado excluído com sucesso.');
            await this.init();
            this.openManageModal();
        } catch (e) {
            Toast.error(e.message || 'Erro ao excluir comunicado.');
        }
    },

    /**
     * Escapa caracteres HTML para segurança
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Exporta explicitamente no escopo global window
window.BroadcastBanner = BroadcastBanner;

