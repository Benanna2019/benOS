/**
 * Audio Player Component
 * 
 * Fixed position audio player with:
 * - Synchronized playback across users
 * - Persistent state across page navigation
 * - "Who's listening" presence feature
 */

export default function AudioPlayer({ html, state }) {
  return html`
    <style>
      audio-player {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: var(--color-accent-navy, #1e204d);
        color: white;
        padding: 0;
        transform: translateY(100%);
        transition: transform 0.3s ease;
      }
      
      audio-player.visible {
        transform: translateY(0);
      }
      
      .player-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
      }
      
      /* Track Info */
      .player-info {
        flex: 1;
        min-width: 0;
      }
      
      .player-track {
        font-weight: 600;
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .player-status {
        font-size: 0.75rem;
        opacity: 0.7;
      }
      
      /* Controls */
      .player-controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .player-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .player-btn:hover {
        background: rgba(255,255,255,0.2);
      }
      
      .player-btn.play {
        width: 44px;
        height: 44px;
        background: white;
        color: var(--color-accent-navy, #1e204d);
      }
      
      .player-btn.play:hover {
        background: #f0f0f0;
      }
      
      /* Progress */
      .player-progress {
        flex: 2;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .progress-time {
        font-size: 0.75rem;
        font-family: 'Geist Mono', monospace;
        opacity: 0.7;
        min-width: 40px;
      }
      
      .progress-bar {
        flex: 1;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
        cursor: pointer;
        position: relative;
      }
      
      .progress-fill {
        height: 100%;
        background: white;
        border-radius: 2px;
        position: relative;
        transition: width 0.1s linear;
      }
      
      .progress-fill::after {
        content: '';
        position: absolute;
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .progress-bar:hover .progress-fill::after {
        opacity: 1;
      }
      
      /* Volume */
      .player-volume {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .volume-slider {
        width: 80px;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
        -webkit-appearance: none;
        cursor: pointer;
      }
      
      .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
      }
      
      /* Listeners */
      .player-listeners {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        opacity: 0.8;
      }
      
      .listeners-avatars {
        display: flex;
        margin-left: 0.25rem;
      }
      
      .listener-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        font-weight: 600;
        margin-left: -8px;
        border: 2px solid var(--color-accent-navy, #1e204d);
      }
      
      .listener-avatar:first-child {
        margin-left: 0;
      }
      
      /* Close button */
      .player-close {
        background: none;
        border: none;
        color: white;
        opacity: 0.5;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.5rem;
      }
      
      .player-close:hover {
        opacity: 1;
      }
      
      /* Hidden audio element */
      audio {
        display: none;
      }
    </style>
    
    <audio data-audio></audio>
    
    <div class="player-container">
      <!-- Track Info -->
      <div class="player-info">
        <div class="player-track" data-track-name>No track selected</div>
        <div class="player-status" data-status>Ready</div>
      </div>
      
      <!-- Controls -->
      <div class="player-controls">
        <button class="player-btn" data-prev title="Previous">⏮</button>
        <button class="player-btn play" data-play title="Play/Pause">▶</button>
        <button class="player-btn" data-next title="Next">⏭</button>
      </div>
      
      <!-- Progress -->
      <div class="player-progress">
        <span class="progress-time" data-current>0:00</span>
        <div class="progress-bar" data-progress-bar>
          <div class="progress-fill" data-progress-fill style="width: 0%;"></div>
        </div>
        <span class="progress-time" data-duration>0:00</span>
      </div>
      
      <!-- Volume -->
      <div class="player-volume">
        <span>🔊</span>
        <input type="range" class="volume-slider" data-volume min="0" max="100" value="80" />
      </div>
      
      <!-- Listeners -->
      <div class="player-listeners">
        <span data-listener-count>0</span> listening
        <div class="listeners-avatars" data-listeners></div>
      </div>
      
      <!-- Close -->
      <button class="player-close" data-close title="Close">×</button>
    </div>
    
    <script type="module">
      
      const ROOM_ID = 'music-room'; // Global music room
      
      class AudioPlayerElement extends HTMLElement {
        constructor() {
          super();
          this.isPlaying = false;
          this.currentTrack = null;
          this.syncEnabled = true;
        }
        
        connectedCallback() {
          // DOM refs
          this.audio = this.querySelector('[data-audio]');
          this.trackName = this.querySelector('[data-track-name]');
          this.statusEl = this.querySelector('[data-status]');
          this.playBtn = this.querySelector('[data-play]');
          this.prevBtn = this.querySelector('[data-prev]');
          this.nextBtn = this.querySelector('[data-next]');
          this.currentTime = this.querySelector('[data-current]');
          this.durationEl = this.querySelector('[data-duration]');
          this.progressBar = this.querySelector('[data-progress-bar]');
          this.progressFill = this.querySelector('[data-progress-fill]');
          this.volumeSlider = this.querySelector('[data-volume]');
          this.listenerCount = this.querySelector('[data-listener-count]');
          this.listenersEl = this.querySelector('[data-listeners]');
          this.closeBtn = this.querySelector('[data-close]');
          
          // Set initial volume
          this.audio.volume = this.volumeSlider.value / 100;
          
          // Event listeners
          this.playBtn.addEventListener('click', () => this.togglePlay());
          this.volumeSlider.addEventListener('input', () => {
            this.audio.volume = this.volumeSlider.value / 100;
          });
          this.closeBtn.addEventListener('click', () => this.hide());
          
          // Progress bar seeking
          this.progressBar.addEventListener('click', (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (this.audio.duration) {
              this.audio.currentTime = percent * this.audio.duration;
              this.broadcastState();
            }
          });
          
          // Audio events
          this.audio.addEventListener('timeupdate', () => this.updateProgress());
          this.audio.addEventListener('ended', () => this.onEnded());
          this.audio.addEventListener('loadedmetadata', () => {
            this.durationEl.textContent = this.formatTime(this.audio.duration);
          });
          
          // Listen for external play requests
          window.addEventListener('play-audio', (e) => {
            this.loadTrack(e.detail.url, e.detail.name);
          });
          
          // Restore state from localStorage
          this.restoreState();
          
          // Join the music room for presence
          this.joinRoom();
        }
        
        async joinRoom() {
          try {
            const user = await db.getAuth();
            const userId = user?.email || 'guest-' + Math.random().toString(36).substr(2, 9);
            
            // Subscribe to room presence
            db.room(ROOM_ID).subscribe({
              presence: {
                user: { 
                  id: userId, 
                  email: user?.email || 'Guest',
                  initial: (user?.email || 'G').charAt(0).toUpperCase()
                },
              },
            }).on('presence', (data) => {
              this.updateListeners(data.peers);
            }).on('broadcast', 'player-state', (msg) => {
              if (this.syncEnabled && msg.from !== userId) {
                this.handleRemoteState(msg.data);
              }
            });
            
            this.userId = userId;
          } catch (e) {
            console.log('Room join failed:', e);
          }
        }
        
        updateListeners(peers) {
          const count = Object.keys(peers).length + 1; // +1 for self
          this.listenerCount.textContent = count;
          
          // Show avatar circles
          const avatars = Object.values(peers)
            .slice(0, 5)
            .map(p => \`<div class="listener-avatar">\${p.user?.initial || '?'}</div>\`)
            .join('');
          this.listenersEl.innerHTML = avatars;
        }
        
        loadTrack(url, name) {
          this.currentTrack = { url, name: name || this.extractName(url) };
          this.audio.src = url;
          this.trackName.textContent = this.currentTrack.name;
          this.show();
          this.play();
          this.saveState();
        }
        
        extractName(url) {
          try {
            const parts = url.split('/');
            let name = parts[parts.length - 1];
            name = decodeURIComponent(name);
            name = name.replace(/\\.[^/.]+$/, ''); // Remove extension
            return name;
          } catch {
            return 'Unknown Track';
          }
        }
        
        togglePlay() {
          if (this.isPlaying) {
            this.pause();
          } else {
            this.play();
          }
          this.broadcastState();
        }
        
        play() {
          this.audio.play().catch(e => console.log('Playback failed:', e));
          this.isPlaying = true;
          this.playBtn.textContent = '⏸';
          this.statusEl.textContent = 'Playing';
        }
        
        pause() {
          this.audio.pause();
          this.isPlaying = false;
          this.playBtn.textContent = '▶';
          this.statusEl.textContent = 'Paused';
        }
        
        updateProgress() {
          if (!this.audio.duration) return;
          
          const percent = (this.audio.currentTime / this.audio.duration) * 100;
          this.progressFill.style.width = percent + '%';
          this.currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
        
        formatTime(seconds) {
          if (!seconds || isNaN(seconds)) return '0:00';
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return mins + ':' + secs.toString().padStart(2, '0');
        }
        
        onEnded() {
          this.isPlaying = false;
          this.playBtn.textContent = '▶';
          this.statusEl.textContent = 'Ended';
        }
        
        show() {
          this.classList.add('visible');
          document.body.style.paddingBottom = '64px';
        }
        
        hide() {
          this.pause();
          this.classList.remove('visible');
          document.body.style.paddingBottom = '';
          this.currentTrack = null;
          localStorage.removeItem('audioPlayerState');
        }
        
        // State persistence
        saveState() {
          if (!this.currentTrack) return;
          localStorage.setItem('audioPlayerState', JSON.stringify({
            url: this.currentTrack.url,
            name: this.currentTrack.name,
            time: this.audio.currentTime,
            playing: this.isPlaying
          }));
        }
        
        restoreState() {
          try {
            const saved = localStorage.getItem('audioPlayerState');
            if (saved) {
              const state = JSON.parse(saved);
              this.loadTrack(state.url, state.name);
              this.audio.currentTime = state.time || 0;
              if (state.playing) {
                this.play();
              }
            }
          } catch (e) {
            console.log('Could not restore player state');
          }
        }
        
        // Synchronized playback
        broadcastState() {
          try {
            db.room(ROOM_ID).broadcast('player-state', {
              url: this.currentTrack?.url,
              time: this.audio.currentTime,
              playing: this.isPlaying
            });
          } catch (e) {
            // Room not available
          }
        }
        
        handleRemoteState(state) {
          if (!state.url) return;
          
          // Load track if different
          if (this.currentTrack?.url !== state.url) {
            this.loadTrack(state.url);
          }
          
          // Sync playback position (within 2 second tolerance)
          if (Math.abs(this.audio.currentTime - state.time) > 2) {
            this.audio.currentTime = state.time;
          }
          
          // Sync play/pause
          if (state.playing && !this.isPlaying) {
            this.play();
          } else if (!state.playing && this.isPlaying) {
            this.pause();
          }
        }
      }
      
      if (!customElements.get('audio-player')) {
        customElements.define('audio-player', AudioPlayerElement);
      }
    </script>
  `;
}

