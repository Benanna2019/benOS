/**
 * Auth Login Component
 * 
 * Magic code login flow with InstantDB
 * Shows email input first, then code input after email is sent
 */

export default function AuthLogin({ html, state }) {
  return html`
    <style>
      auth-login {
        display: block;
      }
      
      auth-login .auth-form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 300px;
      }
      
      auth-login input {
        padding: 0.625rem;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 4px;
        font-size: 0.9375rem;
        font-family: var(--font-family-ui, sans-serif);
      }
      
      auth-login input:focus {
        outline: none;
        border-color: var(--color-accent-navy, #1e204d);
      }
      
      auth-login button {
        padding: 0.625rem 1rem;
        background: var(--color-accent-navy, #1e204d);
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        font-family: var(--font-family-ui, sans-serif);
      }
      
      auth-login button:hover {
        opacity: 0.9;
      }
      
      auth-login button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      auth-login .error {
        color: #dc3545;
        font-size: 0.875rem;
      }
      
      auth-login .info {
        color: var(--color-text-muted, #595959);
        font-size: 0.875rem;
      }
      
      auth-login .back-link {
        font-size: 0.875rem;
        color: var(--color-text-muted, #595959);
        cursor: pointer;
        text-decoration: underline;
      }
      
      auth-login [data-state="code"] {
        display: none;
      }
    </style>
    
    <div class="auth-container">
      <!-- Email Step -->
      <div data-state="email" class="auth-form">
        <input type="email" placeholder="Enter your email" data-email-input />
        <button data-send-code>Send Magic Code</button>
        <div class="error" data-error style="display: none;"></div>
      </div>
      
      <!-- Code Step -->
      <div data-state="code" class="auth-form">
        <p class="info">Check your email for a magic code</p>
        <input type="text" placeholder="Enter code" data-code-input maxlength="6" />
        <button data-verify-code>Sign In</button>
        <div class="error" data-error-code style="display: none;"></div>
        <span class="back-link" data-back>← Use different email</span>
      </div>
    </div>
    
    <script type="module">

      
      class AuthLoginElement extends HTMLElement {
        constructor() {
          super();
          this.sentEmail = null;
        }
        
        connectedCallback() {
          // DOM elements
          this.emailStep = this.querySelector('[data-state="email"]');
          this.codeStep = this.querySelector('[data-state="code"]');
          this.emailInput = this.querySelector('[data-email-input]');
          this.codeInput = this.querySelector('[data-code-input]');
          this.sendCodeBtn = this.querySelector('[data-send-code]');
          this.verifyCodeBtn = this.querySelector('[data-verify-code]');
          this.backLink = this.querySelector('[data-back]');
          this.errorEl = this.querySelector('[data-error]');
          this.errorCodeEl = this.querySelector('[data-error-code]');
          
          // Event listeners
          this.sendCodeBtn.addEventListener('click', () => this.sendCode());
          this.verifyCodeBtn.addEventListener('click', () => this.verifyCode());
          this.backLink.addEventListener('click', () => this.showEmailStep());
          
          // Enter key handlers
          this.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCode();
          });
          this.codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verifyCode();
          });
          
          // Check if already logged in
          this.checkAuth();
        }
        
        async checkAuth() {
          try {
            const user = await db.getAuth();
            if (user) {
              this.dispatchEvent(new CustomEvent('auth-success', { 
                detail: { user },
                bubbles: true 
              }));
            }
          } catch (e) {
            // Not logged in, show login form
          }
        }
        
        async sendCode() {
          const email = this.emailInput.value.trim();
          if (!email) {
            this.showError(this.errorEl, 'Please enter your email');
            return;
          }
          
          this.sendCodeBtn.disabled = true;
          this.sendCodeBtn.textContent = 'Sending...';
          this.hideError(this.errorEl);
          
          try {
            await db.auth.sendMagicCode({ email });
            this.sentEmail = email;
            this.showCodeStep();
          } catch (err) {
            this.showError(this.errorEl, err.body?.message || 'Failed to send code');
          } finally {
            this.sendCodeBtn.disabled = false;
            this.sendCodeBtn.textContent = 'Send Magic Code';
          }
        }
        
        async verifyCode() {
          const code = this.codeInput.value.trim();
          if (!code) {
            this.showError(this.errorCodeEl, 'Please enter the code');
            return;
          }
          
          this.verifyCodeBtn.disabled = true;
          this.verifyCodeBtn.textContent = 'Signing in...';
          this.hideError(this.errorCodeEl);
          
          try {
            await db.auth.signInWithMagicCode({ 
              email: this.sentEmail, 
              code 
            });
            
            const user = await db.getAuth();
            this.dispatchEvent(new CustomEvent('auth-success', { 
              detail: { user },
              bubbles: true 
            }));
          } catch (err) {
            this.showError(this.errorCodeEl, err.body?.message || 'Invalid code');
            this.codeInput.value = '';
          } finally {
            this.verifyCodeBtn.disabled = false;
            this.verifyCodeBtn.textContent = 'Sign In';
          }
        }
        
        showCodeStep() {
          this.emailStep.style.display = 'none';
          this.codeStep.style.display = 'flex';
          this.codeInput.focus();
        }
        
        showEmailStep() {
          this.codeStep.style.display = 'none';
          this.emailStep.style.display = 'flex';
          this.codeInput.value = '';
          this.sentEmail = null;
        }
        
        showError(el, message) {
          el.textContent = message;
          el.style.display = 'block';
        }
        
        hideError(el) {
          el.style.display = 'none';
        }
      }
      
      if (!customElements.get('auth-login')) {
        customElements.define('auth-login', AuthLoginElement);
      }
    </script>
  `;
}

