/**
 * Intranet Flowti — Dashboard Component
 * Exibe métricas executivas e resumo do status dos sistemas.
 */
const Dashboard = {
    async render() {
        return `
        <div class="stats-grid" id="stats-grid">
            ${this.renderSkeletons(4)}
        </div>

        <div class="page-header">
            <div>
                <h3 class="page-title">Visão Geral dos Sistemas</h3>
                <p class="page-subtitle">Status em tempo real das aplicações monitoradas</p>
            </div>
        </div>

        <div class="panels-grid" id="dashboard-panels">
            ${this.renderSkeletons(3, 'panel')}
        </div>`;
    },

    async loadData() {
        try {
            // Carrega stats e painéis em paralelo
            const [statsRes, panelsRes] = await Promise.all([
                API.dashboardStats(),
                API.getPanels()
            ]);

            AppState.set('stats', statsRes.data);
            AppState.set('panels', panelsRes.data);

            this.renderStats(statsRes.data);
            this.renderPanels(panelsRes.data);
        } catch (e) {
            console.error('[Dashboard] Erro ao carregar dados:', e);
        }
    },

    renderStats(stats) {
        const grid = document.getElementById('stats-grid');
        if (!grid) return;

        const uptimeColor = stats.uptime_percent >= 90 ? 'var(--status-online)' :
                           stats.uptime_percent >= 50 ? 'var(--status-warning)' : 'var(--status-offline)';

        grid.innerHTML = `
            <div class="stat-card" style="--stat-color: var(--vem-blue-500); --stat-bg: rgba(1,120,200,0.12);">
                <div>
                    <div class="stat-value">${stats.total_links}</div>
                    <div class="stat-label">Aplicações Monitoradas</div>
                </div>
                <div class="stat-icon"><i class="ri-apps-line"></i></div>
            </div>

            <div class="stat-card" style="--stat-color: var(--status-online); --stat-bg: var(--status-online-bg);">
                <div>
                    <div class="stat-value" style="color: var(--status-online);">${stats.links_online}</div>
                    <div class="stat-label">Sistemas Online</div>
                </div>
                <div class="stat-icon"><i class="ri-check-double-line"></i></div>
            </div>

            <div class="stat-card" style="--stat-color: var(--status-offline); --stat-bg: var(--status-offline-bg);">
                <div>
                    <div class="stat-value" style="color: ${stats.links_offline > 0 ? 'var(--status-offline)' : 'var(--text-primary)'};">${stats.links_offline}</div>
                    <div class="stat-label">Sistemas Offline</div>
                </div>
                <div class="stat-icon"><i class="ri-close-circle-line"></i></div>
            </div>

            <div class="stat-card" style="--stat-color: ${uptimeColor}; --stat-bg: rgba(16,185,129,0.12);">
                <div>
                    <div class="stat-value" style="color: ${uptimeColor};">${stats.uptime_percent}%</div>
                    <div class="stat-label">Disponibilidade Geral</div>
                </div>
                <div class="stat-icon"><i class="ri-speed-line"></i></div>
            </div>
        `;
    },

    renderPanels(panels) {
        const container = document.getElementById('dashboard-panels');
        if (!container) return;

        if (panels.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="ri-layout-grid-line"></i>
                    <p>Nenhum painel disponível para o seu perfil de acesso.</p>
                </div>`;
            return;
        }

        container.innerHTML = panels.map(panel => `
            <div class="panel-card" data-panel-id="${panel.id}">
                <div class="panel-header">
                    <div class="panel-icon">
                        <i class="${panel.icon || 'ri-dashboard-line'}"></i>
                    </div>
                    <div>
                        <div class="panel-title">${panel.title}</div>
                        <div class="panel-desc">${panel.description || ''} · ${panel.links?.length || 0} links</div>
                    </div>
                </div>
                <div class="panel-links">
                    ${(panel.links || []).map(link => `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-item" title="${link.url}">
                            <div class="link-icon">
                                <i class="${link.icon || 'ri-links-line'}"></i>
                            </div>
                            <div class="link-info">
                                <div class="link-title">${link.title}</div>
                                <div class="link-url">${link.url}</div>
                            </div>
                            <div>
                                <span class="health-badge ${link.health_status || 'unknown'}">
                                    <span class="health-dot"></span>
                                    ${link.health_status || 'N/A'}
                                </span>
                                ${link.response_time_ms ? `<span class="health-response">${link.response_time_ms}ms</span>` : ''}
                            </div>
                        </a>
                    `).join('')}

                    ${(!panel.links || panel.links.length === 0) ? `
                        <div class="empty-state" style="padding: 20px;">
                            <p style="font-size: 0.85rem;">Nenhum link cadastrado neste painel.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    renderSkeletons(count, type = 'stat') {
        if (type === 'stat') {
            return Array(count).fill(`
                <div class="stat-card">
                    <div>
                        <div class="skeleton" style="width: 80px; height: 36px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="width: 140px; height: 14px;"></div>
                    </div>
                    <div class="skeleton" style="width: 48px; height: 48px; border-radius: var(--radius-sm);"></div>
                </div>
            `).join('');
        }

        return Array(count).fill(`
            <div class="panel-card">
                <div class="panel-header">
                    <div class="skeleton" style="width: 42px; height: 42px; border-radius: var(--radius-sm);"></div>
                    <div>
                        <div class="skeleton" style="width: 160px; height: 18px; margin-bottom: 6px;"></div>
                        <div class="skeleton" style="width: 100px; height: 12px;"></div>
                    </div>
                </div>
                <div class="panel-links" style="padding: 16px;">
                    <div class="skeleton" style="height: 52px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="height: 52px; margin-bottom: 8px;"></div>
                    <div class="skeleton" style="height: 52px;"></div>
                </div>
            </div>
        `).join('');
    }
};
