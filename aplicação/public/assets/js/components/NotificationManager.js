/**
 * Omniflowti — NotificationManager
 * Gerenciador de Alertas Operacionais no Navegador com suporte à Web Notifications API nativa,
 * central de incidentes em tempo real e popover integrado na Topbar.
 */
const NotificationManager = {
    alerts: [],
    unreadCount: 0,
    popoverOpen: false,

    /**
     * Inicializa histórico de alertas e listeners
     */
    init() {
        try {
            const saved = localStorage.getItem('omniflowti_operational_alerts');
            if (saved) {
                this.alerts = JSON.parse(saved) || [];
            }
        } catch (e) {
            this.alerts = [];
        }

        // Calcula não lidos
        this.unreadCount = this.alerts.filter(a => !a.read).length;
    },

    /**
     * Solicita permissão do navegador para notificações desktop
     */
    async requestBrowserPermission() {
        if (!('Notification' in window)) {
            Toast.warning('Seu navegador não suporta a Web Notifications API.');
            return false;
        }

        if (Notification.permission === 'granted') {
            Toast.info('Notificações no navegador já estão ativadas.');
            return true;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                Toast.success('Notificações no navegador ativadas com sucesso!');
                this.showDesktopNotification('🔔 Notificações Ativadas', 'Você receberá alertas operacionais quando sistemas ficarem offline.');
                this.updatePopover();
                return true;
            } else if (permission === 'denied') {
                Toast.warning('Notificações bloqueadas no navegador. Habilite nas permissões do site.');
                this.updatePopover();
                return false;
            }
        } catch (e) {
            console.error('[NotificationManager] Erro ao solicitar permissão:', e);
        }
        return false;
    },

    /**
     * Registra um incidente operacional e dispara alerta nativo se permitido
     */
    notifyIncident(link, panelTitle = '') {
        if (!link) return;

        const isOffline = link.health_status === 'offline';
        const isWarning = link.health_status === 'warning';

        if (!isOffline && !isWarning) return;

        const incident = {
            id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            linkId: link.id,
            title: link.title || 'Sistema Corporativo',
            url: link.url || '',
            panelId: link.panel_id,
            panelTitle: panelTitle || 'Painel de Sistemas',
            status: link.health_status,
            responseTime: link.response_time_ms,
            timestamp: Date.now(),
            timeFormatted: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            read: false
        };

        // Evita duplicar o mesmo alerta do mesmo link em menos de 2 minutos
        const recentDuplicate = this.alerts.find(a => 
            a.linkId === link.id && 
            a.status === link.health_status && 
            (Date.now() - a.timestamp) < 120000
        );

        if (!recentDuplicate) {
            this.alerts.unshift(incident);
            if (this.alerts.length > 25) {
                this.alerts.pop(); // Mantém os últimos 25
            }
            this.unreadCount++;
            this.persist();
            this.updateBadge();
            if (this.popoverOpen) {
                this.updatePopover();
            }

            // Dispara Notificação Desktop se concedido
            const titlePrefix = isOffline ? '🚨 Sistema OFFLINE' : '⚠️ Alta Latência / Atenção';
            const bodyText = `O sistema "${incident.title}" em "${incident.panelTitle}" requer atenção!\nStatus: ${incident.status.toUpperCase()}`;

            this.showDesktopNotification(titlePrefix, bodyText, incident.panelId);
        }
    },

    /**
     * Dispara notificação desktop da Web Notifications API
     */
    showDesktopNotification(title, body, panelId = null) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        try {
            const notif = new Notification(title, {
                body: body,
                icon: '/assets/img/flowti-label.svg',
                badge: '/assets/img/flowti-label.svg',
                tag: 'flowti-health-alert',
                requireInteraction: false
            });

            notif.onclick = () => {
                window.focus();
                if (panelId) {
                    Router.navigate(`#/panels/${panelId}`);
                }
                notif.close();
            };
        } catch (e) {
            console.warn('[NotificationManager] Erro ao disparar notificação nativa:', e);
        }
    },

    /**
     * Alterna a abertura do menu popover de notificações
     */
    togglePopover() {
        this.popoverOpen = !this.popoverOpen;
        const popover = document.getElementById('notifications-popover');
        if (popover) {
            popover.classList.remove('hidden');
            popover.classList.toggle('open', this.popoverOpen);
            if (this.popoverOpen) {
                this.markAllRead();
                this.updatePopover();
            }
        }
    },

    closePopover() {
        this.popoverOpen = false;
        const popover = document.getElementById('notifications-popover');
        if (popover) {
            popover.classList.remove('open');
        }
    },

    /**
     * Marca todos como lidos
     */
    markAllRead() {
        this.unreadCount = 0;
        this.alerts.forEach(a => a.read = true);
        this.persist();
        this.updateBadge();
    },

    /**
     * Limpa todo o histórico de alertas
     */
    clearAll() {
        this.alerts = [];
        this.unreadCount = 0;
        this.persist();
        this.updateBadge();
        this.updatePopover();
        Toast.info('Histórico de alertas operacionais limpo.');
    },

    /**
     * Salva no localStorage
     */
    persist() {
        try {
            localStorage.setItem('omniflowti_operational_alerts', JSON.stringify(this.alerts));
        } catch (e) {
            // localStorage full
        }
    },

    /**
     * Atualiza o badge numérico no botão da Topbar
     */
    updateBadge() {
        const badge = document.getElementById('notifications-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
                badge.style.display = 'flex';
                badge.classList.add('pulse');
            } else {
                badge.style.display = 'none';
                badge.classList.remove('pulse');
            }
        }
    },

    /**
     * Renderiza o conteúdo interno do popover
     */
    renderPopoverContent() {
        const hasPermission = ('Notification' in window) && Notification.permission === 'granted';
        const isDenied = ('Notification' in window) && Notification.permission === 'denied';

        return `
        <div class="notifications-popover-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="ri-notification-3-line" style="color: var(--theme-primary); font-size: 1.1rem;"></i>
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">Alertas Operacionais</span>
            </div>
            ${this.alerts.length > 0 ? `
            <button class="btn btn-ghost btn-sm" onclick="NotificationManager.clearAll()" style="font-size: 0.75rem; padding: 2px 6px; color: var(--text-muted);">
                Limpar
            </button>
            ` : ''}
        </div>

        <!-- Banner de Permissão do Navegador -->
        <div class="notifications-perm-banner ${hasPermission ? 'granted' : (isDenied ? 'denied' : '')}">
            ${hasPermission ? `
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--status-online);">
                    <i class="ri-checkbox-circle-fill"></i>
                    <span>Notificações desktop ativas</span>
                </div>
            ` : (isDenied ? `
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--status-offline);">
                    <i class="ri-close-circle-fill"></i>
                    <span>Notificações bloqueadas no navegador</span>
                </div>
            ` : `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary);">Receber alertas no computador?</span>
                    <button class="btn btn-primary btn-sm" onclick="NotificationManager.requestBrowserPermission()" style="font-size: 0.72rem; padding: 3px 8px;">
                        Ativar
                    </button>
                </div>
            `)}
        </div>

        <div class="notifications-popover-list">
            ${this.alerts.length === 0 ? `
                <div style="text-align: center; padding: 28px 16px; color: var(--text-muted);">
                    <i class="ri-shield-check-line" style="font-size: 2.2rem; color: var(--status-online); display: block; margin-bottom: 8px;"></i>
                    <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">Nenhum alerta recente</div>
                    <div style="font-size: 0.78rem; margin-top: 2px;">Todos os sistemas estão operando dentro dos parâmetros esperados.</div>
                </div>
            ` : this.alerts.map(item => {
                const isOff = item.status === 'offline';
                return `
                <div class="notification-item ${isOff ? 'offline' : 'warning'}" onclick="Router.navigate('#/panels/${item.panelId}'); NotificationManager.closePopover();" title="Abrir painel ${item.panelTitle}">
                    <div class="notification-item-icon ${isOff ? 'offline' : 'warning'}">
                        <i class="${isOff ? 'ri-error-warning-line' : 'ri-time-line'}"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                            <strong style="font-size: 0.82rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</strong>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">${item.timeFormatted}</span>
                        </div>
                        <div style="font-size: 0.74rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${item.panelTitle} • ${item.url}
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
        `;
    },

    updatePopover() {
        const popover = document.getElementById('notifications-popover');
        if (popover) {
            popover.innerHTML = this.renderPopoverContent();
        }
    }
};

// Inicializa no carregamento do script e exporta globalmente
window.NotificationManager = NotificationManager;
NotificationManager.init();
