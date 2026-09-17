/**
 * Flowti Hub — Login Form Component
 * Tela clássica com Glassmorphism e novo logotipo oficial do Flowti Hub.
 */
const LoginForm = {
    render() {
        return `
        <div class="login-page" id="login-page">
            <div class="login-card">
                <div style="text-align: center; margin-bottom: 28px;">
                    <img src="/assets/img/flowti-hub-logo.svg" alt="Flowti Hub" style="height: 40px; width: auto; margin-bottom: 14px; filter: drop-shadow(0 0 16px rgba(59, 130, 246, 0.45));" />
                    <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Portal Corporativo Unificado</p>
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
                                           cursor: pointer; padding: 4px;" aria-label="Alternar visibilidade da senha">
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

                <div id="sso-container"></div>

                <p style="text-align: center; margin-top: 24px; font-size: 0.75rem; color: var(--text-muted);">
                    Autenticação via SSO Corporativo, Active Directory ou conta local
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
                card?.classList.add('shake');
                setTimeout(() => card?.classList.remove('shake'), 500);

            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ri-login-box-line"></i> Entrar';
            }
        });

        // Check for SSO error in URL query
        const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const searchParams = new URLSearchParams(window.location.search || hashQuery);
        const ssoError = searchParams.get('sso_error');
        if (ssoError && errorText && errorDiv) {
            errorText.textContent = decodeURIComponent(ssoError);
            errorDiv.classList.remove('hidden');
        }

        // Load SSO configuration dynamically
        const ssoContainer = document.getElementById('sso-container');
        if (ssoContainer) {
            API.getSsoConfig().then(res => {
                if (res.success && res.data && res.data.enabled) {
                    const provider = (res.data.provider || 'sso').toLowerCase();
                    let iconClass = 'ri-shield-user-line';
                    if (provider.includes('azure') || provider.includes('entra') || provider.includes('microsoft')) {
                        iconClass = 'ri-windows-fill';
                    } else if (provider.includes('keycloak')) {
                        iconClass = 'ri-shield-keyhole-line';
                    } else if (provider.includes('google')) {
                        iconClass = 'ri-google-fill';
                    } else if (provider.includes('okta')) {
                        iconClass = 'ri-lock-password-line';
                    }

                    ssoContainer.innerHTML = `
                        <div class="sso-divider">
                            <span>ou continue com</span>
                        </div>
                        <a href="/api/auth/sso/redirect" class="btn btn-secondary btn-block btn-lg sso-btn" id="sso-login-btn">
                            <i class="${iconClass}"></i> ${res.data.button_label || res.data.button_text || ('Entrar com ' + (res.data.provider_name || 'SSO Corporativo'))}
                        </a>
                    `;
                }
            }).catch(err => {
                console.debug('SSO não ativado:', err.message);
            });
        }
    }
};
