/**
 * Portal Unificado — Modal Component
 * Modal genérico reutilizável com backdrop blur e animações.
 */
const Modal = {
    /**
     * Abre um modal
     * @param {Object} options - { title, content, footer, onClose, size }
     */
    open({ title = '', content = '', footer = '', onClose = null, size = 'md' }) {
        this.close(); // Fecha qualquer modal aberto

        const sizeClass = size === 'lg' ? 'max-width: 720px' : size === 'sm' ? 'max-width: 400px' : '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content" style="${sizeClass}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" id="modal-close-btn">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
                <div class="modal-body" id="modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        document.body.appendChild(overlay);

        // Fecha ao clicar no backdrop
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close(onClose);
        });

        // Botão fechar
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            this.close(onClose);
        });

        // ESC para fechar
        this._escHandler = (e) => {
            if (e.key === 'Escape') this.close(onClose);
        };
        document.addEventListener('keydown', this._escHandler);

        return overlay;
    },

    /**
     * Fecha o modal aberto
     */
    close(onClose = null) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.remove();
        }

        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }

        if (typeof onClose === 'function') {
            onClose();
        }
    },

    /**
     * Modal de confirmação
     */
    confirm({ title = 'Confirmar', message = 'Tem certeza?', confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) {
        return new Promise((resolve) => {
            const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

            this.open({
                title,
                content: `<p style="color: var(--text-secondary); font-size: 0.9rem;">${message}</p>`,
                footer: `
                    <button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
                    <button class="btn ${btnClass}" id="modal-confirm">${confirmText}</button>
                `,
            });

            document.getElementById('modal-cancel').addEventListener('click', () => {
                this.close();
                resolve(false);
            });

            document.getElementById('modal-confirm').addEventListener('click', () => {
                this.close();
                resolve(true);
            });
        });
    },
};
