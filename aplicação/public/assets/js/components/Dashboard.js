/**
 * Portal Unificado — Dashboard Executivo & Observabilidade
 * Visão operacional executiva com métricas de disponibilidade,
 * central de incidentes, sistemas críticos e resumo consolidado por setor.
 */
const Dashboard = {
    stats: null,
    panels: [],

    async render() {
        const now = new Date();
        const hour = now.getHours();
        const greeting = hour < 12 ? '☀️ Bom dia' : hour < 18 ? '☁️ Boa tarde' : '🌙 Boa noite';
        const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

        return `
        <style>
            .bento-grid {
                display: grid;
                grid-template-columns: repeat(12, 1fr);
                grid-auto-rows: minmax(60px, auto);
                gap: 14px;
                margin-bottom: 28px;
            }
            .bento-cell {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                padding: 20px;
                transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
                overflow: hidden;
                position: relative;
            }
            .bento-cell:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
                border-color: rgba(255, 255, 255, 0.12);
            }
            .bento-hero {
                grid-column: span 8;
                background: linear-gradient(135deg, rgba(171, 23, 238, 0.14) 0%, rgba(0, 196, 191, 0.1) 60%, transparent 100%);
                border-color: rgba(171, 23, 238, 0.25);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                min-height: 140px;
            }
            .bento-hero::before {
                content: '';
                position: absolute;
                top: -40px;
                right: -40px;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(171, 23, 238, 0.12) 0%, transparent 70%);
                pointer-events: none;
            }
            .bento-uptime {
                grid-column: span 4;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(0, 196, 191, 0.08));
                border-color: rgba(16, 185, 129, 0.3);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                min-height: 140px;
            }
            .bento-kpi {
                grid-column: span 3;
                min-height: 100px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .bento-incidents {
                grid-column: span 12;
            }
            .bento-quick-label {
                grid-column: span 12;
                padding: 0;
                background: transparent;
                border: none;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .bento-link-card {
                grid-column: span 3;
                min-height: 108px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                cursor: pointer;
                padding: 16px;
            }
            .bento-sectors {
                grid-column: span 12;
            }
            .bento-uptime-ring {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.4rem;
                font-weight: 800;
                background: conic-gradient(var(--status-online) 0%, transparent 0%);
                position: relative;
                margin-bottom: 8px;
            }
            .bento-uptime-ring-inner {
                position: absolute;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--bg-card);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
                font-weight: 800;
            }
            .bento-kpi-value {
                font-size: 2rem;
                font-weight: 800;
                line-height: 1;
                letter-spacing: -1px;
            }
            .bento-kpi-label {
                font-size: 0.75rem;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 4px;
            }
            .bento-kpi-icon {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
                margin-bottom: 12px;
            }
            .bento-link-card:hover {
                border-color: var(--theme-primary) !important;
                box-shadow: 0 0 0 1px var(--theme-primary), 0 8px 24px rgba(0,0,0,0.25);
            }
            @media (max-width: 1024px) {
                .bento-hero { grid-column: span 12; }
                .bento-uptime { grid-column: span 12; flex-direction: row; gap: 20px; justify-content: flex-start; }
                .bento-kpi { grid-column: span 6; }
                .bento-link-card { grid-column: span 6; }
            }
            @media (max-width: 640px) {
                .bento-kpi { grid-column: span 12; }
                .bento-link-card { grid-column: span 12; }
            }
        </style>

        <!-- Header compacto -->
        <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
                <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: capitalize; margin-bottom: 2px;">${dateStr}</div>
                <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, var(--text-primary), var(--theme-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    ${greeting}, Portal Unificado
                </h2>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-dashboard-healthcheck" style="border-radius: 10px; padding: 8px 16px;">
                <i class="ri-pulse-line"></i> Checar Sistemas
            </button>
        </div>

        <!-- BENTO GRID -->
        <div class="bento-grid">

            <!-- Hero: Resumo da infraestrutura -->
            <div class="bento-cell bento-hero">
                <div>
                    <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--theme-primary); font-weight: 600; margin-bottom: 6px;">Status Operacional</div>
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Infraestrutura Corporativa</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">Monitoramento em tempo real de disponibilidade e latência de todos os sistemas cadastrados</div>
                </div>
                <div id="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 16px;">
                    ${this.renderSkeletons(4, 'stat')}
                </div>
            </div>

            <!-- Uptime Global -->
            <div class="bento-cell bento-uptime" id="bento-uptime-cell">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--status-online) 360deg, var(--border-color) 0deg); display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 12px; box-shadow: 0 0 24px rgba(16, 185, 129, 0.25);">
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-card); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 1rem; font-weight: 800; color: var(--status-online);" id="bento-uptime-pct">—</span>
                    </div>
                </div>
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">Disponibilidade Global</div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Últimas 24h</div>
            </div>

            <!-- Incidentes (linha inteira) -->
            <div class="bento-cell bento-incidents" id="dashboard-incidents-section" style="padding: 0; border: none; background: transparent;">
                <div class="skeleton" style="height: 72px; border-radius: 16px;"></div>
            </div>

            <!-- Label Acesso Rápido -->
            <div class="bento-cell bento-quick-label">
                <div>
                    <h4 style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-primary);">⚡ Acesso Rápido</h4>
                    <p style="font-size: 0.78rem; color: var(--text-muted); margin: 2px 0 0;">Sistemas prioritários com status ao vivo</p>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('#/panels')" style="color: var(--theme-primary); font-size: 0.8rem; border-radius: 8px;">
                    Ver todos os painéis <i class="ri-arrow-right-line"></i>
                </button>
            </div>

            <!-- Grid de links rápidos (placeholder, preenchido por renderQuickAccess) -->
            <div id="quick-access-bento-wrapper" style="grid-column: span 12; display: contents;">
                ${this.renderSkeletons(8, 'quick')}
            </div>

            <!-- Visão por Setor -->
            <div class="bento-cell bento-sectors">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div>
                        <h4 style="font-size: 1rem; font-weight: 700; margin: 0;">🗂 Visão por Setor</h4>
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0;">Índice de saúde e distribuição de serviços</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="Router.navigate('#/panels')" style="font-size: 0.75rem; border-radius: 8px;">
                        <i class="ri-layout-grid-line"></i> Explorar Painéis
                    </button>
                </div>
                <div id="sectors-health-table">
                    <div class="skeleton" style="height: 140px; border-radius: 10px;"></div>
                </div>
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

        // Atualiza o ring de uptime no bento-uptime-cell
        const uptimePct = document.getElementById('bento-uptime-pct');
        if (uptimePct) {
            uptimePct.textContent = uptime + '%';
            uptimePct.style.color = uptimeColor;
            const ring = uptimePct.closest('[id="bento-uptime-cell"]')?.querySelector('div[style*="conic-gradient"]');
            if (ring) {
                const deg = Math.round((uptime / 100) * 360);
                ring.style.background = `conic-gradient(${uptimeColor} ${deg}deg, var(--border-color) ${deg}deg)`;
                ring.style.boxShadow = `0 0 24px ${uptimeColor}40`;
            }
        }

        // KPIs compactos dentro do hero bento
        grid.innerHTML = `
            <div style="background: rgba(0,196,191,0.1); border: 1px solid rgba(0,196,191,0.2); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 1.8rem; font-weight: 800; color: var(--theme-primary); line-height: 1;">${stats.total_links || 0}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Aplicações</div>
                <div style="font-size: 0.85rem; color: var(--theme-primary); margin-top: 4px;"><i class="ri-apps-line"></i></div>
            </div>

            <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 1.8rem; font-weight: 800; color: var(--status-online); line-height: 1;">${stats.links_online || 0}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Online</div>
                <div style="font-size: 0.85rem; color: var(--status-online); margin-top: 4px;"><i class="ri-check-double-line"></i></div>
            </div>

            <div style="background: ${(stats.links_offline || 0) > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${(stats.links_offline || 0) > 0 ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 1.8rem; font-weight: 800; color: ${(stats.links_offline || 0) > 0 ? 'var(--status-offline)' : 'var(--text-secondary)'}; line-height: 1;">${stats.links_offline || 0}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">${(stats.links_offline || 0) > 0 ? 'Offline' : 'Sem Falhas'}</div>
                <div style="font-size: 0.85rem; color: ${(stats.links_offline || 0) > 0 ? 'var(--status-offline)' : 'var(--text-muted)'}; margin-top: 4px;"><i class="ri-alert-line"></i></div>
            </div>

            <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 2px;">
                <div style="font-size: 1.8rem; font-weight: 800; color: ${uptimeColor}; line-height: 1;">${uptime}%</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">SLA</div>
                <div style="font-size: 0.85rem; color: ${uptimeColor}; margin-top: 4px;"><i class="ri-speed-line"></i></div>
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
        const wrapper = document.getElementById('quick-access-bento-wrapper');
        if (!wrapper) return;

        // Pega até 8 links prioritários
        const priorityLinks = [];
        panels.forEach(p => {
            (p.links || []).forEach(l => {
                priorityLinks.push({ ...l, panelTitle: p.title, panelColor: p.color || 'var(--theme-primary)' });
            });
        });

        const selected = priorityLinks.slice(0, 8);

        if (selected.length === 0) {
            wrapper.innerHTML = `<div class="bento-cell" style="grid-column: span 12;"><div class="empty-state"><p>Nenhum sistema cadastrado.</p></div></div>`;
            return;
        }

        // Renderiza como bento-cards individuais (display: contents no wrapper)
        wrapper.innerHTML = selected.map((link, idx) => {
            // Alterna tamanhos: primeiro card ocupa 4 colunas, demais 3, para variar visualmente
            const span = idx === 0 ? 4 : 3;
            const statusColor = link.health_status === 'online' ? 'var(--status-online)' :
                               link.health_status === 'offline' ? 'var(--status-offline)' : 'var(--text-muted)';
            return `
            <div class="bento-cell bento-link-card"
                 style="grid-column: span ${span}; border-left: 3px solid ${link.panelColor};"
                 onclick="window.open('${link.url}', '_blank', 'noopener,noreferrer')"
                 title="Acessar ${link.title}">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: ${link.panelColor}20; color: ${link.panelColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.05rem;">
                            ${this.renderIcon(link.icon, 'ri-global-line')}
                        </div>
                        <div style="min-width: 0;">
                            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${link.title}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${link.panelTitle}</div>
                        </div>
                    </div>
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; margin-top: 4px; flex-shrink: 0; box-shadow: 0 0 6px ${statusColor};"></div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border-color); margin-top: 10px;">
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${link.response_time_ms ? link.response_time_ms + 'ms' : '—'}</span>
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()"
                       style="font-size: 0.72rem; color: ${link.panelColor}; font-weight: 600; display: flex; align-items: center; gap: 3px; text-decoration: none;">
                        Abrir <i class="ri-arrow-right-up-line"></i>
                    </a>
                </div>
            </div>
            `;
        }).join('');
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
