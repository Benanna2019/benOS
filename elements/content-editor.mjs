/**
 * Content Editor Component
 * 
 * Layout:
 * 1. Drafts Sidebar (List of posts) - Left Column
 * 2. Editor Main (Markdown/Preview Toggle) - Right Column
 */

export default function ContentEditor({ html, state }) {
  return html`
    <style>
      content-editor {
        display: block;
        height: 100%;
        background: white;
      }
      
      .editor-grid {
        display: grid;
        grid-template-columns: 250px 1fr;
        height: 100%;
        border-top: 1px solid var(--color-border, #e0e0e0);
      }
      
      /* --- Col 1: Drafts Sidebar --- */
      .drafts-sidebar {
        background: var(--background-color, #f7f7f5);
        border-right: 1px solid var(--color-border, #e0e0e0);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .sidebar-header {
        padding: 1rem;
        border-bottom: 1px solid var(--color-border, #e0e0e0);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .sidebar-title {
        font-weight: 600;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted, #595959);
        margin: 0;
      }
      
      .new-draft-btn {
        background: transparent;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        cursor: pointer;
        color: var(--color-text-main, #1a1a1a);
      }
      
      .drafts-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
      }
      
      .draft-item {
        padding: 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 0.25rem;
        border: 1px solid transparent;
      }
      
      .draft-item:hover {
        background: white;
        border-color: var(--color-border, #e0e0e0);
      }
      
      .draft-item.active {
        background: white;
        border-color: var(--color-accent-navy, #1e204d);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .draft-title {
        font-weight: 500;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .draft-meta {
        font-size: 0.75rem;
        color: var(--color-text-muted, #595959);
      }
      
      /* --- Col 2: Editor Main --- */
      .editor-area {
        display: flex;
        flex-direction: column;
        background: white;
        overflow: hidden;
      }
      
      .editor-toolbar {
        padding: 0.75rem 1.5rem;
        border-bottom: 1px solid var(--color-border, #e0e0e0);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
      }
      
      .editor-actions {
        display: flex;
        gap: 0.5rem;
      }
      
      .toggle-group {
        display: flex;
        background: var(--background-color, #f7f7f5);
        padding: 0.25rem;
        border-radius: 6px;
      }
      
      .toggle-btn {
        padding: 0.25rem 0.75rem;
        border: none;
        background: transparent;
        font-size: 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        color: var(--color-text-muted, #595959);
      }
      
      .toggle-btn.active {
        background: white;
        color: var(--color-text-main, #1a1a1a);
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .editor-meta-panel {
        padding: 1rem 1.5rem;
        background: var(--background-color, #f7f7f5);
        border-bottom: 1px solid var(--color-border, #e0e0e0);
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 1rem;
      }
      
      .input-group label {
        display: block;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--color-text-muted, #595959);
        margin-bottom: 0.25rem;
      }
      
      .editor-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 4px;
        font-size: 0.9rem;
      }
      
      .editor-canvas {
        flex: 1;
        position: relative;
        overflow: hidden;
      }
      
      .editor-pane {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        overflow-y: auto;
      }
      
      .editor-pane.active {
        display: block;
      }
      
      textarea.editor-input-area {
        width: 100%;
        height: 100%;
        border: none;
        resize: none;
        padding: 2rem;
        font-family: 'Geist Mono', 'SF Mono', monospace;
        font-size: 1rem;
        line-height: 1.6;
        outline: none;
      }
      
      .preview-pane {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid var(--color-border, #e0e0e0);
        background: white;
      }
      
      .btn-primary {
        background: var(--color-accent-navy, #1e204d);
        color: white;
        border-color: var(--color-accent-navy, #1e204d);
      }
      
      .status-indicator {
        font-size: 0.75rem;
        color: var(--color-text-muted, #595959);
        margin-right: 1rem;
      }
    </style>
    
    <div class="editor-grid">
      <!-- 1. Drafts Sidebar -->
      <div class="drafts-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Drafts</h3>
          <button class="new-draft-btn" data-new-draft>+ New</button>
        </div>
        <div class="drafts-list" data-drafts-list>
          <div style="padding: 1rem; text-align: center; color: #999;">Loading...</div>
        </div>
      </div>
      
      <!-- 2. Editor Area -->
      <div class="editor-area">
        <div class="editor-toolbar">
          <div class="toggle-group">
            <button class="toggle-btn active" data-view="edit">Write</button>
            <button class="toggle-btn" data-view="preview">Preview</button>
          </div>
          
          <div class="editor-actions">
            <span class="status-indicator" data-status>Ready</span>
            <button class="btn" data-action="save">Save</button>
            <button class="btn btn-primary" data-action="publish">Publish</button>
          </div>
        </div>
        
        <div class="editor-meta-panel">
          <div class="input-group">
            <label>Title</label>
            <input type="text" class="editor-input" data-field="title" placeholder="Post Title" />
          </div>
          <div class="input-group">
            <label>Type</label>
            <select class="editor-input" data-field="contentType">
              <option value="tech-blog">Tech Blog</option>
              <option value="articles">Article</option>
            </select>
          </div>
          <div class="input-group">
            <label>Tags</label>
            <input type="text" class="editor-input" data-field="tags" placeholder="react, design" />
          </div>
        </div>
        
        <div class="editor-canvas">
          <!-- Edit View -->
          <div class="editor-pane active" data-pane="edit">
            <textarea class="editor-input-area" data-field="content" placeholder="# Start writing..."></textarea>
          </div>
          
          <!-- Preview View -->
          <div class="editor-pane" data-pane="preview">
            <div class="preview-pane" data-preview-content></div>
          </div>
        </div>
      </div>
    </div>
    
    <script type="module">
      import { marked } from 'https://esm.sh/marked@12.0.1';
      
      class ContentEditorElement extends HTMLElement {
        constructor() {
          super();
          this.draftId = null;
          this.autoSaveTimeout = null;
          this.drafts = [];
        }
        
        async connectedCallback() {
          // Check auth using global db
          try {
            const user = await db.getAuth();
            if (!user || user.email !== 'bass41992ben@gmail.com') {
              this.innerHTML = '<div style="padding: 2rem;">Access denied.</div>';
              return;
            }
          } catch (e) {
            console.error('Auth check failed', e);
          }
          
          // Elements
          this.draftsList = this.querySelector('[data-drafts-list]');
          this.titleInput = this.querySelector('[data-field="title"]');
          this.contentTypeSelect = this.querySelector('[data-field="contentType"]');
          this.tagsInput = this.querySelector('[data-field="tags"]');
          this.contentInput = this.querySelector('[data-field="content"]');
          this.previewContent = this.querySelector('[data-preview-content]');
          this.statusEl = this.querySelector('[data-status]');
          
          // Buttons
          this.querySelector('[data-new-draft]').addEventListener('click', () => this.createDraft());
          this.querySelector('[data-action="save"]').addEventListener('click', () => this.saveDraft());
          this.querySelector('[data-action="publish"]').addEventListener('click', () => this.publish());
          
          // View Toggle
          this.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
          });
          
          // Auto-save listeners
          [this.titleInput, this.contentTypeSelect, this.tagsInput, this.contentInput].forEach(el => {
            el.addEventListener('input', () => this.scheduleAutoSave());
          });
          
          // Load Drafts
          this.subscribeToDrafts();
          
          // URL Param check
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('id')) {
            this.loadDraft(urlParams.get('id'));
          }
        }
        
        switchView(view) {
          // Update buttons
          this.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
          });
          
          // Update panes
          this.querySelectorAll('[data-pane]').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.pane === view);
          });
          
          if (view === 'preview') {
            this.renderPreview();
          }
        }
        
        renderPreview() {
          this.previewContent.innerHTML = marked.parse(this.contentInput.value || '');
          // TODO: Enhance web components
        }
        
        subscribeToDrafts() {
          db.subscribeQuery({ drafts: {} }, (resp) => {
            if (resp.error) return;
            this.drafts = resp.data.drafts || [];
            this.drafts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            this.renderDraftsList();
          });
        }
        
        renderDraftsList() {
          this.draftsList.innerHTML = this.drafts.map(d => \`
            <div class="draft-item \${d.id === this.draftId ? 'active' : ''}" data-id="\${d.id}">
              <div class="draft-title">\${d.title || 'Untitled'}</div>
              <div class="draft-meta">\${new Date(d.updatedAt || Date.now()).toLocaleDateString()}</div>
            </div>
          \`).join('');
          
          this.draftsList.querySelectorAll('.draft-item').forEach(el => {
            el.addEventListener('click', () => {
              this.loadDraft(el.dataset.id);
              // Update URL
              const url = new URL(window.location);
              url.searchParams.set('id', el.dataset.id);
              window.history.pushState({}, '', url);
            });
          });
        }
        
        async createDraft() {
          this.draftId = null;
          this.titleInput.value = '';
          this.tagsInput.value = '';
          this.contentInput.value = '';
          this.statusEl.textContent = 'New Draft';
          this.renderDraftsList();
        }
        
        async loadDraft(id) {
          // Check local list first
          let draft = this.drafts.find(d => d.id === id);
          if (!draft) {
            // Fetch if missing
            const r = await db.query({ drafts: { $: { where: { id } } } });
            draft = r.data?.drafts?.[0];
          }
          
          if (draft) {
            this.draftId = draft.id;
            this.titleInput.value = draft.title || '';
            this.tagsInput.value = draft.tags || '';
            this.contentTypeSelect.value = draft.contentType || 'tech-blog';
            this.contentInput.value = draft.content || '';
            this.statusEl.textContent = 'Loaded';
            this.renderDraftsList();
          }
        }
        
        scheduleAutoSave() {
          this.statusEl.textContent = 'Unsaved...';
          clearTimeout(this.autoSaveTimeout);
          this.autoSaveTimeout = setTimeout(() => this.saveDraft(), 1000);
        }
        
        async saveDraft() {
          this.statusEl.textContent = 'Saving...';
          const data = {
            title: this.titleInput.value,
            content: this.contentInput.value,
            tags: this.tagsInput.value,
            contentType: this.contentTypeSelect.value,
            updatedAt: Date.now(),
            status: 'draft'
          };
          
          try {
            if (!this.draftId) {
              // Create new
              this.draftId = crypto.randomUUID(); // Fallback if id() not avail globally
              data.createdAt = Date.now();
              await db.transact(db.tx.drafts[this.draftId].update(data));
            } else {
              await db.transact(db.tx.drafts[this.draftId].update(data));
            }
            this.statusEl.textContent = 'Saved';
            
            // Ensure URL matches
            const url = new URL(window.location);
            if (url.searchParams.get('id') !== this.draftId) {
              url.searchParams.set('id', this.draftId);
              window.history.replaceState({}, '', url);
            }
          } catch (e) {
            console.error(e);
            this.statusEl.textContent = 'Error saving';
          }
        }
        
        async publish() {
          if (!confirm('Publish this post?')) return;
          await this.saveDraft();
          this.statusEl.textContent = 'Publishing...';
          
          try {
            const res = await fetch('/api/publish', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ draftId: this.draftId })
            });
            if (!res.ok) throw new Error('API failed');
            
            await db.transact(db.tx.drafts[this.draftId].update({ status: 'publishing' }));
            this.statusEl.textContent = 'Published!';
            alert('Publishing started.');
          } catch (e) {
            console.error(e);
            this.statusEl.textContent = 'Publish failed';
            alert('Publish failed');
          }
        }
      }
      
      if (!customElements.get('content-editor')) {
        customElements.define('content-editor', ContentEditorElement);
      }
    </script>
  `;
}
