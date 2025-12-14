import { createServer } from 'node:http'
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content')
const PORT = 3333

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

// Parse JSON body from request
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

// List markdown files recursively
async function listMarkdownFiles(dir, basePath = '') {
  const files = []
  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const relativePath = join(basePath, entry.name)
    const fullPath = join(dir, entry.name)
    
    if (entry.isDirectory()) {
      // Skip certain directories
      if (['feed', 'images'].includes(entry.name)) continue
      const subFiles = await listMarkdownFiles(fullPath, relativePath)
      files.push(...subFiles)
    } else if (entry.name.endsWith('.md')) {
      // Read frontmatter for title
      const content = await readFile(fullPath, 'utf-8')
      const titleMatch = content.match(/^---[\s\S]*?title:\s*["']?([^"'\n]+)["']?/m)
      const dateMatch = content.match(/^---[\s\S]*?date:\s*["']?([^"'\n]+)["']?/m)
      
      files.push({
        path: relativePath,
        name: entry.name,
        title: titleMatch?.[1] || entry.name.replace('.md', ''),
        date: dateMatch?.[1] || null,
      })
    }
  }
  
  // Sort by date (newest first)
  return files.sort((a, b) => {
    if (!a.date || !b.date) return 0
    return new Date(b.date) - new Date(a.date)
  })
}

// API Routes
async function handleAPI(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json')
  
  try {
    // GET /api/files - List all markdown files
    if (pathname === '/api/files' && req.method === 'GET') {
      const files = await listMarkdownFiles(CONTENT_DIR)
      res.end(JSON.stringify({ files }))
      return
    }
    
    // GET /api/file?path=... - Read a file
    if (pathname === '/api/file' && req.method === 'GET') {
      const url = new URL(req.url, `http://localhost:${PORT}`)
      const filePath = url.searchParams.get('path')
      
      if (!filePath) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Missing path parameter' }))
        return
      }
      
      const fullPath = join(CONTENT_DIR, filePath)
      const content = await readFile(fullPath, 'utf-8')
      res.end(JSON.stringify({ path: filePath, content }))
      return
    }
    
    // POST /api/file - Save a file
    if (pathname === '/api/file' && req.method === 'POST') {
      const { path: filePath, content } = await parseBody(req)
      
      if (!filePath || content === undefined) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Missing path or content' }))
        return
      }
      
      const fullPath = join(CONTENT_DIR, filePath)
      
      // Ensure directory exists
      await mkdir(dirname(fullPath), { recursive: true })
      
      await writeFile(fullPath, content, 'utf-8')
      res.end(JSON.stringify({ success: true, path: filePath }))
      return
    }
    
    // POST /api/new - Create new file
    if (pathname === '/api/new' && req.method === 'POST') {
      const { folder, filename, title } = await parseBody(req)
      
      if (!folder || !filename) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Missing folder or filename' }))
        return
      }
      
      const slug = filename.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      const filePath = join(folder, `${slug}.md`)
      const fullPath = join(CONTENT_DIR, filePath)
      
      // Check if file exists
      try {
        await stat(fullPath)
        res.statusCode = 409
        res.end(JSON.stringify({ error: 'File already exists' }))
        return
      } catch {
        // File doesn't exist, continue
      }
      
      const date = new Date().toISOString().split('T')[0]
      const content = `---
title: "${title || filename}"
date: "${date}"
description: ""
tags: []
author: "Ben Patton"
---

Start writing here...
`
      
      await mkdir(dirname(fullPath), { recursive: true })
      await writeFile(fullPath, content, 'utf-8')
      res.end(JSON.stringify({ success: true, path: filePath }))
      return
    }
    
    // 404 for unknown API routes
    res.statusCode = 404
    res.end(JSON.stringify({ error: 'Not found' }))
    
  } catch (error) {
    console.error('API Error:', error)
    res.statusCode = 500
    res.end(JSON.stringify({ error: error.message }))
  }
}

// Serve static files
async function serveStatic(res, pathname) {
  const filePath = pathname === '/' ? '/index.html' : pathname
  const fullPath = join(__dirname, 'public', filePath)
  
  try {
    const content = await readFile(fullPath)
    const ext = extname(filePath)
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream')
    res.end(content)
  } catch {
    res.statusCode = 404
    res.end('Not found')
  }
}

// Main server
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname
  
  // CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.end()
    return
  }
  
  // Route to API or static files
  if (pathname.startsWith('/api/')) {
    await handleAPI(req, res, pathname)
  } else {
    await serveStatic(res, pathname)
  }
})

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   📝 Markdown Editor Server                                ║
║                                                            ║
║   Open: http://localhost:${PORT}                             ║
║                                                            ║
║   Content directory: ${CONTENT_DIR}
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`)
})

