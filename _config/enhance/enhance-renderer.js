import enhance from '@enhance/ssr'
import { loadElements } from './element-loader.js'

/**
 * Cache for loaded elements (refreshed on each build)
 */
let elementsCache = null
let lastLoadTime = 0
const CACHE_DURATION = 1000 // 1 second cache in dev mode

/**
 * Get elements with smart caching
 * @param {boolean} forceReload - Force reload of elements
 * @returns {Promise<Object>} Elements object
 */
async function getElements(forceReload = false) {
  const now = Date.now()
  
  if (forceReload || !elementsCache || (now - lastLoadTime > CACHE_DURATION)) {
    elementsCache = await loadElements()
    lastLoadTime = now
  }
  
  return elementsCache
}

/**
 * Render HTML string with Enhance SSR
 * @param {string} content - HTML content to render
 * @param {Object} initialState - Initial state to pass to elements
 * @returns {Promise<string>} Rendered HTML
 */
export async function renderEnhanced(content, initialState = {}) {
  const elements = await getElements()
  const html = enhance({ elements, initialState })
  return html`${content}`
}

/**
 * Render a specific custom element by tag name
 * @param {string} tagName - The custom element tag name
 * @param {Object} attrs - Attributes to pass to the element
 * @param {string} content - Inner HTML content
 * @param {Object} initialState - Initial state
 * @returns {Promise<string>} Rendered HTML
 */
export async function renderElement(tagName, attrs = {}, content = '', initialState = {}) {
  const attrString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
  
  const html = attrString 
    ? `<${tagName} ${attrString}>${content}</${tagName}>`
    : `<${tagName}>${content}</${tagName}>`
  
  return renderEnhanced(html, initialState)
}

/**
 * Plugin function to add Enhance capabilities to Eleventy
 * @param {Object} eleventyConfig - Eleventy configuration object
 */
export function enhancePlugin(eleventyConfig) {
  
  // Add shortcode to render enhanced HTML
  // Usage in templates: {% enhance %}<my-element></my-element>{% endenhance %}
  eleventyConfig.addPairedShortcode('enhance', async function(content) {
    // Extract only initialState to avoid circular references in collections
    const initialState = this.ctx?.initialState || {}
    return renderEnhanced(content, initialState)
  })
  
  // Add shortcode to render a specific element
  // Usage: {% enhanceElement "my-header" %}
  eleventyConfig.addShortcode('enhanceElement', async function(tagName, attrs = {}) {
    // Extract only initialState to avoid circular references in collections
    const initialState = this.ctx?.initialState || {}
    return renderElement(tagName, attrs, '', initialState)
  })
  
  // Add JavaScript function for use in .11ty.js templates
  eleventyConfig.addJavaScriptFunction('enhance', async (content, initialState = {}) => {
    return renderEnhanced(content, initialState)
  })
  
  eleventyConfig.addJavaScriptFunction('enhanceElement', async (tagName, attrs = {}, content = '', initialState = {}) => {
    return renderElement(tagName, attrs, content, initialState)
  })
  
  // Add custom .html extension handler (like the original plugin)
  eleventyConfig.addExtension('html', {
    async compile(inputContent) {
      return async function compiler(data) {
        const initialState = data.initialState || {}
        return renderEnhanced(inputContent, initialState)
      }
    }
  })
  
  // Watch for element changes
  eleventyConfig.addWatchTarget('./elements/**/*.mjs')
  eleventyConfig.addWatchTarget('./elements.mjs')
  
  // Reset cache on rebuild
  eleventyConfig.on('eleventy.before', async () => {
    elementsCache = null
  })
}

export default enhancePlugin

