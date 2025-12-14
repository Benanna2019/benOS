import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

/**
 * Import module without cache to ensure fresh reads during development
 * @param {string} path - Path to the module
 * @returns {Promise<any>} The imported module
 */
export async function importWithoutCache(path) {
  return import(`${path}?update=${Date.now()}`)
}

/**
 * Read and load all Enhance elements from either:
 * 1. elements.mjs - explicit manifest mapping tag names to functions
 * 2. elements/ directory - auto-discover .mjs files, use filename as tag name
 * 
 * @returns {Promise<Object>} Object mapping tag names to element functions
 */
export async function loadElements() {
  const pathToModule = join(process.cwd(), 'elements.mjs')
  const pathToDirectory = join(process.cwd(), 'elements')
  
  if (existsSync(pathToModule)) {
    // Use explicit manifest from elements.mjs
    const els = await importWithoutCache(pathToModule)
    return els.default || els
  } 
  else if (existsSync(pathToDirectory)) {
    // Auto-discover from elements/ directory
    const els = {}
    const files = readdirSync(pathToDirectory).filter(f => f.endsWith('.mjs'))
    
    for (const file of files) {
      const tag = file.replace('.mjs', '')
      const mod = await importWithoutCache(join(pathToDirectory, file))
      els[tag] = mod.default
    }
    
    return els
  } 
  else {
    // Return empty object if no elements found (graceful degradation)
    console.warn('⚠️  No elements.mjs or elements/ folder found. Enhance elements will not be available.')
    return {}
  }
}

