/**
 * Example: Counter element with SSR + Client-side interactivity
 * 
 * This demonstrates:
 * 1. Server-side rendering (SSR) for initial HTML
 * 2. Client-side hydration with @enhance/element
 * 3. Progressive enhancement pattern
 */

export default function counter({ html, state }) {
  const { count = 0, label = 'Counter' } = state
  
  return html`
    <style>
      example-counter {
        display: block;
        padding: 2rem;
        border: 2px solid #333;
        border-radius: 8px;
        text-align: center;
        max-width: 300px;
        margin: 1rem auto;
      }
      
      example-counter h2 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
      }
      
      example-counter .count-display {
        font-size: 3rem;
        font-weight: bold;
        color: #0066cc;
        margin: 1rem 0;
      }
      
      example-counter .controls {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
      
      example-counter button {
        padding: 0.5rem 1.5rem;
        font-size: 1.25rem;
        border: none;
        border-radius: 4px;
        background: #0066cc;
        color: white;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      example-counter button:hover {
        background: #0052a3;
      }
      
      example-counter button:active {
        background: #003d7a;
      }
    </style>
    
    <div class="counter-container">
      <h2>${label}</h2>
      <div class="count-display" data-count="${count}">${count}</div>
      <div class="controls">
        <button class="decrement">−</button>
        <button class="reset">Reset</button>
        <button class="increment">+</button>
      </div>
    </div>
    
    <script type="module">
      // This script runs client-side to add interactivity
      // The element is already rendered by SSR above
      
      class ExampleCounter extends HTMLElement {
        constructor() {
          super()
          this.count = parseInt(this.querySelector('[data-count]').dataset.count) || 0
        }
        
        connectedCallback() {
          // Add event listeners when element is added to DOM
          this.querySelector('.increment').addEventListener('click', () => this.increment())
          this.querySelector('.decrement').addEventListener('click', () => this.decrement())
          this.querySelector('.reset').addEventListener('click', () => this.resetCount())
        }
        
        increment() {
          this.count++
          this.updateDisplay()
        }
        
        decrement() {
          this.count--
          this.updateDisplay()
        }
        
        resetCount() {
          this.count = 0
          this.updateDisplay()
        }
        
        updateDisplay() {
          const display = this.querySelector('.count-display')
          display.textContent = this.count
          
          // Optional: Add animation
          display.style.transform = 'scale(1.2)'
          setTimeout(() => {
            display.style.transform = 'scale(1)'
          }, 150)
        }
      }
      
      // Register the custom element
      if (!customElements.get('example-counter')) {
        customElements.define('example-counter', ExampleCounter)
      }
    </script>
  `
}

