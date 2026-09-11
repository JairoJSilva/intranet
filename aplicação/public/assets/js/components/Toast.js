/**
 * Omniflowti — Toast Notification System
 * Notificações empilháveis com auto-dismiss e animações.
 */
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem a exibir
     * @param {string} type - 'success' | 'error' | 'warning' | 'info'
     * @param {number} duration - Duração em ms (0 = manual dismiss)
     */
    show(message, type = 'info', duration = 4000) {
        this.init();

        const icons = {
            success: 'ri-check-line',
            error: 'ri-close-circle-line',
            warning: 'ri-alert-line',
            info: 'ri-information-line',
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="toast-icon ${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="Toast.dismiss(this.parentElement)">
                <i class="ri-close-line"></i>
            </button>
        `;

        this.container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    /**
     * Fecha um toast com animação
     */
    dismiss(toastElement) {
        if (!toastElement || toastElement.classList.contains('toast-exit')) return;

        toastElement.classList.add('toast-exit');
        setTimeout(() => toastElement.remove(), 300);
    },

    // Atalhos
    success(msg, dur) { return this.show(msg, 'success', dur); },
    error(msg, dur)   { return this.show(msg, 'error', dur); },
    warning(msg, dur) { return this.show(msg, 'warning', dur); },
    info(msg, dur)    { return this.show(msg, 'info', dur); },
};
