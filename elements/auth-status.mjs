/**
 * Auth Status Component
 * 
 * Shows current user avatar with dropdown menu
 * Includes Email, Admin Link, and Sign Out
 * Supports mode="sidebar" for inline display
 */

export default function AuthStatus({ html, state }) {
  return html`
    <style>
      auth-status {
        display: block;
        position: relative;
        font-family: var(--font-family-ui, sans-serif);
      }
      
      /* Header Mode (Default) */
      .auth-trigger {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        background: transparent;
        border: none;
        padding: 0;
      }
      
      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-accent-navy, #1e204d);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        text-transform: uppercase;
      }
      
      .auth-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: white;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        min-width: 200px;
        z-index: 1000;
        display: none;
        flex-direction: column;
        padding: 0.5rem 0;
      }
      
      .auth-dropdown.visible {
        display: flex;
      }
      
      /* Sidebar Mode */
      .sidebar-user {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        width: 100%;
        text-align: left;
      }
      
      .sidebar-info {
        flex: 1;
        min-width: 0;
      }
      
      .sidebar-email {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-main, #1a1a1a);
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .sidebar-role {
        font-size: 0.65rem;
        color: var(--color-text-muted, #595959);
        display: block;
      }
      
      .sidebar-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
      }
      
      .sidebar-btn {
        background: transparent;
        border: none;
        color: var(--color-text-muted, #595959);
        font-size: 0.75rem;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
      }
      
      /* Shared */
      .dropdown-item {
        padding: 0.5rem 1rem;
        text-decoration: none;
        color: var(--color-text-main, #1a1a1a);
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: background 0.2s;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        cursor: pointer;
      }
      
      .dropdown-item:hover {
        background: var(--background-color, #f7f7f5);
        color: var(--color-accent-navy, #1e204d);
      }
      
      .dropdown-header {
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--color-border, #e0e0e0);
        margin-bottom: 0.25rem;
      }
      
      .user-email {
        font-size: 0.75rem;
        color: var(--color-text-muted, #595959);
        font-weight: 500;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .admin-badge {
        display: inline-block;
        background: var(--color-accent-navy, #1e204d);
        color: white;
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 0.25rem;
      }
      
      .loading {
        color: var(--color-text-muted, #595959);
        font-size: 0.875rem;
      }
      
      [data-logged-out] {
        display: none;
      }
    </style>
    
    <div data-loading class="loading">Loading...</div>
    
    <!-- Logged In State -->
    <div data-logged-in style="display: none;">
      
      <!-- Header Mode -->
      <div data-mode="header" style="display: none;">
        <button class="auth-trigger" data-trigger aria-expanded="false">
          <div class="user-avatar" data-avatar></div>
        </button>
        
        <div class="auth-dropdown" data-dropdown>
          <div class="dropdown-header">
            <span class="user-email" data-email></span>
            <span class="admin-badge" data-admin-badge style="display: none;">Admin</span>
          </div>
          <a href="/admin/" class="dropdown-item" data-admin-link style="display: none;">
            <span>⚡️</span> Admin Dashboard
          </a>
          <button class="dropdown-item" data-logout>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
      
      <!-- Sidebar Mode -->
      <div data-mode="sidebar" style="display: none;">
        <div class="sidebar-user">
          <div class="user-avatar" data-avatar-sidebar style="width: 28px; height: 28px; font-size: 0.75rem;"></div>
          <div class="sidebar-info">
            <span class="sidebar-email" data-email-sidebar></span>
            <button class="sidebar-btn" data-logout-sidebar>Sign Out</button>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Logged Out State -->
    <div data-logged-out style="display: none;">
      <slot name="logged-out">
        <a href="/admin/" class="btn" style="border: none; padding: 0.5rem;">Sign In</a>
      </slot>
    </div>
    
    <script type="module">
      class AuthStatusElement extends HTMLElement {
        constructor() {
          super();
          this.user = null;
          this.mode = 'header';
        }
        
        connectedCallback() {
          this.mode = this.getAttribute('mode') || 'header';
          
          this.loadingEl = this.querySelector('[data-loading]');
          this.loggedInEl = this.querySelector('[data-logged-in]');
          this.loggedOutEl = this.querySelector('[data-logged-out]');
          
          // Elements
          this.emailEl = this.querySelector('[data-email]');
          this.emailSidebarEl = this.querySelector('[data-email-sidebar]');
          this.avatarEl = this.querySelector('[data-avatar]');
          this.avatarSidebarEl = this.querySelector('[data-avatar-sidebar]');
          
          this.adminBadge = this.querySelector('[data-admin-badge]');
          this.adminLink = this.querySelector('[data-admin-link]');
          
          // Controls
          this.triggerBtn = this.querySelector('[data-trigger]');
          this.dropdown = this.querySelector('[data-dropdown]');
          this.logoutBtns = this.querySelectorAll('[data-logout], [data-logout-sidebar]');
          
          this.logoutBtns.forEach(btn => {
            btn.addEventListener('click', () => this.logout());
          });
          
          // Dropdown toggle (only for header mode)
          if (this.triggerBtn) {
            this.triggerBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.toggleDropdown();
            });
          }
          
          // Close dropdown when clicking outside
          document.addEventListener('click', (e) => {
            if (this.dropdown && !this.contains(e.target)) {
              this.dropdown.classList.remove('visible');
              if (this.triggerBtn) this.triggerBtn.setAttribute('aria-expanded', 'false');
            }
          });
          
          // Check auth state
          this.checkAuth();
          
          // Listen for auth events from login component
          document.addEventListener('auth-success', (e) => {
            this.user = e.detail.user;
            this.render();
          });
        }
        
        toggleDropdown() {
          const isVisible = this.dropdown.classList.contains('visible');
          if (isVisible) {
            this.dropdown.classList.remove('visible');
            this.triggerBtn.setAttribute('aria-expanded', 'false');
          } else {
            this.dropdown.classList.add('visible');
            this.triggerBtn.setAttribute('aria-expanded', 'true');
          }
        }
        
        async checkAuth() {
          try {
            const user = await db.getAuth();
            this.user = user;
          } catch (e) {
            this.user = null;
          }
          this.render();
        }
        
        async logout() {
          try {
            await db.auth.signOut();
            this.user = null;
            this.render();
            this.dispatchEvent(new CustomEvent('auth-logout', { bubbles: true }));
          } catch (e) {
            console.error('Logout failed:', e);
          }
        }
        
        render() {
          this.loadingEl.style.display = 'none';
          
          if (this.user) {
            this.loggedInEl.style.display = 'block';
            this.loggedOutEl.style.display = 'none';
            
            // Show correct mode container
            const headerMode = this.querySelector('[data-mode="header"]');
            const sidebarMode = this.querySelector('[data-mode="sidebar"]');
            
            if (this.mode === 'sidebar') {
              headerMode.style.display = 'none';
              sidebarMode.style.display = 'block';
            } else {
              headerMode.style.display = 'block';
              sidebarMode.style.display = 'none';
            }
            
            const email = this.user.email;
            const initial = email.charAt(0).toUpperCase();
            
            // Update all instances
            if (this.emailEl) this.emailEl.textContent = email;
            if (this.emailSidebarEl) this.emailSidebarEl.textContent = email;
            if (this.avatarEl) this.avatarEl.textContent = initial;
            if (this.avatarSidebarEl) this.avatarSidebarEl.textContent = initial;
            
            // Check if admin (simple check, real check is DB permissions)
            const isAdmin = email === 'bass41992ben@gmail.com';
            if (this.adminBadge) this.adminBadge.style.display = isAdmin ? 'inline-block' : 'none';
            if (this.adminLink) this.adminLink.style.display = isAdmin ? 'flex' : 'none';
            
            // Set data attribute for CSS/JS targeting
            this.setAttribute('data-is-admin', isAdmin ? 'true' : 'false');
            this.setAttribute('data-user-email', email);
          } else {
            this.loggedInEl.style.display = 'none';
            this.loggedOutEl.style.display = 'block';
            this.removeAttribute('data-is-admin');
            this.removeAttribute('data-user-email');
          }
        }
      }
      
      if (!customElements.get('auth-status')) {
        customElements.define('auth-status', AuthStatusElement);
      }
    </script>
  `;
}
