/**
 * Omniflowti — Theme & User Profile Manager
 * Gerencia temas baseados na identidade visual oficial Flowti e MV:
 * - https://mv.com.br/ (Verde Esmeralda #008C77 e Azul Petróleo #214B63)
 * - https://dash.flowti.com.br/login (Flowti Cyan #00C4BF, Coral #F05A28 e Grafana Dark #111217)
 */
const ThemeManager = {
    themes: [
        {
            id: 'aura',
            name: 'Aura Electric Dark',
            tag: 'Padrão Oficial (Aura)',
            desc: 'Preto Profundo (#0B0A0A) com gradientes elétricos de Roxo (#AB17EE e #8129A9) e brilho neon',
            icon: 'ri-flashlight-line',
            bg: '#0B0A0A',
            card: '#131118',
            primary: '#AB17EE',
            accent: '#8129A9'
        },
        {
            id: 'safira-dark',
            name: 'Safira Night',
            tag: 'Azul Safira & Âmbar',
            desc: 'Fundo Slate Dark (#0A0E1A) com acentos em Azul Safira (#0178C8) e Laranja Solar (#F67F1D)',
            icon: 'ri-contrast-2-line',
            bg: '#0a0e1a',
            card: '#1a1f2e',
            primary: '#0178c8',
            accent: '#f67f1d'
        },
        {
            id: 'terracotta-sunset',
            name: 'Terracota Solar',
            tag: 'Coral & Âmbar',
            desc: 'Gradiente quente de terracota coral (#E75B32) e laranja solar (#F67F1D) com base escura (#0F0E12)',
            icon: 'ri-fire-line',
            bg: '#0f0e12',
            card: '#1f1b26',
            primary: '#e75b32',
            accent: '#f67f1d'
        },
        {
            id: 'flowti-dark',
            name: 'Flowti Observability',
            tag: 'Flowti NOC',
            desc: 'Tema escuro focado em monitoramento com acentos Flowti Cyan (#00C4BF) e Coral (#F05A28)',
            icon: 'ri-dashboard-3-line',
            bg: '#111217',
            card: '#20242b',
            primary: '#00c4bf',
            accent: '#f05a28'
        },
        {
            id: 'mv-teal',
            name: 'MV Saúde & Tecnologia',
            tag: 'Oficial MV',
            desc: 'Identidade visual oficial MV baseada no Verde Esmeralda (#008C77) e Azul Petróleo (#214B63)',
            icon: 'ri-hospital-line',
            bg: '#0a171c',
            card: '#152d36',
            primary: '#008c77',
            accent: '#00c4bf'
        },
        {
            id: 'mv-petrol',
            name: 'MV Azul Petróleo',
            tag: 'Corporativo MV',
            desc: 'Tons profundos e solenes inspirados no clássico azul petróleo (#214B63) da MV',
            icon: 'ri-shield-star-line',
            bg: '#08131a',
            card: '#142835',
            primary: '#00c4bf',
            accent: '#4f8c81'
        },
        {
            id: 'flowti-midnight',
            name: 'Midnight Observability',
            tag: 'NOC / OLED',
            desc: 'Preto puro para alta densidade visual inspirado nas telas de monitoramento Grafana',
            icon: 'ri-pulse-line',
            bg: '#07080b',
            card: '#13161c',
            primary: '#00d9cf',
            accent: '#f05a28'
        },
        {
            id: 'tech-neon-dark',
            name: 'Dark Mode Tech Neon',
            tag: 'Tech & Neon',
            desc: 'Preto fosco (#121212) com superfícies chumbo (#1E1E1E) e acentos em Roxo Elétrico (#6200EA) e Verde Neon (#00E676)',
            icon: 'ri-terminal-box-line',
            bg: '#121212',
            card: '#1e1e1e',
            primary: '#6200ea',
            accent: '#00e676'
        },
        {
            id: 'ultramarine-dark',
            name: 'Electric Ultramarine & Aqua',
            tag: 'Cyber Navy & Violet',
            desc: 'Azul Noite (#001744) com superfícies Marinho (#001B72), acentos em Ultramarino (#312BD9), Ciano Aqua (#17E1E5) e Violeta (#7F00F5)',
            icon: 'ri-space-ship-line',
            bg: '#001744',
            card: '#001b72',
            primary: '#312bd9',
            accent: '#17e1e5'
        }
    ],

    /**
     * Inicializa o tema salvo
     */
    init() {
        const saved = this.getTheme();
        this.setTheme(saved, false);
    },

    /**
     * Retorna o tema atual
     */
    getTheme() {
        const saved = localStorage.getItem('omniflowti_theme');
        // Aliases e fallback para temas escuros
        if (!saved || saved === 'dark' || saved === 'aura' || saved === 'light' || saved === 'flowti-light' || saved === 'safira-light' || saved === 'classic-corp-light' || saved === 'warm-minimalist' || saved === 'cobalt-light') {
            return 'aura';
        }
        if (saved === 'ocean') return 'mv-petrol';
        if (saved === 'sunset') return 'mv-teal';
        if (saved === 'midnight') return 'flowti-midnight';
        if (saved === 'cobalt-dark') return 'safira-dark';
        if (saved === 'solar-terracotta') return 'terracotta-sunset';
        return saved;
    },

    /**
     * Aplica um novo tema
     */
    setTheme(themeId, notify = true) {
        const found = this.themes.find(t => t.id === themeId);
        const validTheme = found ? themeId : 'aura';

        document.documentElement.setAttribute('data-theme', validTheme);
        localStorage.setItem('omniflowti_theme', validTheme);

        // Atualiza botões ou seletores se estiverem visíveis
        document.querySelectorAll('.theme-card').forEach(card => {
            const isCurrent = card.dataset.themeId === validTheme;
            card.classList.toggle('active', isCurrent);
            const badge = card.querySelector('.theme-active-indicator');
            if (badge) {
                badge.style.display = isCurrent ? 'flex' : 'none';
            }
        });

        // Atualiza ícone do botão rápido na topbar se existir
        const quickBtn = document.getElementById('theme-toggle-btn');
        if (quickBtn) {
            const currentTheme = this.themes.find(t => t.id === validTheme);
            quickBtn.innerHTML = `<i class="${currentTheme?.icon || 'ri-palette-line'}"></i>`;
            quickBtn.title = `Tema: ${currentTheme?.name || validTheme} (Clique para alterar)`;
        }

        if (notify) {
            Toast.success(`Tema alterado para ${found?.name || validTheme}`);
        }
    },

    /**
     * Cicla para o próximo tema (para o botão rápido da Topbar)
     */
    cycleTheme() {
        const current = this.getTheme();
        const currentIndex = this.themes.findIndex(t => t.id === current);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex].id, true);
    },

    /**
     * Abre o modal completo de Propriedades do Usuário e Seleção de Temas
     */
    openUserProfileModal() {
        const user = AppState.get('user');
        const initials = AppState.getUserInitials();
        const role = AppState.getUserRole();
        const currentTheme = this.getTheme();

        const groups = user?.groups || [];
        const groupsHtml = groups.length > 0 
            ? groups.map(g => `
                <span class="user-prop-badge" style="background: ${g.color || 'var(--theme-primary)'}20; color: ${g.color || 'var(--theme-primary)'}; border: 1px solid ${g.color || 'var(--theme-primary)'}40;">
                    <i class="${g.icon || 'ri-team-line'}"></i> ${g.name}
                </span>
            `).join('')
            : '<span style="color: var(--text-muted); font-size: 0.85rem;">Nenhum grupo associado</span>';

        const authProviderLabel = user?.auth_provider === 'ldap' 
            ? '<i class="ri-shield-user-line" style="color: var(--theme-primary);"></i> Active Directory (LDAP)' 
            : '<i class="ri-database-2-line" style="color: var(--theme-accent);"></i> Local (Omniflowti)';

        const themesHtml = this.themes.map(t => {
            const isActive = t.id === currentTheme;
            return `
            <div class="theme-card ${isActive ? 'active' : ''}" data-theme-id="${t.id}" onclick="ThemeManager.setTheme('${t.id}')">
                <div class="theme-card-header">
                    <div class="theme-card-title">
                        <i class="${t.icon}"></i>
                        <span>${t.name}</span>
                    </div>
                    <span class="theme-tag">${t.tag}</span>
                </div>
                <div class="theme-swatches">
                    <div class="theme-swatch" style="background: ${t.bg};" title="Fundo principal"></div>
                    <div class="theme-swatch" style="background: ${t.card};" title="Superfície / Cartão"></div>
                    <div class="theme-swatch" style="background: ${t.primary};" title="Cor primária"></div>
                    <div class="theme-swatch" style="background: ${t.accent};" title="Cor de destaque"></div>
                </div>
                <p class="theme-desc">${t.desc}</p>
                <div class="theme-active-indicator" style="${isActive ? 'display: flex;' : 'display: none;'}">
                    <i class="ri-check-line"></i> Tema Ativo
                </div>
            </div>`;
        }).join('');

        const content = `
            <div class="user-profile-modal-body">
                <!-- Cabeçalho de Perfil -->
                <div class="user-profile-header-card">
                    <div class="user-profile-avatar">${initials}</div>
                    <div class="user-profile-info">
                        <div class="user-profile-name">${user?.display_name || 'Usuário'}</div>
                        <div class="user-profile-username">@${user?.username || 'usuario'}</div>
                        <div style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;">
                            <span class="badge ${user?.is_admin ? 'badge-admin' : user?.is_supervisor ? 'badge-supervisor' : 'badge-user'}">
                                ${role}
                            </span>
                            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--status-online); border: 1px solid rgba(16, 185, 129, 0.3);">
                                <span class="health-dot" style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--status-online); margin-right: 4px;"></span>
                                Ativo
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Detalhes do Usuário -->
                <div class="user-profile-section">
                    <div class="user-profile-section-title">
                        <i class="ri-information-line"></i> Informações da Conta
                    </div>
                    <div class="user-props-grid">
                        <div class="user-prop-item">
                            <span class="user-prop-label">E-mail Institucional</span>
                            <span class="user-prop-value">${user?.email || 'Não informado'}</span>
                        </div>
                        <div class="user-prop-item">
                            <span class="user-prop-label">Método de Autenticação</span>
                            <span class="user-prop-value">${authProviderLabel}</span>
                        </div>
                        <div class="user-prop-item" style="grid-column: 1 / -1;">
                            <span class="user-prop-label">Setores / Grupos com Permissão</span>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
                                ${groupsHtml}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Seletor de Temas -->
                <div class="user-profile-section">
                    <div class="user-profile-section-title">
                        <i class="ri-palette-line"></i> Personalização de Tema (Identidade Visual)
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 14px;">
                        Escolha o tema de sua preferência. A seleção é aplicada imediatamente e salva nas suas preferências.
                    </p>
                    <div class="theme-picker-grid">
                        ${themesHtml}
                    </div>
                </div>
            </div>
        `;

        const footer = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <button class="btn btn-ghost btn-sm" onclick="App.logout()" style="color: var(--status-offline); display: flex; align-items: center; gap: 6px;">
                    <i class="ri-logout-box-r-line"></i> Encerrar Sessão
                </button>
                <button class="btn btn-primary btn-sm" onclick="Modal.close()">
                    <i class="ri-check-line"></i> Concluir
                </button>
            </div>
        `;

        Modal.open({
            title: 'Propriedades do Usuário',
            content,
            footer,
            size: 'lg'
        });
    }
};
