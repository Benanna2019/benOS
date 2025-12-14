/**
 * Simple Progressive Enhancement Example: Theme Toggle
 * 
 * Shows how to:
 * 1. Use @enhance/element for reactivity
 * 2. Track attributes with automatic re-rendering
 * 3. Integrate with @enhance/store (optional)
 */

export default function ThemeToggle({ html, state }) {
  const { theme = 'light' } = state
  
  return html`
    <style>
      theme-toggle {
        display: inline-block;
      }
      
      theme-toggle button {
        padding: 0.5rem 1rem;
        border: 2px solid #333;
        border-radius: 4px;
        background: ${theme === 'dark' ? '#333' : '#fff'};
        color: ${theme === 'dark' ? '#fff' : '#333'};
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s;
      }
      
      theme-toggle button:hover {
        transform: scale(1.05);
      }
    </style>
    
    <button class="theme-btn">
      ${theme === 'dark' ? '☀️' : '🌙'} 
      ${theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
    
    <script type="module">
      import enhance from 'https://unpkg.com/@enhance/element@1.4.2/dist/index.js?module=true'
      
      enhance('theme-toggle', {
        // Track the 'theme' attribute - element auto-updates when it changes!
        attrs: ['theme'],
        
        // Optionally integrate with @enhance/store
        // If you pass a store, this element will react to store changes
        // keys: ['theme'],
        
        init(el) {
          console.log('Theme toggle initialized with theme:', el.getAttribute('theme') || 'light')
        },
        
        // Render function - automatically called when tracked attributes change
        render({ html, state }) {
          const { attrs = {} } = state
          const { theme = 'light' } = attrs
          const isDark = theme === 'dark'
          const emoji = isDark ? '☀️' : '🌙'
          const label = isDark ? 'Light' : 'Dark'
          
          return '<button class="theme-btn">' + emoji + ' ' + label + ' Mode</button>'
        },
        
        connected(el) {
          // Add click handler
          el.querySelector('.theme-btn').addEventListener('click', () => {
            const currentTheme = el.getAttribute('theme') || 'light'
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
            
            // Updating the attribute automatically triggers re-render!
            el.setAttribute('theme', newTheme)
            
            // Optionally: emit custom event for other components
            el.dispatchEvent(new CustomEvent('theme-changed', {
              detail: { theme: newTheme },
              bubbles: true
            }))
            
            // Optionally: update localStorage
            localStorage.setItem('theme', newTheme)
            
            // Optionally: update document theme
            document.documentElement.setAttribute('data-theme', newTheme)
          })
          
          // Load saved theme on connect
          const savedTheme = localStorage.getItem('theme')
          if (savedTheme && savedTheme !== el.getAttribute('theme')) {
            el.setAttribute('theme', savedTheme)
          }
        }
      })
    </script>
  `
}

