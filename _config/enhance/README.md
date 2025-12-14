# Custom Enhance Integration

This is a custom implementation of Enhance SSR for Eleventy that provides more flexibility than the official `@enhance/eleventy-plugin`.

## Why Custom Implementation?

The official plugin only works with `.html` files. This custom implementation exposes Enhance functionality as **shortcodes** and **JavaScript functions**, making Enhance elements available in **ALL template formats**:

- ✅ Nunjucks (`.njk`)
- ✅ Liquid (`.liquid`)
- ✅ Markdown (`.md`)
- ✅ JavaScript templates (`.11ty.js`)
- ✅ HTML (`.html`)
- ✅ Even WebC (though it has its own component system)

## File Structure

```
_config/enhance/
├── element-loader.js      # Handles loading elements from elements/ or elements.mjs
├── enhance-renderer.js    # Main plugin that exposes Enhance to Eleventy
└── README.md             # This file
```

## How It Works

### Element Loading

Elements are loaded from either:

1. **`elements.mjs`** - Explicit manifest (more control)
   ```javascript
   import header from './elements/my-header.mjs'
   import footer from './elements/my-footer.mjs'
   
   export default {
     'my-header': header,
     'my-footer': footer
   }
   ```

2. **`elements/` directory** - Auto-discovery (simpler)
   ```
   elements/
   ├── my-header.mjs
   └── my-footer.mjs
   ```

### Writing Elements

Elements use the Enhance element signature:

```javascript
// elements/my-header.mjs
export default function header ({ html, state }) {
  return html`
    <header>
      <h1>${state.siteName || 'My Site'}</h1>
    </header>
  `
}
```

The `html` tagged template is provided by `@enhance/ssr` automatically.

## Usage in Templates

### 1. Paired Shortcode (Nunjucks/Liquid/Markdown)

```njk
{% enhance %}
  <my-header></my-header>
  <main>
    <p>Your content here</p>
  </main>
  <my-footer></my-footer>
{% endenhance %}
```

### 2. Single Element Shortcode

```njk
{% enhanceElement "my-header" %}
```

With attributes:

```njk
{% enhanceElement "my-button", { class: "primary", type: "submit" } %}
```

### 3. In JavaScript Templates (`.11ty.js`)

```javascript
export default async function(data) {
  const header = await this.enhance('<my-header></my-header>', data.initialState);
  
  return `
    <!DOCTYPE html>
    <html>
      <body>
        ${header}
        <main>Content</main>
      </body>
    </html>
  `;
}
```

### 4. In HTML Files

HTML files are automatically processed through Enhance:

```html
<!-- pages/index.html -->
<my-header></my-header>
<main>
  <h1>Welcome</h1>
</main>
<my-footer></my-footer>
```

## Passing State

State can be provided through:

### 1. Front Matter
```yaml
---
initialState:
  user: "Ben"
  role: "developer"
---

{% enhance %}
  <my-profile></my-profile>
{% endenhance %}
```

### 2. Data Files
```javascript
// content/mypage.11tydata.js
export default {
  initialState: {
    user: "Ben",
    role: "developer"
  }
}
```

### 3. Global Data
```javascript
// _data/site.js
export default {
  initialState: {
    siteName: "My Awesome Site",
    year: new Date().getFullYear()
  }
}
```

## Using @enhance/element and @enhance/store

While this integration handles **server-side rendering**, you can still use the client-side packages:

### @enhance/element
For authoring custom elements that work both server and client-side:

```javascript
// elements/my-counter.mjs
export default function counter({ html, state }) {
  const { count = 0 } = state
  
  return html`
    <div>
      <h2>Count: ${count}</h2>
      <button>Increment</button>
    </div>
  `
}
```

### @enhance/store
For client-side reactive state:

```html
<script type="module">
  import Store from '@enhance/store'
  
  const store = new Store({ count: 0 })
  
  store.subscribe(state => {
    console.log('State changed:', state)
  })
</script>
```

## Differences from Official Plugin

| Feature | Official Plugin | This Implementation |
|---------|----------------|---------------------|
| `.html` files | ✅ | ✅ |
| Nunjucks/Liquid | ❌ | ✅ |
| Markdown | ❌ | ✅ |
| `.11ty.js` | ❌ | ✅ |
| Shortcodes | ❌ | ✅ |
| JavaScript Functions | ❌ | ✅ |
| Auto-reload | ✅ | ✅ |
| State passing | ✅ | ✅ |

## Development

The plugin watches for changes to:
- `elements/**/*.mjs`
- `elements.mjs`

Changes to elements automatically trigger a rebuild in dev mode.

## Performance

- Elements are cached during build
- Cache refreshes every 1 second in dev mode
- Full cache clear on each build
- No cache in production builds

