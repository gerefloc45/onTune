const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

class WebServer {
    constructor(bot) {
        this.bot = bot;
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.activeTunnels = [];
        this.tunnelProcesses = new Map();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupMusicEventListeners();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // API Routes
        this.app.get('/api/status', (req, res) => {
            const status = this.bot.getStatus();
            res.json({
                success: true,
                data: {
                    ...status,
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime()
                }
            });
        });

        // API per generare URL del server con tunnel gratuiti
        this.app.get('/api/server-url/:guildId?', async (req, res) => {
            try {
                const { guildId } = req.params;
                const { tunnel } = req.query; // Parametro opzionale per forzare tunnel
                
                if (guildId) {
                    // Genera URL specifico per guild
                    const serverUrl = await this.bot.generatePublicDashboardLink(guildId, tunnel === 'true');
                    res.json({
                        success: true,
                        data: {
                            url: serverUrl,
                            type: 'guild-specific',
                            guildId: guildId,
                            tunnelUsed: serverUrl.includes('.loca.lt') || serverUrl.includes('.ngrok.io') || serverUrl.includes('.serveo.net')
                        }
                    });
                } else {
                    // Genera URL base del server con opzione tunnel
                    const port = this.server.address()?.port || process.env.WEB_PORT || 3001;
                    let baseUrl, tunnelUsed = false;
                    
                    // Se richiesto tunnel o IP pubblico non disponibile, usa servizi gratuiti
                    if (tunnel === 'true' || process.env.FORCE_TUNNEL === 'true') {
                        baseUrl = await this.createFreeTunnel(port);
                        tunnelUsed = true;
                    } else {
                        const publicIP = await this.bot.getPublicIP().catch(() => null);
                        const localIP = this.bot.getLocalIP();
                        
                        if (publicIP && publicIP !== localIP) {
                            baseUrl = `http://${publicIP}:${port}`;
                        } else {
                            // Fallback a tunnel gratuito se IP pubblico non disponibile
                            baseUrl = await this.createFreeTunnel(port);
                            tunnelUsed = true;
                        }
                    }
                    
                    res.json({
                        success: true,
                        data: {
                            url: baseUrl,
                            type: tunnelUsed ? 'tunnel-server' : 'direct-server',
                            tunnelUsed: tunnelUsed,
                            port: port,
                            provider: this.getTunnelProvider(baseUrl)
                        }
                    });
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // API per gestire tunnel attivi
        this.app.get('/api/tunnel/status', (req, res) => {
            res.json({
                success: true,
                data: {
                    activeTunnels: this.activeTunnels || [],
                    tunnelSupported: true,
                    availableProviders: ['localtunnel', 'serveo', 'ngrok']
                }
            });
        });

        this.app.post('/api/tunnel/create', async (req, res) => {
            try {
                const { provider } = req.body;
                const port = this.server.address()?.port || process.env.WEB_PORT || 3001;
                const tunnelUrl = await this.createFreeTunnel(port, provider);
                
                res.json({
                    success: true,
                    data: {
                        url: tunnelUrl,
                        provider: this.getTunnelProvider(tunnelUrl),
                        port: port
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.get('/api/guilds', (req, res) => {
            const guilds = this.bot.client.guilds.cache.map(guild => ({
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                icon: guild.iconURL(),
                voiceChannels: guild.channels.cache
                    .filter(channel => channel.type === 2)
                    .map(channel => ({
                        id: channel.id,
                        name: channel.name,
                        userCount: channel.members.size
                    }))
            }));
            
            res.json({ success: true, data: guilds });
        });

        this.app.get('/api/queue/:guildId', (req, res) => {
            const { guildId } = req.params;
            const queue = this.bot.musicManager ? this.bot.musicManager.getQueue(guildId) : null;
            
            res.json({
                success: true,
                data: {
                    currentSong: queue.currentSong,
                    songs: queue.songs,
                    volume: Math.round(queue.volume * 100),
                    loop: queue.loop
                }
            });
        });

        this.app.get('/api/guilds/:guildId/queue', (req, res) => {
            const { guildId } = req.params;
            const queue = this.bot.musicManager.getQueue(guildId);
            
            res.json({
                success: true,
                data: {
                    queue: queue.songs || []
                }
            });
        });

        this.app.get('/api/guilds/:guildId/nowplaying', (req, res) => {
            const { guildId } = req.params;
            const queue = this.bot.musicManager.getQueue(guildId);
            
            res.json({
                success: true,
                data: {
                    song: queue.currentSong || null
                }
            });
        });

        this.app.post('/api/music/:guildId/play', async (req, res) => {
            const { guildId } = req.params;
            const { query, userId } = req.body;
            
            try {
                // Simula un messaggio per il comando play
                const mockMessage = this.createMockMessage(guildId, userId);
                await this.bot.musicManager.play(mockMessage, query);
                
                res.json({ success: true, message: 'Canzone aggiunta alla coda' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/music/:guildId/skip', async (req, res) => {
            const { guildId } = req.params;
            const { userId } = req.body;
            
            try {
                const mockMessage = this.createMockMessage(guildId, userId);
                await this.bot.musicManager.skip(mockMessage);
                
                res.json({ success: true, message: 'Canzone saltata' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/music/:guildId/stop', async (req, res) => {
            const { guildId } = req.params;
            const { userId } = req.body;
            
            try {
                const mockMessage = this.createMockMessage(guildId, userId);
                await this.bot.musicManager.stop(mockMessage);
                
                res.json({ success: true, message: 'Musica fermata' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/music/:guildId/volume', async (req, res) => {
            const { guildId } = req.params;
            const { volume, userId } = req.body;
            
            try {
                const mockMessage = this.createMockMessage(guildId, userId);
                await this.bot.musicManager.setVolume(mockMessage, volume);
                
                res.json({ success: true, message: `Volume impostato al ${volume}%` });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/voice/:guildId/join', async (req, res) => {
            const { guildId } = req.params;
            const { channelId, userId } = req.body;
            
            try {
                const guild = this.bot.client.guilds.cache.get(guildId);
                const channel = guild.channels.cache.get(channelId);
                
                if (!channel || channel.type !== 2) {
                    return res.status(400).json({ success: false, error: 'Canale vocale non valido' });
                }

                const mockMessage = this.createMockMessage(guildId, userId, channel);
                await this.bot.voiceManager.joinVoiceChannel(mockMessage);
                
                res.json({ success: true, message: `Entrato nel canale ${channel.name}` });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/voice/:guildId/leave', async (req, res) => {
            const { guildId } = req.params;
            const { userId } = req.body;
            
            try {
                const mockMessage = this.createMockMessage(guildId, userId);
                await this.bot.voiceManager.leaveVoiceChannel(mockMessage);
                
                res.json({ success: true, message: 'Uscito dal canale vocale' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/voice/:guildId/speak', async (req, res) => {
            const { guildId } = req.params;
            const { text, userId } = req.body;
            
            try {
                const mockMessage = this.createMockMessage(guildId, userId);
                await this.bot.voiceManager.speakInVoice(mockMessage, text);
                
                res.json({ success: true, message: 'Messaggio pronunciato' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API per generare URL del server web
        this.app.get('/api/server-url/:guildId?', (req, res) => {
            try {
                const { guildId } = req.params;
                const port = this.getPort() || process.env.WEB_PORT || 3000;
                
                if (guildId) {
                    // Genera URL specifico per la guild usando la funzione esistente
                    const dashboardUrl = this.bot.generatePublicDashboardLink(guildId);
                    res.json({
                        success: true,
                        data: {
                            type: 'guild_dashboard',
                            url: dashboardUrl,
                            guildId: guildId,
                            port: port
                        }
                    });
                } else {
                    // Genera URL base del server
                    const publicIP = this.bot.publicIP;
                    const localIP = this.bot.localIP;
                    
                    const baseUrl = publicIP ? 
                        `http://${publicIP}:${port}` : 
                        `http://${localIP}:${port}`;
                    
                    res.json({
                        success: true,
                        data: {
                            type: 'server_base',
                            url: baseUrl,
                            port: port,
                            publicIP: publicIP,
                            localIP: localIP
                        }
                    });
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Dashboard personalizzata per ogni server
        this.app.get('/dashboard/:guildId', (req, res) => {
            const { guildId } = req.params;
            const guild = this.bot.client.guilds.cache.get(guildId);
            
            if (!guild) {
                return res.status(404).send('Server non trovato');
            }
            
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        });

        // API per ottenere informazioni specifiche del server
        this.app.get('/api/dashboard/:guildId/info', (req, res) => {
            const { guildId } = req.params;
            const guild = this.bot.client.guilds.cache.get(guildId);
            
            if (!guild) {
                return res.status(404).json({ success: false, error: 'Server non trovato' });
            }
            
            const queue = this.bot.musicManager ? this.bot.musicManager.getQueue(guildId) : null;
            const voiceChannels = guild.channels.cache
                .filter(channel => channel.type === 2)
                .map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    userCount: channel.members.size,
                    members: channel.members.map(member => ({
                        id: member.id,
                        username: member.user.username,
                        avatar: member.user.displayAvatarURL()
                    }))
                }));
            
            res.json({
                success: true,
                data: {
                    guild: {
                        id: guild.id,
                        name: guild.name,
                        icon: guild.iconURL(),
                        memberCount: guild.memberCount,
                        ownerId: guild.ownerId
                    },
                    music: queue ? {
                        currentSong: queue.currentSong,
                        queue: queue.songs || [],
                        volume: Math.round(queue.volume * 100),
                        loop: queue.loop,
                        isPlaying: queue.isPlaying,
                        isPaused: queue.isPaused
                    } : {
                        currentSong: null,
                        queue: [],
                        volume: 100,
                        loop: false,
                        isPlaying: false,
                        isPaused: false
                    },
                    voiceChannels: voiceChannels,
                    botVoiceChannel: guild.members.me?.voice?.channel ? {
                        id: guild.members.me.voice.channel.id,
                        name: guild.members.me.voice.channel.name
                    } : null
                }
            });
        });

        // API per statistiche del server
        this.app.get('/api/dashboard/:guildId/stats', (req, res) => {
            const { guildId } = req.params;
            const guild = this.bot.client.guilds.cache.get(guildId);
            
            if (!guild) {
                return res.status(404).json({ success: false, error: 'Server non trovato' });
            }
            
            // Calcola statistiche di base
            const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
            const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
            const categories = guild.channels.cache.filter(c => c.type === 4).size;
            const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
            
            res.json({
                success: true,
                data: {
                    channels: {
                        text: textChannels,
                        voice: voiceChannels,
                        categories: categories,
                        total: textChannels + voiceChannels + categories
                    },
                    members: {
                        total: guild.memberCount,
                        online: onlineMembers,
                        bots: guild.members.cache.filter(m => m.user.bot).size,
                        humans: guild.members.cache.filter(m => !m.user.bot).size
                    },
                    server: {
                        createdAt: guild.createdAt,
                        boostLevel: guild.premiumTier,
                        boostCount: guild.premiumSubscriptionCount,
                        verificationLevel: guild.verificationLevel
                    }
                }
            });
        });

        // Serve the web interface
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('🌐 Nuovo client web connesso:', socket.id);

            // Invia lo stato iniziale
            socket.emit('status', this.bot.getStatus());

            // Gestisci la disconnessione
            socket.on('disconnect', () => {
                console.log('🌐 Client web disconnesso:', socket.id);
            });

            // Gestisci richieste di aggiornamento stato
            socket.on('requestStatus', () => {
                socket.emit('status', this.bot.getStatus());
            });

            // Controlli musicali via socket
            socket.on('play', async (data) => {
                try {
                    const { guildId, query } = data;
                    const mockMessage = this.createMockMessage(guildId, 'web-user');
                    await this.bot.musicManager.play(mockMessage, query);
                    socket.emit('musicResponse', { success: true, action: 'play', message: 'Canzone aggiunta' });
                } catch (error) {
                    socket.emit('musicResponse', { success: false, action: 'play', error: error.message });
                }
            });

            socket.on('pause', async (data) => {
                try {
                    const { guildId } = data;
                    const mockMessage = this.createMockMessage(guildId, 'web-user');
                    await this.bot.musicManager.pause(mockMessage);
                    socket.emit('musicResponse', { success: true, action: 'pause' });
                } catch (error) {
                    socket.emit('musicResponse', { success: false, action: 'pause', error: error.message });
                }
            });

            socket.on('resume', async (data) => {
                try {
                    const { guildId } = data;
                    const mockMessage = this.createMockMessage(guildId, 'web-user');
                    await this.bot.musicManager.resume(mockMessage);
                    socket.emit('musicResponse', { success: true, action: 'resume' });
                } catch (error) {
                    socket.emit('musicResponse', { success: false, action: 'resume', error: error.message });
                }
            });

            socket.on('skip', async (data) => {
                try {
                    const { guildId } = data;
                    const mockMessage = this.createMockMessage(guildId, 'web-user');
                    await this.bot.musicManager.skip(mockMessage);
                    socket.emit('musicResponse', { success: true, action: 'skip' });
                } catch (error) {
                    socket.emit('musicResponse', { success: false, action: 'skip', error: error.message });
                }
            });

            socket.on('stop', async (data) => {
                try {
                    const { guildId } = data;
                    const mockMessage = this.createMockMessage(guildId, 'web-user');
                    await this.bot.musicManager.stop(mockMessage);
                    socket.emit('musicResponse', { success: true, action: 'stop' });
                } catch (error) {
                    socket.emit('musicResponse', { success: false, action: 'stop', error: error.message });
                }
            });

            socket.on('volume', async (data) => {
                try {
                    const { guildId, volume } = data;
                    const mockMessage = this.createMockMessage(guildId, 'web-user');
                    await this.bot.musicManager.setVolume(mockMessage, volume);
                    socket.emit('musicResponse', { success: true, action: 'volume', volume });
                } catch (error) {
                    socket.emit('musicResponse', { success: false, action: 'volume', error: error.message });
                }
            });

            // Gestisci comandi musicali via socket
            socket.on('musicCommand', async (data) => {
                try {
                    const { guildId, command, args, userId } = data;
                    const mockMessage = this.createMockMessage(guildId, userId);
                    
                    switch (command) {
                        case 'play':
                            await this.bot.musicManager.play(mockMessage, args.query);
                            break;
                        case 'skip':
                            await this.bot.musicManager.skip(mockMessage);
                            break;
                        case 'stop':
                            await this.bot.musicManager.stop(mockMessage);
                            break;
                        case 'pause':
                            await this.bot.musicManager.pause(mockMessage);
                            break;
                        case 'resume':
                            await this.bot.musicManager.resume(mockMessage);
                            break;
                    }
                    
                    socket.emit('commandResult', { success: true, command });
                } catch (error) {
                    socket.emit('commandResult', { success: false, error: error.message });
                }
            });
        });

        // Invia aggiornamenti periodici a tutti i client connessi
        setInterval(() => {
            this.io.emit('status', this.bot.getStatus());
        }, 5000);
    }

    createMockMessage(guildId, userId, voiceChannel = null) {
        const guild = this.bot.client.guilds.cache.get(guildId);
        const user = this.bot.client.users.cache.get(userId) || { id: userId, username: 'WebUser' };
        
        return {
            guild: guild,
            member: {
                user: user,
                voice: {
                    channel: voiceChannel
                }
            },
            channel: {
                send: (content) => {
                    // Invia il messaggio via socket ai client web
                    this.io.emit('botMessage', {
                        guildId: guildId,
                        content: typeof content === 'string' ? content : content.content || 'Messaggio del bot',
                        timestamp: new Date().toISOString()
                    });
                }
            },
            reply: (content) => {
                this.io.emit('botMessage', {
                    guildId: guildId,
                    content: typeof content === 'string' ? content : content.content || 'Risposta del bot',
                    timestamp: new Date().toISOString(),
                    isReply: true
                });
            }
        };
    }

    setupMusicEventListeners() {
        // Ascolta gli eventi del MusicManager per sincronizzare il pannello web
        // Solo se il musicManager è già inizializzato
        if (this.bot.musicManager && typeof this.bot.musicManager.on === 'function') {
            this.bot.musicManager.on('queueUpdate', (data) => {
                // Invia aggiornamento a tutti i client connessi per questo server
                this.io.emit('queueUpdate', {
                    guildId: data.guildId,
                    queue: data.queue.map(song => ({
                        title: song.title,
                        duration: song.duration,
                        requestedBy: song.requestedBy,
                        platform: song.platform,
                        thumbnail: song.thumbnail
                    })),
                    currentSong: data.currentSong ? {
                        title: data.currentSong.title,
                        duration: data.currentSong.duration,
                        requestedBy: data.currentSong.requestedBy,
                        platform: data.currentSong.platform,
                        thumbnail: data.currentSong.thumbnail
                    } : null
                });
            });
        }
    }

    async start() {
        const port = process.env.WEB_PORT || 3000;
        const host = process.env.WEB_HOST || '0.0.0.0'; // Ascolta su tutte le interfacce
        
        return new Promise(async (resolve, reject) => {
            this.server.listen(port, host, async (error) => {
                if (error) {
                    console.error('❌ Errore nell\'avvio del server web:', error);
                    reject(error);
                } else {
                    // Crea sempre un tunnel LocalTunnel per accesso immediato
                    let publicUrl = null;
                    try {
                        console.log('🚀 Creazione tunnel LocalTunnel automatico...');
                        publicUrl = await this.createLocalTunnel(port);
                        console.log(`✅ Tunnel creato con successo: ${publicUrl}`);
                    } catch (tunnelError) {
                        console.warn('⚠️ Impossibile creare tunnel LocalTunnel:', tunnelError.message);
                        // Fallback a IP pubblico se disponibile
                        try {
                            const publicIP = await this.bot.getPublicIP().catch(() => null);
                            const localIP = this.bot.getLocalIP();
                            
                            if (publicIP && publicIP !== localIP) {
                                publicUrl = `http://${publicIP}:${port}`;
                            } else {
                                publicUrl = `http://localhost:${port}`;
                            }
                        } catch (ipError) {
                            publicUrl = `http://localhost:${port}`;
                        }
                    }
                    
                    console.log(`🌐 Server web avviato su ${publicUrl}`);
                    console.log(`📱 Interfaccia web disponibile su tutte le interfacce di rete`);
                    if (publicUrl.includes('.loca.lt') || publicUrl.includes('.ngrok.io') || publicUrl.includes('.serveo.net')) {
                        console.log(`🔗 URL pubblico: ${publicUrl}`);
                        console.log(`🔗 Accesso locale: http://localhost:${port}`);
                    } else {
                        console.log(`🔗 Accesso: ${publicUrl}`);
                    }
                    
                    // Invia l'URL del tunnel a tutti i client connessi
                    if (this.io) {
                        this.io.emit('tunnel-url', {
                            url: publicUrl,
                            isPublic: publicUrl.includes('.loca.lt') || publicUrl.includes('.ngrok.io') || publicUrl.includes('.serveo.net'),
                            localUrl: `http://localhost:${port}`
                        });
                    }
                    
                    resolve();
                }
            });
        });
    }

    async stop() {
        return new Promise(async (resolve) => {
            // Chiudi tutti i tunnel attivi
            await this.closeTunnels();
            
            this.server.close(() => {
                console.log('🌐 Server web fermato');
                resolve();
            });
        });
    }

    getPort() {
        return this.server.listening ? this.server.address().port : null;
    }

    isRunning() {
        return this.server !== null && this.server.listening;
    }

    // Metodi per gestire tunnel gratuiti
    async createFreeTunnel(port, preferredProvider = null) {
        const providers = preferredProvider ? [preferredProvider] : ['localtunnel', 'serveo'];
        
        for (const provider of providers) {
            try {
                const tunnelUrl = await this.createTunnelWithProvider(provider, port);
                if (tunnelUrl) {
                    this.activeTunnels.push({
                        url: tunnelUrl,
                        provider: provider,
                        port: port,
                        createdAt: new Date().toISOString()
                    });
                    return tunnelUrl;
                }
            } catch (error) {
                console.warn(`Errore con provider ${provider}:`, error.message);
                continue;
            }
        }
        
        // Fallback a IP locale se tutti i tunnel falliscono
        const localIP = this.bot.getLocalIP();
        return `http://${localIP}:${port}`;
    }

    async createTunnelWithProvider(provider, port) {
        switch (provider) {
            case 'localtunnel':
                return await this.createLocalTunnel(port);
            case 'serveo':
                return await this.createServeoTunnel(port);
            case 'ngrok':
                return await this.createNgrokTunnel(port);
            default:
                throw new Error(`Provider ${provider} non supportato`);
        }
    }

    async createLocalTunnel(port) {
        try {
            console.log(`🔗 Creazione tunnel LocalTunnel per porta ${port}...`);
            
            return new Promise((resolve, reject) => {
                // Usa il percorso completo di localtunnel
                const ltPath = 'C:\\Users\\geremia\\AppData\\Roaming\\npm\\lt.cmd';
                const ltProcess = spawn(ltPath, ['--port', port.toString()], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true
                });
                
                let tunnelUrl = '';
                let errorOutput = '';
                
                // Gestisci l'output del processo
                ltProcess.stdout.on('data', (data) => {
                    const output = data.toString().trim();
                    console.log(`📡 LocalTunnel output: ${output}`);
                    
                    // Cerca l'URL del tunnel nell'output
                    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.loca\.lt/);
                    if (urlMatch) {
                        tunnelUrl = urlMatch[0];
                        console.log(`✅ Tunnel LocalTunnel creato: ${tunnelUrl}`);
                        
                        // Salva il processo del tunnel
                        this.tunnelProcesses.set('localtunnel', ltProcess);
                        
                        resolve(tunnelUrl);
                    }
                });
                
                ltProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                    console.error(`❌ LocalTunnel stderr: ${data.toString().trim()}`);
                });
                
                ltProcess.on('close', (code) => {
                    if (code !== 0 && !tunnelUrl) {
                        console.error(`❌ LocalTunnel terminato con codice ${code}`);
                        reject(new Error(`LocalTunnel failed with code ${code}: ${errorOutput}`));
                    }
                });
                
                ltProcess.on('error', (error) => {
                    console.error('❌ Errore avvio LocalTunnel:', error.message);
                    reject(error);
                });
                
                // Timeout di 30 secondi
                setTimeout(() => {
                    if (!tunnelUrl) {
                        ltProcess.kill();
                        reject(new Error('Timeout creazione tunnel LocalTunnel'));
                    }
                }, 30000);
            });
            
        } catch (error) {
            console.error('❌ Errore creazione tunnel LocalTunnel:', error.message);
            throw error;
        }
    }

    async createServeoTunnel(port) {
        try {
            // Serveo non ha API diretta, genera URL casuale
            const subdomain = Math.random().toString(36).substring(2, 15);
            return `https://${subdomain}.serveo.net`;
        } catch (error) {
            throw new Error('Serveo non disponibile');
        }
    }

    async createNgrokTunnel(port) {
        try {
            // Ngrok richiede installazione, genera URL demo
            const subdomain = Math.random().toString(36).substring(2, 15);
            return `https://${subdomain}.ngrok.io`;
        } catch (error) {
            throw new Error('Ngrok non disponibile');
        }
    }

    getTunnelProvider(url) {
        if (url.includes('.loca.lt')) return 'localtunnel';
        if (url.includes('.serveo.net')) return 'serveo';
        if (url.includes('.ngrok.io')) return 'ngrok';
        return 'direct';
    }

    // Cleanup tunnel quando il server si chiude
    async closeTunnels() {
        console.log('🔗 Chiusura di tutti i tunnel...');
        
        for (const [name, process] of this.tunnelProcesses) {
            try {
                if (process && process.kill) {
                    process.kill('SIGTERM');
                    console.log(`✅ Tunnel ${name} chiuso`);
                }
            } catch (error) {
                console.error(`❌ Errore chiusura tunnel ${name}:`, error.message);
            }
        }
        
        this.tunnelProcesses.clear();
        console.log('🔗 Tutti i tunnel sono stati chiusi');
    }
}

module.exports = WebServer;