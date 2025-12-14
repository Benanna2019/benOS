/**
 * Newsletter Form Component
 * 
 * ConvertKit email subscription form
 * Can be placed in footer, sidebar, or dedicated subscribe page
 */

export default function NewsletterForm({ html, state }) {
  return html`
    <style>
      newsletter-form {
        display: block;
      }
      
      .newsletter-container {
        padding: 2rem;
        background: var(--background-color, #f7f7f5);
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 8px;
        text-align: center;
      }
      
      .newsletter-title {
        font-family: var(--font-family-headings, serif);
        font-size: 1.5rem;
        margin: 0 0 0.5rem;
        color: var(--color-text-main, #1a1a1a);
      }
      
      .newsletter-description {
        color: var(--color-text-muted, #595959);
        margin: 0 0 1.5rem;
        font-size: 0.9375rem;
        line-height: 1.5;
      }
      
      .newsletter-form {
        display: flex;
        gap: 0.75rem;
        max-width: 400px;
        margin: 0 auto;
      }
      
      .newsletter-form input[type="email"] {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 4px;
        font-size: 0.9375rem;
        font-family: var(--font-family-ui, sans-serif);
      }
      
      .newsletter-form input[type="email"]:focus {
        outline: none;
        border-color: var(--color-accent-navy, #1e204d);
      }
      
      .newsletter-form button {
        padding: 0.75rem 1.5rem;
        background: var(--color-accent-navy, #1e204d);
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        font-family: var(--font-family-ui, sans-serif);
        transition: opacity 0.2s;
      }
      
      .newsletter-form button:hover {
        opacity: 0.9;
      }
      
      .newsletter-form button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .newsletter-success {
        padding: 1rem;
        background: #d4edda;
        color: #155724;
        border-radius: 4px;
        display: none;
      }
      
      .newsletter-error {
        padding: 1rem;
        background: #f8d7da;
        color: #721c24;
        border-radius: 4px;
        margin-top: 1rem;
        display: none;
      }
      
      .newsletter-privacy {
        font-size: 0.75rem;
        color: var(--color-text-muted, #595959);
        margin-top: 1rem;
      }
      
      /* Compact variant for footer/sidebar */
      .newsletter-container.compact {
        padding: 1.5rem;
        text-align: left;
      }
      
      .newsletter-container.compact .newsletter-title {
        font-size: 1.25rem;
      }
      
      .newsletter-container.compact .newsletter-description {
        font-size: 0.875rem;
        margin-bottom: 1rem;
      }
      
      .newsletter-container.compact .newsletter-form {
        flex-direction: column;
      }
    </style>
    
    <div class="newsletter-container">
      <h3 class="newsletter-title">Join the Newsletter</h3>
      <p class="newsletter-description">
        Get insights on personal development, technology, and finding renewed purpose in your work.
      </p>
      
      <form class="newsletter-form" data-form>
        <input 
          type="email" 
          name="email" 
          placeholder="Enter your email" 
          required 
          data-email
        />
        <button type="submit" data-submit>Subscribe</button>
      </form>
      
      <div class="newsletter-success" data-success>
        🎉 Thanks for subscribing! Check your email to confirm.
      </div>
      
      <div class="newsletter-error" data-error></div>
      
      <p class="newsletter-privacy">
        No spam, unsubscribe anytime. We respect your privacy.
      </p>
    </div>
    
    <script type="module">
      class NewsletterFormElement extends HTMLElement {
        constructor() {
          super();
          // Get ConvertKit form ID from attribute or use default
          this.formId = this.getAttribute('form-id') || '';
        }
        
        connectedCallback() {
          this.form = this.querySelector('[data-form]');
          this.emailInput = this.querySelector('[data-email]');
          this.submitBtn = this.querySelector('[data-submit]');
          this.successEl = this.querySelector('[data-success]');
          this.errorEl = this.querySelector('[data-error]');
          
          // Apply compact variant if specified
          if (this.hasAttribute('compact')) {
            this.querySelector('.newsletter-container').classList.add('compact');
          }
          
          this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        async handleSubmit(e) {
          e.preventDefault();
          
          const email = this.emailInput.value.trim();
          if (!email) return;
          
          this.submitBtn.disabled = true;
          this.submitBtn.textContent = 'Subscribing...';
          this.errorEl.style.display = 'none';
          
          try {
            // ConvertKit form submission
            // Replace FORM_ID with your actual ConvertKit form ID
            const FORM_ID = this.formId || 'YOUR_CONVERTKIT_FORM_ID';
            
            const response = await fetch(\`https://api.convertkit.com/v3/forms/\${FORM_ID}/subscribe\`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                api_key: 'YOUR_CONVERTKIT_API_KEY', // Replace with your API key
                email: email,
              }),
            });
            
            if (!response.ok) {
              throw new Error('Subscription failed');
            }
            
            // Show success
            this.form.style.display = 'none';
            this.successEl.style.display = 'block';
            
            // Track conversion
            this.dispatchEvent(new CustomEvent('newsletter-subscribed', {
              detail: { email },
              bubbles: true
            }));
            
          } catch (error) {
            console.error('Newsletter subscription failed:', error);
            this.errorEl.textContent = 'Something went wrong. Please try again.';
            this.errorEl.style.display = 'block';
          } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Subscribe';
          }
        }
      }
      
      if (!customElements.get('newsletter-form')) {
        customElements.define('newsletter-form', NewsletterFormElement);
      }
    </script>
  `;
}

