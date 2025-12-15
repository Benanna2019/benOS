/**
 * Music Uploader Component
 * 
 * Admin-only component for uploading music files to InstantDB storage
 */

export default function MusicUploader({ html, state }) {
  return html`
    <style>
      music-uploader {
        display: block;
      }
      
      .uploader-container {
        padding: 2rem;
        border: 2px dashed var(--color-border, #e0e0e0);
        border-radius: 8px;
        text-align: center;
        background: var(--background-color, #f7f7f5);
        transition: all 0.2s;
      }
      
      .uploader-container.drag-over {
        border-color: var(--color-accent-navy, #1e204d);
        background: rgba(30, 32, 77, 0.05);
      }
      
      .uploader-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      .uploader-text {
        color: var(--color-text-muted, #595959);
        margin-bottom: 1rem;
      }
      
      .uploader-input {
        display: none;
      }
      
      .uploader-btn {
        padding: 0.75rem 1.5rem;
        background: var(--color-accent-navy, #1e204d);
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        font-family: var(--font-family-ui, sans-serif);
      }
      
      .uploader-btn:hover {
        opacity: 0.9;
      }
      
      .uploader-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      /* Upload Progress */
      .upload-progress {
        margin-top: 1.5rem;
        padding: 1rem;
        background: white;
        border-radius: 4px;
        border: 1px solid var(--color-border, #e0e0e0);
      }
      
      .progress-bar {
        height: 8px;
        background: var(--color-border, #e0e0e0);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: var(--color-accent-navy, #1e204d);
        transition: width 0.3s;
      }
      
      .progress-text {
        font-size: 0.875rem;
        color: var(--color-text-muted, #595959);
        margin-top: 0.5rem;
      }
      
      /* Music Library */
      .music-library {
        margin-top: 2rem;
      }
      
      .music-library h3 {
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-muted, #595959);
        margin-bottom: 1rem;
      }
      
      .music-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .music-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: white;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 4px;
      }
      
      .music-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .music-icon {
        font-size: 1.5rem;
      }
      
      .music-name {
        font-weight: 500;
      }
      
      .music-actions {
        display: flex;
        gap: 0.5rem;
      }
      
      .music-actions button {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-family: var(--font-family-ui, sans-serif);
      }
      
      .music-actions button:hover {
        background: var(--background-color, #f7f7f5);
      }
      
      .music-actions button.delete {
        color: #dc3545;
        border-color: #dc3545;
      }
      
      .music-actions button.delete:hover {
        background: #dc3545;
        color: white;
      }
    </style>
    
    <div class="uploader-container" data-dropzone>
      <div class="uploader-icon">🎵</div>
      <p class="uploader-text">Drag and drop audio files here, or click to browse</p>
      <input type="file" class="uploader-input" data-file-input accept="audio/*" multiple />
      <button class="uploader-btn" data-browse>Browse Files</button>
      
      <div class="upload-progress" style="display: none;" data-progress>
        <div class="progress-bar">
          <div class="progress-fill" data-progress-fill style="width: 0%;"></div>
        </div>
        <p class="progress-text" data-progress-text>Uploading...</p>
      </div>
    </div>
    
    <div class="music-library">
      <h3>Your Music Library</h3>
      <div class="music-list" data-music-list>
        <p style="color: var(--color-text-muted); text-align: center;">Loading music files...</p>
      </div>
    </div>
    
    <script type="module">
      
      class MusicUploaderElement extends HTMLElement {
        constructor() {
          super();
        }
        
        async connectedCallback() {
          // Check admin access
          try {
            const user = await db.getAuth();
            if (!user || !user.idAdmin) {
              this.innerHTML = '<p>Access denied. Admin only.</p>';
              return;
            }
          } catch (e) {
            this.innerHTML = '<p>Please sign in to upload music.</p>';
            return;
          }
          
          // DOM refs
          this.dropzone = this.querySelector('[data-dropzone]');
          this.fileInput = this.querySelector('[data-file-input]');
          this.browseBtn = this.querySelector('[data-browse]');
          this.progressEl = this.querySelector('[data-progress]');
          this.progressFill = this.querySelector('[data-progress-fill]');
          this.progressText = this.querySelector('[data-progress-text]');
          this.musicList = this.querySelector('[data-music-list]');
          
          // Events
          this.browseBtn.addEventListener('click', () => this.fileInput.click());
          this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
          
          // Drag and drop
          this.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropzone.classList.add('drag-over');
          });
          
          this.dropzone.addEventListener('dragleave', () => {
            this.dropzone.classList.remove('drag-over');
          });
          
          this.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
          });
          
          // Load music library
          this.loadMusicLibrary();
        }
        
        async handleFiles(files) {
          if (!files.length) return;
          
          const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
          if (!audioFiles.length) {
            alert('Please select audio files only.');
            return;
          }
          
          this.progressEl.style.display = 'block';
          
          for (let i = 0; i < audioFiles.length; i++) {
            const file = audioFiles[i];
            const progress = ((i + 1) / audioFiles.length) * 100;
            
            this.progressText.textContent = 'Uploading ' + file.name + '...';
            this.progressFill.style.width = progress + '%';
            
            try {
              await db.storage.uploadFile('music/' + file.name, file, {
                contentType: file.type,
                contentDisposition: 'inline',
              });
              
              // Also create a music metadata entry
              await db.transact(
                db.tx.music[id()].update({
                  filename: file.name,
                  path: 'music/' + file.name,
                  uploadedAt: Date.now(),
                  uploadedBy: ADMIN_EMAIL,
                })
              );
            } catch (error) {
              console.error('Upload failed:', error);
              alert('Failed to upload ' + file.name);
            }
          }
          
          this.progressText.textContent = 'Upload complete!';
          setTimeout(() => {
            this.progressEl.style.display = 'none';
            this.progressFill.style.width = '0%';
          }, 2000);
          
          // Clear file input
          this.fileInput.value = '';
        }
        
        loadMusicLibrary() {
          db.subscribeQuery(
            { 
              $files: { 
                $: { 
                  where: { path: { $like: 'music/%' } },
                  order: { serverCreatedAt: 'desc' } 
                } 
              } 
            },
            (resp) => {
              if (resp.error) {
                this.musicList.innerHTML = '<p style="color: #dc3545;">Error loading music</p>';
                return;
              }
              
              const files = resp.data.$files || [];
              
              if (!files.length) {
                this.musicList.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">No music uploaded yet</p>';
                return;
              }
              
              this.musicList.innerHTML = files.map(file => {
                const name = file.path.replace('music/', '');
                return \`
                  <div class="music-item" data-path="\${file.path}">
                    <div class="music-info">
                      <span class="music-icon">🎵</span>
                      <span class="music-name">\${name}</span>
                    </div>
                    <div class="music-actions">
                      <button data-play="\${file.url}">▶ Play</button>
                      <button class="delete" data-delete="\${file.path}">Delete</button>
                    </div>
                  </div>
                \`;
              }).join('');
              
              // Add event listeners
              this.musicList.querySelectorAll('[data-play]').forEach(btn => {
                btn.addEventListener('click', () => this.playPreview(btn.dataset.play));
              });
              
              this.musicList.querySelectorAll('[data-delete]').forEach(btn => {
                btn.addEventListener('click', () => this.deleteFile(btn.dataset.delete));
              });
            }
          );
        }
        
        playPreview(url) {
          // Dispatch event to the global audio player if it exists
          window.dispatchEvent(new CustomEvent('play-audio', { 
            detail: { url } 
          }));
          
          // Fallback: simple audio playback
          if (!document.querySelector('audio-player')) {
            const audio = new Audio(url);
            audio.play();
          }
        }
        
        async deleteFile(path) {
          if (!confirm('Delete this file?')) return;
          
          try {
            await db.storage.delete(path);
          } catch (e) {
            console.error('Delete failed:', e);
            alert('Failed to delete file');
          }
        }
      }
      
      if (!customElements.get('music-uploader')) {
        customElements.define('music-uploader', MusicUploaderElement);
      }
    </script>
  `;
}

