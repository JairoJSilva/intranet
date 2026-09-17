/**
 * Portal Unificado — Dashboard Executivo & Observabilidade
 * Visão operacional executiva com métricas de disponibilidade,
 * central de incidentes, sistemas críticos e resumo consolidado por setor.
 */
const Dashboard = {
    stats: null,
    panels: [],

    async render() {
        return `
        <div class="page-header" style="margin-bottom: 24px;">
            <div>
                <h3 class="page-title">Dashboard Operacional</h3>
                <p class="page-subtitle">Disponibilidade em tempo real, métricas executivas e saúde da infraestrutura corporativa</p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-sm" id="btn-dashboard-healthcheck">
                    <i class="ri-pulse-line"></i> Checar Todos os Sistemas
                </button>
            </div>
        </div>

        <!-- Cards de Métricas Principais (KPIs) -->
        <div class="stats-grid" id="stats-grid" style="margin-bottom: 28px;">
            ${this.renderSkeletons(4, 'stat')}
        </div>

        <!-- Central de Incidentes / Alertas Operacionais -->
        <div id="dashboard-incidents-section" style="margin-bottom: 28px;">
            <div class="skeleton" style="height: 90px; border-radius: var(--radius);"></div>
        </div>

        <!-- Acesso Rápido a Sistemas Críticos -->
        <div style="margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <div>
                    <h4 style="font-size: 1.1rem; font-weight: 600; margin: 0;">Sistemas Críticos & Acesso Rápido</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Aplicações prioritárias com monitoramento de latência ativa</p>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('#/panels')" style="color: var(--theme-primary); font-size: 0.82rem;">
                    Ver Catálogo Completo <i class="ri-arrow-right-line"></i>
                </button>
            </div>
            <div class="panels-grid" id="quick-access-grid" style="grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));">
                ${this.renderSkeletons(4, 'quick')}
            </div>
        </div>

        <!-- Distribuição de Disponibilidade por Setor / Painel -->
        <div class="card" style="margin-bottom: 24px; padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <div>
                    <h4 style="font-size: 1.05rem; font-weight: 600; margin: 0;">Visão Geral por Setor / Painel</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Índice de saúde e distribuição de serviços monitorados</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="Router.navigate('#/panels')" style="font-size: 0.78rem;">
                    <i class="ri-layout-grid-line"></i> Explorar Painéis
                </button>
            </div>
            <div id="sectors-health-table">
                <div class="skeleton" style="height: 140px;"></div>
            </div>
        </div>
        `;
    },

    async loadData() {
        try {
            const [statsRes, panelsRes] = await Promise.all([
                API.dashboardStats(),
                API.getPanels()
            ]);

            this.stats = statsRes.data || {};
            this.panels = panelsRes.data || [];

            AppState.set('stats', this.stats);
            AppState.set('panels', this.panels);
            AppState.syncPinnedPanelsWith(this.panels);

            this.renderStats(this.stats);
            this.renderIncidents(this.panels);
            this.renderQuickAccess(this.panels);
            this.renderSectorsTable(this.panels);
        } catch (e) {
            console.error('[Dashboard] Erro ao carregar dados:', e);
            Toast.error('Erro ao carregar dados operacionais.');
        }
    },

    initEvents() {
        document.getElementById('btn-dashboard-healthcheck')?.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const icon = btn.querySelector('i');
            btn.disabled = true;
            if (icon) icon.className = 'ri-refresh-line spin';

            try {
                Toast.info('Disparando verificação geral de integridade...');
                const res = await API.healthCheck();
                Toast.success(`Health check concluído: ${res.data.stats.online}/${res.data.stats.total} sistemas online.`);
                
                // Notifica incidentes operacionais no navegador
                if (res.data && Array.isArray(res.data.results)) {
                    res.data.results.forEach(item => {
                        if (item.status === 'offline' || item.status === 'warning') {
                            NotificationManager.notifyIncident(item, item.panel_title || 'Painel de Links');
                        }
                    });
                }

                await this.loadData();
            } catch (err) {
                Toast.error('Erro ao executar health check.');
            } finally {
                btn.disabled = false;
                if (icon) icon.className = 'ri-pulse-line';
            }
        });
    },

    /**
     * Alterna fixação de painel a partir do Dashboard
     */
    togglePin(panelId, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        const panel = (this.panels || []).find(p => p.id == panelId);
        AppState.togglePinPanel(panel || panelId);
        this.renderSectorsTable(this.panels);
    },

    renderStats(stats) {
        const grid = document.getElementById('stats-grid');
        if (!grid) return;

        const uptime = stats.uptime_percent !== undefined ? stats.uptime_percent : 100;
        const uptimeColor = uptime >= 90 ? 'var(--status-online)' :
                           uptime >= 60 ? 'var(--status-warning)' : 'var(--status-offline)';

        grid.innerHTML = `
            <div class="stat-card" style="--stat-color: var(--theme-primary); --stat-bg: rgba(0, 196, 191, 0.12);">
                <div>
                    <div class="stat-value" style="color: var(--theme-primary);">${stats.total_links || 0}</div>
                    <div class="stat-label">Aplicações Monitoradas</div>
                </div>
                <div class="stat-icon" style="background: rgba(0, 196, 191, 0.15); color: var(--theme-primary);">
                    <i class="ri-apps-line"></i>
                </div>
            </div>

            <div class="stat-card" style="--stat-color: var(--status-online); --stat-bg: var(--status-online-bg);">
                <div>
                    <div class="stat-value" style="color: var(--status-online);">${stats.links_online || 0}</div>
                    <div class="stat-label">Sistemas Online</div>
                </div>
                <div class="stat-icon" style="background: var(--status-online-bg); color: var(--status-online);">
                    <i class="ri-check-double-line"></i>
                </div>
            </div>

            <div class="stat-card" style="--stat-color: ${(stats.links_offline || 0) > 0 ? 'var(--status-offline)' : 'var(--text-muted)'}; --stat-bg: ${(stats.links_offline || 0) > 0 ? 'var(--status-offline-bg)' : 'rgba(255,255,255,0.03)'};">
                <div>
                    <div class="stat-value" style="color: ${(stats.links_offline || 0) > 0 ? 'var(--status-offline)' : 'var(--text-primary)'};">${stats.links_offline || 0}</div>
                    <div class="stat-label">${(stats.links_offline || 0) > 0 ? 'Sistemas Indisponíveis' : 'Sem Falhas Registradas'}</div>
                </div>
                <div class="stat-icon" style="background: ${(stats.links_offline || 0) > 0 ? 'var(--status-offline-bg)' : 'rgba(255,255,255,0.05)'}; color: ${(stats.links_offline || 0) > 0 ? 'var(--status-offline)' : 'var(--text-muted)'};">
                    <i class="ri-alert-line"></i>
                </div>
            </div>

            <div class="stat-card" style="--stat-color: ${uptimeColor}; --stat-bg: rgba(16, 185, 129, 0.12);">
                <div>
                    <div class="stat-value" style="color: ${uptimeColor};">${uptime}%</div>
                    <div class="stat-label">Disponibilidade Global</div>
                </div>
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: ${uptimeColor};">
                    <i class="ri-speed-line"></i>
                </div>
            </div>
        `;
    },

    renderIncidents(panels) {
        const container = document.getElementById('dashboard-incidents-section');
        if (!container) return;

        const allLinks = [];
        panels.forEach(p => {
            (p.links || []).forEach(l => {
                allLinks.push({ ...l, panelTitle: p.title, panelColor: p.color });
            });
        });

        const offlineLinks = allLinks.filter(l => l.health_status === 'offline');

        if (offlineLinks.length === 0) {
            container.innerHTML = `
                <div class="card" style="margin: 0; padding: 16px 20px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-left: 4px solid var(--status-online); border-radius: var(--radius);">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--status-online); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                <i class="ri-shield-check-line"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">Todos os Sistemas Operacionais</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">100% dos serviços corporativos monitorados estão respondendo normalmente com alta disponibilidade.</div>
                            </div>
                        </div>
                        <span class="health-badge online">
                            <span class="health-dot"></span> Infraestrutura Estável
                        </span>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="card" style="margin: 0; padding: 18px 20px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-left: 4px solid var(--status-offline); border-radius: var(--radius);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px; color: var(--status-offline); font-weight: 600; font-size: 0.95rem;">
                            <i class="ri-error-warning-line" style="font-size: 1.2rem;"></i>
                            <span>${offlineLinks.length} Incidente(s) de Conectividade Detectado(s)</span>
                        </div>
                        <span class="badge" style="background: rgba(239, 68, 68, 0.2); color: var(--status-offline);">Atenção Operacional</span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${offlineLinks.map(l => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.85rem;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span class="health-dot" style="background: var(--status-offline); width: 8px; height: 8px; border-radius: 50%;"></span>
                                    <strong style="color: var(--text-primary);">${l.title}</strong>
                                    <span style="color: var(--text-muted); font-size: 0.78rem;">(${l.panelTitle})</span>
                                    <span style="color: var(--text-muted); font-size: 0.75rem;">${l.url}</span>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="font-size: 0.75rem; padding: 2px 8px;">
                                        Testar Link <i class="ri-external-link-line"></i>
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    },

    renderQuickAccess(panels) {
        const container = document.getElementById('quick-access-grid');
        if (!container) return;

        // Pega até 8 links prioritários
        const priorityLinks = [];
        panels.forEach(p => {
            (p.links || []).forEach(l => {
                priorityLinks.push({ ...l, panelTitle: p.title, panelColor: p.color || 'var(--theme-primary)' });
            });
        });

        const selected = priorityLinks.slice(0, 8);

        if (selected.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>Nenhum sistema cadastrado.</p></div>`;
            return;
        }

        container.innerHTML = selected.map(link => `
            <div class="card" onclick="window.open('${link.url}', '_blank', 'noopener,noreferrer')" style="margin: 0; padding: 14px 16px; background: var(--bg-card); border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid ${link.panelColor}; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;" title="Acessar ${link.title} em nova aba">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: ${link.panelColor}18; color: ${link.panelColor}; display: flex; align-items: center; justify-content: center;">
                                ${this.renderIcon(link.icon, 'ri-global-line')}
                            </div>
                            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary); word-break: break-word;">
                                ${link.title}
                            </div>
                        </div>
                        <span class="health-badge ${link.health_status || 'unknown'}" style="font-size: 0.7rem; padding: 2px 6px;">
                            <span class="health-dot"></span>
                            ${link.health_status === 'online' ? 'Online' : (link.health_status === 'offline' ? 'Offline' : 'Status')}
                        </span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); word-break: break-all; margin-bottom: 12px;">
                        ${link.panelTitle} · ${link.url}
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border-color); font-size: 0.78rem;">
                    <span style="color: var(--text-secondary);">${link.response_time_ms ? `${link.response_time_ms}ms` : 'Disponível'}</span>
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="btn btn-secondary btn-sm" style="padding: 3px 10px; font-size: 0.75rem;">
                        Acessar <i class="ri-arrow-right-up-line"></i>
                    </a>
                </div>
            </div>
        `).join('');
    },

    renderSectorsTable(panels) {
        const container = document.getElementById('sectors-health-table');
        if (!container) return;

        if (panels.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Nenhum setor cadastrado.</p></div>`;
            return;
        }

        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table class="table" style="width: 100%; text-align: left; font-size: 0.85rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                            <th style="padding: 10px 12px;">Setor / Painel</th>
                            <th style="padding: 10px 12px;">Total de Sistemas</th>
                            <th style="padding: 10px 12px;">Online</th>
                            <th style="padding: 10px 12px;">Offline / Falha</th>
                            <th style="padding: 10px 12px; width: 180px;">Disponibilidade</th>
                            <th style="padding: 10px 12px; text-align: right;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${panels.map(p => {
                            const total = (p.links || []).length;
                            const online = (p.links || []).filter(l => l.health_status === 'online').length;
                            const offline = (p.links || []).filter(l => l.health_status === 'offline').length;
                            const pct = total > 0 ? Math.round((online / total) * 100) : 100;
                            const pctColor = pct >= 90 ? 'var(--status-online)' : (pct >= 50 ? 'var(--status-warning)' : 'var(--status-offline)');

                            return `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 28px; height: 28px; border-radius: var(--radius-sm); background: ${p.color || 'var(--theme-primary)'}20; color: ${p.color || 'var(--theme-primary)'}; display: flex; align-items: center; justify-content: center;">
                                            <i class="${p.icon || 'ri-folder-line'}"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight: 600; color: var(--text-primary);">${p.title}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.description || ''}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 12px; font-weight: 500;">${total} aplicações</td>
                                <td style="padding: 12px; color: var(--status-online); font-weight: 600;">${online}</td>
                                <td style="padding: 12px; color: ${offline > 0 ? 'var(--status-offline)' : 'var(--text-muted)'}; font-weight: ${offline > 0 ? '600' : 'normal'};">${offline}</td>
                                <td style="padding: 12px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="flex: 1; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                                            <div style="width: ${pct}%; height: 100%; background: ${pctColor}; border-radius: 3px;"></div>
                                        </div>
                                        <span style="font-size: 0.75rem; color: ${pctColor}; font-weight: 600;">${pct}%</span>
                                    </div>
                                </td>
                                <td style="padding: 12px; text-align: right; white-space: nowrap;">
                                    <button class="btn-pin-panel ${AppState.isPanelPinned(p.id) ? 'pinned' : ''}" 
                                            onclick="Dashboard.togglePin(${p.id}, event)" 
                                            title="${AppState.isPanelPinned(p.id) ? 'Desafixar da barra lateral' : 'Fixar na barra lateral'}"
                                            style="width: 28px; height: 28px; font-size: 0.85rem; margin-right: 6px;">
                                        <i class="${AppState.isPanelPinned(p.id) ? 'ri-pushpin-fill' : 'ri-pushpin-line'}"></i>
                                    </button>
                                    <button class="btn btn-ghost btn-sm" onclick="Router.navigate('#/panels/${p.id}')" title="Acessar painel de ${p.title}" style="color: var(--theme-primary); font-size: 0.78rem;">
                                        Explorar <i class="ri-arrow-right-line"></i>
                                    </button>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
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
            <div class="card" style="height: 110px; padding: 14px;">
                <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 14px; width: 90%; margin-bottom: 12px;"></div>
                <div class="skeleton" style="height: 24px; width: 40%;"></div>
            </div>
        `).join('');
    },

    renderIcon(icon, defaultIcon = 'ri-global-line') {
        if (!icon) icon = defaultIcon;
        if (icon.startsWith('/') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image/')) {
            return `<img src="${icon}" class="app-icon-img" alt="" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline-block';" /><i class="${defaultIcon}" style="display: none;"></i>`;
        }
        return `<i class="${icon}"></i>`;
    }
};
