/**
 * Omniflowti — Topbar Component
 */
const Topbar = {
    render(pageTitle = 'Dashboard') {
        const user = AppState.get('user');
        const initials = AppState.getUserInitials();
        const role = AppState.getUserRole();

        return `
        <header class="topbar" id="topbar">
            <div class="topbar-left">
                <button class="topbar-btn" id="mobile-menu-btn" style="display: none;">
                    <i class="ri-menu-line"></i>
                </button>
                <h2 class="topbar-title">${pageTitle}</h2>
            </div>

            <div class="topbar-right">
                <div class="topbar-search" id="topbar-search-trigger" style="cursor: pointer;" title="Abrir busca rápida (Ctrl + K)">
                    <i class="ri-search-line"></i>
                    <input type="text" id="global-search" placeholder="Buscar painéis, links..."
                           autocomplete="off" readonly style="cursor: pointer;" />
                    <span class="search-kbd-shortcut"><kbd>Ctrl</kbd> <kbd>K</kbd></span>
                </div>

                <button class="topbar-btn" id="broadcast-manage-btn" onclick="BroadcastBanner.openManageModal()" title="Mural de Avisos & Manutenções Programadas" style="position: relative; cursor: pointer;">
                    <i class="ri-megaphone-line"></i>
                    <span class="broadcast-badge" id="broadcast-badge" style="display: none;"></span>
                </button>

                <div class="notifications-wrapper" style="position: relative;">
                    <button class="topbar-btn" id="notifications-bell-btn" title="Central de Notificações Operacionais">
                        <i class="ri-notification-3-line"></i>
                        <span class="notifications-badge" id="notifications-badge" style="display: none;"></span>
                    </button>
                    <div class="notifications-popover" id="notifications-popover"></div>
                </div>

                <button class="topbar-btn" id="health-check-btn" title="Verificar status dos serviços">
                    <i class="ri-pulse-line"></i>
                </button>

                <button class="topbar-btn" id="density-toggle-btn" title="Alternar Densidade de Tela (Compacto NOC / Confortável)">
                    <i class="${this.isCompactMode() ? 'ri-layout-masonry-line' : 'ri-layout-grid-line'}"></i>
                </button>

                <div class="user-menu" id="user-menu-toggle" title="Clique para ver propriedades do usuário e temas" style="cursor: pointer;">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <span class="user-name">${user?.display_name || 'Usuário'}</span>
                        <span class="user-role">${role}</span>
                    </div>
                    <i class="ri-arrow-down-s-line" style="color: var(--text-muted);"></i>
                </div>
            </div>
        </header>`;
    },

    initEvents() {
        // Inicializa badge de notificações
        NotificationManager.updateBadge();

        // Mural de Avisos e Comunicados (Broadcast Banner)
        if (typeof BroadcastBanner !== 'undefined') {
            BroadcastBanner.updateTopbarBadge();
        }

        // Toggle do popover de notificações
        const notifBtn = document.getElementById('notifications-bell-btn');
        const notifPopover = document.getElementById('notifications-popover');
        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                NotificationManager.togglePopover();
            });
        }

        // Fechar popover ao clicar fora
        document.addEventListener('click', (e) => {
            if (notifPopover && !notifPopover.classList.contains('hidden')) {
                if (!notifPopover.contains(e.target) && e.target !== notifBtn && !notifBtn?.contains(e.target)) {
                    NotificationManager.closePopover();
                }
            }
        });

        // Health Check button
        const healthBtn = document.getElementById('health-check-btn');
        if (healthBtn) {
            healthBtn.addEventListener('click', async () => {
                healthBtn.disabled = true;
                healthBtn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 0.6s linear infinite;"></i>';
                
                try {
                    const result = await API.healthCheck();
                    Toast.success(`Health check concluído: ${result.data.stats.online} online, ${result.data.stats.offline} offline.`);
                    
                    // Notifica incidentes operacionais via NotificationManager
                    if (result.data && Array.isArray(result.data.results)) {
                        result.data.results.forEach(item => {
                            if (item.status === 'offline' || item.status === 'warning') {
                                NotificationManager.notifyIncident(item, item.panel_title || 'Painel de Links');
                            }
                        });
                    }

                    // Recarrega a página atual para atualizar status
                    Router.resolve();
                } catch (e) {
                    Toast.error('Falha ao executar health check.');
                } finally {
                    healthBtn.disabled = false;
                    healthBtn.innerHTML = '<i class="ri-pulse-line"></i>';
                }
            });
        }

        // Global Search & Command Palette Trigger
        const searchTrigger = document.getElementById('topbar-search-trigger');
        if (searchTrigger) {
            searchTrigger.addEventListener('click', () => {
                if (window.CommandPalette) {
                    CommandPalette.open();
                }
            });
        }

        // Mobile menu
        const mobileBtn = document.getElementById('mobile-menu-btn');
        if (mobileBtn && window.innerWidth <= 1024) {
            mobileBtn.style.display = '';
            mobileBtn.addEventListener('click', () => {
                document.getElementById('sidebar')?.classList.toggle('mobile-open');
            });
        }

        // Propriedades do Usuário & Temas
        const userMenu = document.getElementById('user-menu-toggle');
        if (userMenu) {
            userMenu.addEventListener('click', () => {
                ThemeManager.openUserProfileModal();
            });
        }

        // Alternador de Densidade (Modo Compacto NOC vs Confortável)
        this.initDensityMode();
        const densityBtn = document.getElementById('density-toggle-btn');
        if (densityBtn) {
            densityBtn.addEventListener('click', () => this.toggleDensityMode());
        }
    },

    /**
     * Verifica se o modo compacto está ativo
     */
    isCompactMode() {
        return localStorage.getItem('omniflowti_density') === 'compact';
    },

    /**
     * Inicializa a classe no documento HTML conforme preferência salva
     */
    initDensityMode() {
        const isCompact = this.isCompactMode();
        if (isCompact) {
            document.documentElement.classList.add('density-compact');
        } else {
            document.documentElement.classList.remove('density-compact');
        }
        this.updateDensityButton();
    },

    /**
     * Alterna entre modo compacto e confortável
     */
    toggleDensityMode() {
        const isCurrentlyCompact = this.isCompactMode();
        const nextMode = isCurrentlyCompact ? 'comfortable' : 'compact';
        localStorage.setItem('omniflowti_density', nextMode);

        if (nextMode === 'compact') {
            document.documentElement.classList.add('density-compact');
            if (typeof Toast !== 'undefined') {
                Toast.info('Modo Compacto (NOC / Monitoramento) ativado.');
            }
        } else {
            document.documentElement.classList.remove('density-compact');
            if (typeof Toast !== 'undefined') {
                Toast.info('Modo Confortável ativado.');
            }
        }

        this.updateDensityButton();
    },

    /**
     * Atualiza o estado visual do botão de densidade
     */
    updateDensityButton() {
        const btn = document.getElementById('density-toggle-btn');
        if (btn) {
            const isCompact = this.isCompactMode();
            btn.innerHTML = `<i class="${isCompact ? 'ri-layout-masonry-line' : 'ri-layout-grid-line'}"></i>`;
            btn.title = isCompact ? 'Modo Compacto ativo (Clique para Confortável)' : 'Modo Confortável ativo (Clique para Compacto NOC)';
            if (isCompact) {
                btn.style.color = 'var(--theme-primary)';
            } else {
                btn.style.color = '';
            }
        }
    }
};
