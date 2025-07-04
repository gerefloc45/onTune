// Script JavaScript per il pannello web
class WebPanel {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentGuild = null;
        this.init();
    }

    init() {
        this.connectSocket();
        this.setupEventListeners();
        this.loadInitialData();
    }

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('✅ Connesso al server');
            this.isConnected = true;
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnesso dal server');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });

        this.socket.on('statusUpdate', (data) => {
            this.updateStatus(data);
        });

        this.socket.on('queueUpdate', (data) => {
            // Aggiorna solo se è per il server attualmente selezionato
            if (this.currentGuild && data.guildId === this.currentGuild) {
                this.updateQueue({ queue: data.queue });
                if (data.currentSong) {
                    this.updateNowPlaying({ song: data.currentSong });
                } else {
                    this.updateNowPlaying({ song: null });
                }
            }
        });

        this.socket.on('nowPlaying', (data) => {
            this.updateNowPlaying(data);
        });
    }

    setupEventListeners() {
        // Play button
        const playBtn = document.getElementById('playBtn');
        const playInput = document.getElementById('playInput');
        
        if (playBtn && playInput) {
            playBtn.addEventListener('click', () => {
                const query = playInput.value.trim();
                if (query) {
                    this.playMusic(query);
                    playInput.value = '';
                }
            });

            playInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    playBtn.click();
                }
            });
        }

        // Control buttons
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pauseMusic());
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.resumeMusic());
        document.getElementById('skipBtn')?.addEventListener('click', () => this.skipMusic());
        document.getElementById('stopBtn')?.addEventListener('click', () => this.stopMusic());

        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }

        // Guild selector
        const guildSelect = document.getElementById('guildSelect');
        if (guildSelect) {
            guildSelect.addEventListener('change', (e) => {
                this.selectGuild(e.target.value);
            });
        }

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadInitialData());
    }

    async loadInitialData() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            if (data.success) {
                this.updateStatus(data.data);
            }
        } catch (error) {
            console.error('Errore nel caricamento dati:', error);
            this.showError('Errore nel caricamento dei dati');
        }

        try {
            const response = await fetch('/api/guilds');
            const data = await response.json();
            
            if (data.success) {
                this.updateGuildsList(data.data);
            }
        } catch (error) {
            console.error('Errore nel caricamento server:', error);
        }
    }

    updateConnectionStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot && statusText) {
            if (connected) {
                statusDot.style.background = 'var(--secondary)';
                statusText.textContent = 'Online';
            } else {
                statusDot.style.background = 'var(--danger)';
                statusText.textContent = 'Offline';
            }
        }
    }

    updateStatus(data) {
        // Aggiorna statistiche bot
        document.getElementById('guildsCount').textContent = data.guilds || '0';
        document.getElementById('usersCount').textContent = data.users || '0';
        document.getElementById('queuesCount').textContent = data.musicQueues || '0';
        document.getElementById('connectionsCount').textContent = data.voiceConnections || '0';
        
        // Aggiorna uptime
        if (data.uptime) {
            document.getElementById('uptime').textContent = this.formatUptime(data.uptime);
        }
    }

    updateGuildsList(guilds) {
        const guildSelect = document.getElementById('guildSelect');
        if (!guildSelect) return;

        guildSelect.innerHTML = '<option value="">Seleziona un server...</option>';
        
        guilds.forEach(guild => {
            const option = document.createElement('option');
            option.value = guild.id;
            option.textContent = `${guild.name} (${guild.memberCount} membri)`;
            guildSelect.appendChild(option);
        });
    }

    updateQueue(data) {
        const queueContainer = document.getElementById('queueContainer');
        if (!queueContainer) return;

        if (!data.queue || data.queue.length === 0) {
            queueContainer.innerHTML = '<p class="text-center text-muted">Nessuna canzone in coda</p>';
            return;
        }

        queueContainer.innerHTML = data.queue.map((song, index) => `
            <div class="queue-item">
                <img src="${song.thumbnail || '/placeholder.jpg'}" alt="Thumbnail" class="queue-thumbnail">
                <div class="queue-info">
                    <div class="queue-title">${song.title}</div>
                    <div class="queue-meta">${song.duration} • ${song.platform}</div>
                </div>
                <span class="queue-position">#${index + 1}</span>
            </div>
        `).join('');
    }

    updateNowPlaying(data) {
        const nowPlayingContainer = document.getElementById('nowPlayingContainer');
        if (!nowPlayingContainer) return;

        if (!data.song) {
            nowPlayingContainer.innerHTML = '<p class="text-center text-muted">Nessuna canzone in riproduzione</p>';
            return;
        }

        nowPlayingContainer.innerHTML = `
            <div class="queue-item">
                <img src="${data.song.thumbnail || '/placeholder.jpg'}" alt="Thumbnail" class="queue-thumbnail">
                <div class="queue-info">
                    <div class="queue-title">${data.song.title}</div>
                    <div class="queue-meta">${data.song.duration} • ${data.song.platform}</div>
                </div>
                <div class="playback-controls">
                    <button class="btn btn-sm" onclick="webPanel.pauseMusic()"><i class="fas fa-pause"></i></button>
                    <button class="btn btn-sm" onclick="webPanel.skipMusic()"><i class="fas fa-forward"></i></button>
                </div>
            </div>
        `;
    }

    // Controlli musicali
    playMusic(query) {
        if (!this.currentGuild) {
            this.showError('Seleziona prima un server');
            return;
        }

        this.socket.emit('play', {
            guildId: this.currentGuild,
            query: query
        });

        this.showSuccess(`Riproduzione: ${query}`);
    }

    pauseMusic() {
        if (!this.currentGuild) return;
        this.socket.emit('pause', { guildId: this.currentGuild });
    }

    resumeMusic() {
        if (!this.currentGuild) return;
        this.socket.emit('resume', { guildId: this.currentGuild });
    }

    skipMusic() {
        if (!this.currentGuild) return;
        this.socket.emit('skip', { guildId: this.currentGuild });
    }

    stopMusic() {
        if (!this.currentGuild) return;
        this.socket.emit('stop', { guildId: this.currentGuild });
    }

    setVolume(volume) {
        if (!this.currentGuild) return;
        this.socket.emit('volume', { 
            guildId: this.currentGuild, 
            volume: parseInt(volume) 
        });
        
        document.getElementById('volumeValue').textContent = volume + '%';
    }

    selectGuild(guildId) {
        this.currentGuild = guildId;
        if (guildId) {
            this.loadGuildData(guildId);
        }
    }

    async loadGuildData(guildId) {
        try {
            const response = await fetch(`/api/guilds/${guildId}/queue`);
            const data = await response.json();
            
            if (data.success) {
                this.updateQueue(data.data);
            }
        } catch (error) {
            console.error('Errore nel caricamento coda:', error);
        }

        try {
            const response = await fetch(`/api/guilds/${guildId}/nowplaying`);
            const data = await response.json();
            
            if (data.success) {
                this.updateNowPlaying(data.data);
            }
        } catch (error) {
            console.error('Errore nel caricamento brano corrente:', error);
        }
    }

    // Utility functions
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours}h ${minutes}m ${secs}s`;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Crea una notifica temporanea
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inizializza il pannello web quando la pagina è caricata
let webPanel;
document.addEventListener('DOMContentLoaded', () => {
    webPanel = new WebPanel();
});

// Esporta per uso globale
window.webPanel = webPanel;