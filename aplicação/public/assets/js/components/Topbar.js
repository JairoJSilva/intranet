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
                <div class="topbar-search">
                    <i class="ri-search-line"></i>
                    <input type="text" id="global-search" placeholder="Buscar painéis, links..."
                           autocomplete="off" />
                </div>

                <button class="topbar-btn" id="health-check-btn" title="Verificar status dos serviços">
                    <i class="ri-pulse-line"></i>
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
        // Health Check button
        const healthBtn = document.getElementById('health-check-btn');
        if (healthBtn) {
            healthBtn.addEventListener('click', async () => {
                healthBtn.disabled = true;
                healthBtn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 0.6s linear infinite;"></i>';
                
                try {
                    const result = await API.healthCheck();
                    Toast.success(`Health check concluído: ${result.data.stats.online} online, ${result.data.stats.offline} offline.`);
                    
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

        // Global Search
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    const query = e.target.value.trim().toLowerCase();
                    if (query.length > 1) {
                        document.querySelectorAll('.link-item, .panel-card').forEach(el => {
                            const text = el.textContent.toLowerCase();
                            el.style.display = text.includes(query) ? '' : 'none';
                        });
                    } else {
                        document.querySelectorAll('.link-item, .panel-card').forEach(el => {
                            el.style.display = '';
                        });
                    }
                }, 300);
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
    }
};
