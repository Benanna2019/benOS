/**
 * Progressive Enhancement Example: Todo List
 * 
 * PATTERN:
 * 1. Server-side: Returns HTML string (SSR with @enhance/ssr)
 * 2. Client-side: Uses @enhance/element to add reactivity
 * 
 * This gives you:
 * - Fast initial render (SSR)
 * - SEO friendly (real HTML)
 * - Progressive enhancement (works without JS)
 * - Reactive updates (with JS enabled)
 */

export default function TodoList({ html, state }) {
  const { heading = 'My Todos' } = state
  const todos = state.todos || [
    { id: 1, title: 'Learn Enhance SSR', completed: false },
    { id: 2, title: 'Build awesome components', completed: false },
    { id: 3, title: 'Deploy to production', completed: false }
  ]
  
  const todoItems = todos
    .map(t => `
      <li class="${t.completed ? 'completed' : ''}" data-todo-id="${t.id}">
        <input type="checkbox" ${t.completed ? 'checked' : ''}>
        <span>${t.title}</span>
        <button class="delete-btn">×</button>
      </li>
    `)
    .join('\n')
  
  return html`
    <style>
      todo-list {
        display: block;
        max-width: 500px;
        margin: 2rem auto;
        padding: 2rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        background: #fff;
      }
      
      todo-list h2 {
        margin: 0 0 1rem 0;
        color: #333;
      }
      
      todo-list .add-todo {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      todo-list input[type="text"] {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }
      
      todo-list button.add-btn {
        padding: 0.5rem 1rem;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }
      
      todo-list button.add-btn:hover {
        background: #0052a3;
      }
      
      todo-list ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      todo-list li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border-bottom: 1px solid #eee;
        transition: background 0.2s;
      }
      
      todo-list li:hover {
        background: #f9f9f9;
      }
      
      todo-list li.completed span {
        text-decoration: line-through;
        color: #999;
      }
      
      todo-list input[type="checkbox"] {
        cursor: pointer;
      }
      
      todo-list li span {
        flex: 1;
      }
      
      todo-list .delete-btn {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 1.25rem;
        line-height: 1;
        padding: 0;
      }
      
      todo-list .delete-btn:hover {
        background: #c82333;
      }
      
      todo-list .stats {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        color: #666;
        font-size: 0.9rem;
      }
    </style>
    
    <div class="todo-container">
      <h2>${heading}</h2>
      
      <div class="add-todo">
        <input type="text" placeholder="What needs to be done?" class="new-todo">
        <button class="add-btn">Add</button>
      </div>
      
      <ul class="todo-list">
        ${todoItems}
      </ul>
      
      <div class="stats">
        <span class="total-count">${todos.length}</span> total • 
        <span class="active-count">${todos.filter(t => !t.completed).length}</span> active
      </div>
    </div>
    
    <script type="module">
      // CLIENT-SIDE ENHANCEMENT with @enhance/element
      import enhanceElement from 'https://unpkg.com/@enhance/element@1.4.2/dist/index.js?module=true'
      
      enhanceElement('todo-list', {
        // Track the 'heading' attribute
        attrs: ['heading'],
        
        // Track 'todos' key from store (optional - for future store integration)
        // keys: ['todos'],
        
        // Initialize - runs once when element is created
        init(el) {
          console.log('Todo list initialized:', el)
          
          // Set up local state
          el.todos = Array.from(el.querySelectorAll('li')).map(li => ({
            id: parseInt(li.dataset.todoId),
            title: li.querySelector('span').textContent,
            completed: li.classList.contains('completed')
          }))
          
          // Add event listeners
          el.querySelector('.add-btn').addEventListener('click', () => {
            el.addTodo()
          })
          
          el.querySelector('.new-todo').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              el.addTodo()
            }
          })
        },
        
        // Render function - pure function that returns HTML
        render({ html, state }) {
          const { attrs = {}, store = {} } = state
          const { heading = 'My Todos' } = attrs
          const todos = this.todos || []
          
          const todoItems = todos
            .map(t => 
              '<li class="' + (t.completed ? 'completed' : '') + '" data-todo-id="' + t.id + '">' +
                '<input type="checkbox" ' + (t.completed ? 'checked' : '') + ' data-id="' + t.id + '">' +
                '<span>' + t.title + '</span>' +
                '<button class="delete-btn" data-id="' + t.id + '">×</button>' +
              '</li>'
            )
            .join('')
          
          const totalCount = todos.length
          const activeCount = todos.filter(t => !t.completed).length
          
          return '<div class="todo-container">' +
              '<h2>' + heading + '</h2>' +
              '<div class="add-todo">' +
                '<input type="text" placeholder="What needs to be done?" class="new-todo">' +
                '<button class="add-btn">Add</button>' +
              '</div>' +
              '<ul class="todo-list">' + todoItems + '</ul>' +
              '<div class="stats">' +
                '<span class="total-count">' + totalCount + '</span> total • ' +
                '<span class="active-count">' + activeCount + '</span> active' +
              '</div>' +
            '</div>'
        },
        
        // Connected - runs when element is added to DOM
        connected(el) {
          console.log('Todo list connected to DOM')
          
          // Use event delegation for dynamic elements
          el.addEventListener('click', (e) => {
            // Handle checkbox toggle
            if (e.target.type === 'checkbox') {
              const id = parseInt(e.target.dataset.id)
              el.toggleTodo(id)
            }
            
            // Handle delete
            if (e.target.classList.contains('delete-btn')) {
              const id = parseInt(e.target.dataset.id)
              el.deleteTodo(id)
            }
          })
        },
        
        // Disconnected - runs when element is removed from DOM
        disconnected(el) {
          console.log('Todo list disconnected from DOM')
        },
        
        // Custom methods
        addTodo() {
          const input = this.querySelector('.new-todo')
          const title = input.value.trim()
          
          if (title) {
            const newTodo = {
              id: Date.now(),
              title,
              completed: false
            }
            
            this.todos = [...this.todos, newTodo]
            input.value = ''
            
            // Trigger re-render (morphdom will efficiently update the DOM)
            this.render()
          }
        },
        
        toggleTodo(id) {
          this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
          this.render()
        },
        
        deleteTodo(id) {
          this.todos = this.todos.filter(todo => todo.id !== id)
          this.render()
        }
      })
    </script>
  `
}

