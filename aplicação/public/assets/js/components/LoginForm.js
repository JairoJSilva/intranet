/**
 * Intranet Flowti — Login Form Component
 */
const LoginForm = {
    render() {
        return `
        <div class="login-page" id="login-page">
            <div class="login-card">
                <div class="login-logo">
                    <i class="ri-global-line" style="font-size: 3rem; color: var(--vem-blue-500); display: block; margin-bottom: 12px;"></i>
                    <h1>Intranet Flowti</h1>
                    <p>Portal Unificado Corporativo</p>
                </div>

                <form id="login-form" autocomplete="off">
                    <div class="form-group">
                        <label class="form-label" for="login-username">
                            <i class="ri-user-3-line"></i> Usuário
                        </label>
                        <input type="text" id="login-username" class="form-input" 
                               placeholder="Digite seu usuário" required autofocus />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="login-password">
                            <i class="ri-lock-2-line"></i> Senha
                        </label>
                        <div style="position: relative;">
                            <input type="password" id="login-password" class="form-input"
                                   placeholder="Digite sua senha" required />
                            <button type="button" id="toggle-password" 
                                    style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                                           background: none; border: none; color: var(--text-muted); 
                                           cursor: pointer; padding: 4px;">
                                <i class="ri-eye-off-line"></i>
                            </button>
                        </div>
                    </div>

                    <div id="login-error" class="hidden" style="
                        background: var(--status-offline-bg); 
                        border: 1px solid rgba(239,68,68,0.2);
                        border-radius: var(--radius-sm); 
                        padding: 10px 14px; 
                        margin-bottom: 16px;
                        color: var(--status-offline); 
                        font-size: 0.85rem;
                        display: flex; align-items: center; gap: 8px;">
                        <i class="ri-error-warning-line"></i>
                        <span id="login-error-text"></span>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-submit">
                        <i class="ri-login-box-line"></i> Entrar
                    </button>
                </form>

                <p style="text-align: center; margin-top: 24px; font-size: 0.75rem; color: var(--text-muted);">
                    Autenticação via Active Directory ou conta local
                </p>
            </div>
        </div>`;
    },

    initEvents() {
        const form = document.getElementById('login-form');
        const errorDiv = document.getElementById('login-error');
        const errorText = document.getElementById('login-error-text');
        const submitBtn = document.getElementById('login-submit');
        const togglePwd = document.getElementById('toggle-password');

        // Toggle password visibility
        togglePwd?.addEventListener('click', () => {
            const pwdInput = document.getElementById('login-password');
            const icon = togglePwd.querySelector('i');
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                icon.className = 'ri-eye-line';
            } else {
                pwdInput.type = 'password';
                icon.className = 'ri-eye-off-line';
            }
        });

        // Form submit
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.classList.add('hidden');

            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            if (!username || !password) {
                errorText.textContent = 'Preencha usuário e senha.';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Autenticando...';

            try {
                const result = await API.login(username, password);
                
                AppState.set('user', result.data);
                Toast.success(`Bem-vindo, ${result.data.display_name}!`);
                Router.navigate('#/dashboard');

            } catch (err) {
                errorText.textContent = err.message || 'Credenciais inválidas.';
                errorDiv.classList.remove('hidden');

                // Shake animation
                const card = document.querySelector('.login-card');
                card.classList.add('shake');
                setTimeout(() => card.classList.remove('shake'), 500);

            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ri-login-box-line"></i> Entrar';
            }
        });
    }
};
