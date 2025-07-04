const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ytdl = require('@distube/ytdl-core');
const yts = require('youtube-sr').default;
const { SoundCloud } = require('scdl-core');
const SpotifyWebApi = require('spotify-web-api-node');
const { exec } = require('child_process');
const { EventEmitter } = require('events');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Carica configurazione performance
const performanceConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'performance.json'), 'utf8'));

class MusicManager extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.queues = new Map();
        this.players = new Map();
        this.connections = new Map();
        this.ffmpegAvailable = false;
        
        // Cache per migliorare le performance (configurazione da file)
        this.searchCache = new Map(); // Cache per ricerche YouTube
        this.urlCache = new Map(); // Cache per URL di streaming
        this.metadataCache = new Map(); // Cache per metadati
        
        // Configurazione cache da file performance.json
        this.cacheConfig = {
            searchTTL: performanceConfig.cache.search.ttl,
            urlTTL: performanceConfig.cache.url.ttl,
            metadataTTL: performanceConfig.cache.metadata.ttl,
            maxSize: performanceConfig.cache.max_size,
            cleanupInterval: performanceConfig.cache.cleanup_interval.value
        };
        
        // Pool di connessioni per ottimizzare le richieste (configurazione da file)
        this.connectionPool = {
            youtube: new Map(),
            spotify: new Map(),
            maxConnections: performanceConfig.connection_pool.max_connections,
            timeout: performanceConfig.connection_pool.timeout_ms,
            retryAttempts: performanceConfig.connection_pool.retry_attempts
        };
        

        
        // Inizializza Spotify API
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        });
        
        // Sistema di cleanup automatico per evitare memory leaks
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 300000); // Cleanup ogni 5 minuti
        
        this.initialize();
    }

    async initialize() {
        await this.checkDependencies();
        this.initializeSpotify();
        this.setupCacheCleanup();
    }

    async checkDependencies() {
        try {
            await this.checkFFmpeg();
            this.ffmpegAvailable = true;
            logger.music('✅ FFmpeg disponibile - Sistema musicale attivo');
        } catch (error) {
            this.ffmpegAvailable = false;
            logger.error('❌ FFmpeg non trovato. Installa FFmpeg per usare le funzionalità musicali.');
            logger.error('💡 Guida: Aggiungi C:\\ffmpeg\\ffmpeg-*\\bin al PATH di sistema');
        }
    }

    async initializeSpotify() {
        if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
            try {
                const data = await this.spotifyApi.clientCredentialsGrant();
                this.spotifyApi.setAccessToken(data.body['access_token']);
                
                // Auto-refresh token ogni 50 minuti
                setInterval(async () => {
                    try {
                        const refreshData = await this.spotifyApi.clientCredentialsGrant();
                        this.spotifyApi.setAccessToken(refreshData.body['access_token']);
                    } catch (error) {
                        logger.error('❌ Errore nel refresh token Spotify:', error.message);
                    }
                }, 50 * 60 * 1000);
                
                logger.music('✅ Spotify API inizializzata con auto-refresh');
            } catch (error) {
                logger.error('❌ Errore nell\'inizializzazione di Spotify:', error.message);
            }
        } else {
            logger.music('⚠️ Credenziali Spotify non configurate - funzionalità Spotify disabilitate');
        }
    }
    
    setupCacheCleanup() {
        // Pulizia cache configurabile da file performance.json
        setInterval(() => {
            const now = Date.now();
            
            // Pulisci cache ricerche
            for (const [key, data] of this.searchCache.entries()) {
                if (now - data.timestamp > this.cacheConfig.searchTTL) {
                    this.searchCache.delete(key);
                }
            }
            
            // Pulisci cache URL
            for (const [key, data] of this.urlCache.entries()) {
                if (now - data.timestamp > this.cacheConfig.urlTTL) {
                    this.urlCache.delete(key);
                }
            }
            
            // Pulisci cache metadati
            for (const [key, data] of this.metadataCache.entries()) {
                if (now - data.timestamp > this.cacheConfig.metadataTTL) {
                    this.metadataCache.delete(key);
                }
            }
            
            // Controlla dimensioni massime cache e rimuovi elementi più vecchi se necessario
            this.enforceMaxCacheSize();
            
            logger.music(`🧹 Cache pulita - Ricerche: ${this.searchCache.size}, URL: ${this.urlCache.size}, Metadati: ${this.metadataCache.size}`);
        }, this.cacheConfig.cleanupInterval);
    }
    
    enforceMaxCacheSize() {
        // Controlla e limita dimensioni cache ricerche
        if (this.searchCache.size > this.cacheConfig.maxSize.search) {
            const entries = Array.from(this.searchCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.cacheConfig.maxSize.search);
            toRemove.forEach(([key]) => this.searchCache.delete(key));
        }
        
        // Controlla e limita dimensioni cache URL
        if (this.urlCache.size > this.cacheConfig.maxSize.url) {
            const entries = Array.from(this.urlCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.cacheConfig.maxSize.url);
            toRemove.forEach(([key]) => this.urlCache.delete(key));
        }
        
        // Controlla e limita dimensioni cache metadati
        if (this.metadataCache.size > this.cacheConfig.maxSize.metadata) {
            const entries = Array.from(this.metadataCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.cacheConfig.maxSize.metadata);
            toRemove.forEach(([key]) => this.metadataCache.delete(key));
        }
    }
    
    async preloadNextSong(guildId) {
        try {
            const queue = this.getQueue(guildId);
            if (queue.songs.length === 0) return;
            
            const nextSong = queue.songs[0];
            if (!nextSong || nextSong.preloaded) return;
            
            // Preload URL di streaming in background
            if (nextSong.platform === '🎥 YouTube') {
                const cacheKey = `stream:${nextSong.url}`;
                if (!this.urlCache.has(cacheKey)) {
                    try {
                        const streamUrl = await ytdl.getInfo(nextSong.url);
                        this.urlCache.set(cacheKey, {
                            data: streamUrl,
                            timestamp: Date.now()
                        });
                        nextSong.preloaded = true;
                        logger.music(`🚀 Preload completato per: ${nextSong.title}`);
                    } catch (error) {
                        logger.error('Errore preload:', error.message);
                    }
                }
            }
        } catch (error) {
            logger.error('Errore nel preload:', error.message);
        }
    }

    checkFFmpeg() {
        return new Promise((resolve, reject) => {
            exec('ffmpeg -version', (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                songs: [],
                currentSong: null,
                volume: parseFloat(process.env.DEFAULT_VOLUME) || 0.5,
                loop: false,
                loopQueue: false,
                shuffle: false,
                textChannel: null,
                history: []
            });
        }
        return this.queues.get(guildId);
    }

    async play(message, query) {
        // Validazioni rapide
        if (!this.ffmpegAvailable) {
            return message.reply('❌ Sistema musicale non disponibile. FFmpeg non è installato.\n💡 Aggiungi C:\\ffmpeg\\ffmpeg-*\\bin al PATH di sistema e riavvia il bot.');
        }

        if (!query) {
            return message.reply('❌ Fornisci il nome di una canzone o un URL (YouTube, SoundCloud, Spotify)!');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Devi essere in un canale vocale per riprodurre musica!');
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply('❌ Non ho i permessi per entrare o parlare in questo canale vocale!');
        }

        // Messaggio di caricamento per feedback immediato
        const loadingMessage = await message.reply('🔍 Cercando la canzone...');

        try {
            // Ricerca parallela per migliorare velocità
            const [song, queue] = await Promise.all([
                this.searchSong(query, message.author),
                Promise.resolve(this.getQueue(message.guild.id))
            ]);
            
            if (!song) {
                return loadingMessage.edit('❌ Nessuna canzone trovata!');
            }

            queue.textChannel = message.channel;
            
            // Ottimizzazione: preload della prossima canzone se la coda è vuota
            const isFirstSong = queue.songs.length === 0 && !queue.currentSong;
            
            // Aggiungi la canzone alla coda
            if (queue.shuffle && queue.songs.length > 0) {
                // Se shuffle è attivo, inserisci in posizione casuale
                const randomIndex = Math.floor(Math.random() * (queue.songs.length + 1));
                queue.songs.splice(randomIndex, 0, song);
            } else {
                // Altrimenti aggiungi alla fine
                queue.songs.push(song);
            }

            // Emetti evento per aggiornare il pannello web (non bloccante)
            setImmediate(() => {
                this.emit('queueUpdate', {
                    guildId: message.guild.id,
                    queue: queue.songs,
                    currentSong: queue.currentSong
                });
            });

            // Connessione parallela se necessaria
            if (!this.connections.has(message.guild.id)) {
                await this.createConnection(voiceChannel, message.guild.id);
            }

            if (isFirstSong) {
                await loadingMessage.edit('▶️ Avviando la riproduzione...');
                await this.playNext(message.guild.id);
            } else {
                // Preload della prossima canzone in background
                if (queue.songs.length === 1) {
                    setImmediate(() => this.preloadNextSong(message.guild.id));
                }
                
                const embed = new EmbedBuilder()
                    .setTitle('🎵 Canzone Aggiunta alla Coda')
                    .setDescription(`**${song.title}**`)
                    .addFields(
                        { name: 'Durata', value: song.duration, inline: true },
                        { name: 'Richiesta da', value: song.requestedBy, inline: true },
                        { name: 'Posizione in coda', value: `${queue.songs.length}`, inline: true },
                        { name: 'Piattaforma', value: song.platform || '🎥 YouTube', inline: true }
                    )
                    .setThumbnail(song.thumbnail)
                    .setColor('#00ff00');

                await loadingMessage.edit({ content: '', embeds: [embed] });
            }
        } catch (error) {
            logger.error('Errore nella riproduzione:', error);
            message.reply('❌ Errore durante la riproduzione della canzone.');
        }
    }

    async searchSong(query, user = null) {
        try {
            let song;
            const platform = this.detectPlatform(query);
            const isURL = this.isValidURL(query);
            
            logger.music(`🔍 Ricerca: ${query} | Piattaforma: ${platform} | URL: ${isURL}`);
            
            switch (platform) {
                case 'youtube':
                    song = await this.searchYouTube(query, isURL, user);
                    break;
                case 'soundcloud':
                    song = await this.searchSoundCloud(query, isURL, user);
                    break;
                case 'spotify':
                    song = await this.searchSpotify(query, isURL, user);
                    break;
                case 'bandcamp':
                    // Per ora fallback su YouTube per Bandcamp
                    song = await this.searchYouTube(query.replace('bandcamp.com', ''), false, user);
                    break;
                default:
                    // Ricerca testuale - prova prima YouTube, poi SoundCloud
                    song = await this.searchYouTube(query, false, user);
                    if (!song) {
                        song = await this.searchSoundCloud(query, false, user);
                    }
                    break;
            }
            
            if (song) {
                logger.music(`✅ Trovata: ${song.title} da ${song.platform}`);
            } else {
                logger.music(`❌ Nessun risultato per: ${query}`);
            }
            
            return song;
        } catch (error) {
            logger.error('Errore nella ricerca:', error);
            return null;
        }
    }

    isSoundCloudURL(url) {
        return url.includes('soundcloud.com') || url.includes('snd.sc');
    }

    isSpotifyURL(url) {
        return url.includes('spotify.com') || url.includes('open.spotify.com') || url.includes('spoti.fi');
    }

    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    detectPlatform(query) {
        if (ytdl.validateURL(query) || query.includes('youtube.com') || query.includes('youtu.be')) {
            return 'youtube';
        }
        if (this.isSoundCloudURL(query)) {
            return 'soundcloud';
        }
        if (this.isSpotifyURL(query)) {
            return 'spotify';
        }
        if (query.includes('bandcamp.com')) {
            return 'bandcamp';
        }
        return 'search';
    }

    async searchYouTube(query, isURL = false, user = null) {
        try {
            // Controlla cache prima di fare la ricerca
            const cacheKey = `${isURL ? 'url' : 'search'}:${query}`;
            const cached = this.searchCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) { // 15 minuti
                return cached.data;
            }
            
            let result;
            
            if (isURL) {
                // Controlla cache URL specifica
                const urlCached = this.urlCache.get(query);
                if (urlCached && Date.now() - urlCached.timestamp < 30 * 60 * 1000) { // 30 minuti per URL
                    return urlCached.data;
                }
                
                const info = await ytdl.getInfo(query);
                result = {
                    title: info.videoDetails.title,
                    url: info.videoDetails.video_url,
                    duration: this.formatDuration(info.videoDetails.lengthSeconds),
                    thumbnail: info.videoDetails.thumbnails[0]?.url,
                    requestedBy: user ? user.displayName || user.username : 'Utente',
                    platform: '🎥 YouTube'
                };
                
                // Salva in cache URL
                this.urlCache.set(query, {
                    data: result,
                    timestamp: Date.now()
                });
            } else {
                const searchResults = await yts.search(query, { limit: 1 });
                if (searchResults.length === 0) return null;
                
                const video = searchResults[0];
                result = {
                    title: video.title,
                    url: video.url,
                    duration: video.durationFormatted,
                    thumbnail: video.thumbnail?.url,
                    requestedBy: user ? user.displayName || user.username : 'Utente',
                    platform: '🎥 YouTube'
                };
            }
            
            // Salva in cache ricerche
            this.searchCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            return result;
        } catch (error) {
            logger.error('Errore ricerca YouTube:', error);
            return null;
        }
    }

    async searchSoundCloud(query, isURL = false, user = null) {
        try {
            // Assicurati che SoundCloud sia connesso
            await SoundCloud.connect();
            
            if (isURL) {
                const info = await SoundCloud.tracks.getTrack(query);
                if (!info || !info.streamable) {
                    logger.error('Traccia SoundCloud non streamabile o non disponibile');
                    return null;
                }
                return {
                    title: info.title,
                    url: query,
                    duration: this.formatDuration(Math.floor(info.duration / 1000)),
                    thumbnail: info.artwork_url,
                    requestedBy: user ? user.displayName || user.username : 'Utente',
                    platform: '🎵 SoundCloud'
                };
            } else {
                const searchResults = await SoundCloud.search({
                    query: query,
                    limit: 1,
                    filter: 'tracks'
                });
                if (!searchResults || !searchResults.collection || searchResults.collection.length === 0) return null;
                
                const track = searchResults.collection[0];
                if (!track.streamable) {
                    logger.error('Traccia SoundCloud trovata ma non streamabile');
                    return null;
                }
                return {
                    title: track.title,
                    url: track.permalink_url,
                    duration: this.formatDuration(Math.floor(track.duration / 1000)),
                    thumbnail: track.artwork_url,
                    requestedBy: user ? user.displayName || user.username : 'Utente',
                    platform: '🎵 SoundCloud'
                };
            }
        } catch (error) {
            logger.error('Errore ricerca SoundCloud:', error.message);
            // Se SoundCloud fallisce, prova a cercare su YouTube come fallback
            if (!isURL) {
                logger.music('🔄 SoundCloud non disponibile, tentativo con YouTube...');
                const youtubeResult = await this.searchYouTube(query + ' soundcloud', false, user);
                if (youtubeResult) {
                    youtubeResult.platform = '🎥 YouTube (SoundCloud non disponibile)';
                    return youtubeResult;
                }
            }
            return null;
        }
    }

    async searchSpotify(query, isURL = false, user = null) {
        try {
            if (!process.env.SPOTIFY_CLIENT_ID) {
                logger.error('Credenziali Spotify non configurate');
                return null;
            }

            let trackId;
            if (isURL) {
                const match = query.match(/track\/([a-zA-Z0-9]+)/);
                if (!match) return null;
                trackId = match[1];
            } else {
                const searchResults = await this.spotifyApi.searchTracks(query, { limit: 1 });
                if (!searchResults.body.tracks.items.length) return null;
                trackId = searchResults.body.tracks.items[0].id;
            }

            const track = await this.spotifyApi.getTrack(trackId);
            const trackData = track.body;
            
            // Per Spotify, cerchiamo l'equivalente su YouTube per la riproduzione
            const youtubeQuery = `${trackData.artists[0].name} ${trackData.name}`;
            const youtubeResult = await this.searchYouTube(youtubeQuery, false, user);
            
            if (!youtubeResult) {
                throw new Error('Impossibile trovare equivalente YouTube per il brano Spotify');
            }

            return {
                title: `${trackData.artists[0].name} - ${trackData.name}`,
                url: youtubeResult.url, // Usa l'URL YouTube per la riproduzione
                duration: this.formatDuration(Math.floor(trackData.duration_ms / 1000)),
                thumbnail: trackData.album.images[0]?.url,
                requestedBy: user ? user.displayName || user.username : 'Utente',
                platform: '🎧 Spotify → YouTube'
            };
        } catch (error) {
            logger.error('Errore ricerca Spotify:', error);
            return null;
        }
    }

    async createConnection(voiceChannel, guildId) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        this.connections.set(guildId, connection);
        this.players.set(guildId, player);

        player.on(AudioPlayerStatus.Idle, () => {
            logger.music('🎵 Player in stato Idle, passando alla prossima canzone');
            setTimeout(() => {
                this.playNext(guildId);
            }, 1000); // Piccolo delay per evitare transizioni troppo rapide
        });
        
        player.on(AudioPlayerStatus.Playing, () => {
            logger.music('🎵 Player in riproduzione');
        });
        
        player.on(AudioPlayerStatus.Paused, () => {
            logger.music('🎵 Player in pausa');
        });
        
        player.on(AudioPlayerStatus.Buffering, () => {
            logger.music('🎵 Player in buffering');
        });
        
        player.on(AudioPlayerStatus.AutoPaused, () => {
            logger.music('🎵 Player auto-pausato');
        });

        player.on('error', error => {
            console.error('Errore del player audio:', error);
            this.playNext(guildId);
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            this.cleanup(guildId);
        });
    }

    async playNext(guildId) {
        const queue = this.getQueue(guildId);
        const player = this.players.get(guildId);

        // Gestione loop singola canzone
        if (queue.loop && queue.currentSong) {
            // Riproduci la stessa canzone
            const song = queue.currentSong;
            // Non modificare la coda, riproduci solo la canzone corrente
        } else {
            // Aggiungi la canzone corrente alla cronologia
            if (queue.currentSong) {
                queue.history.unshift(queue.currentSong);
                // Mantieni solo le ultime 10 canzoni nella cronologia
                if (queue.history.length > 10) {
                    queue.history = queue.history.slice(0, 10);
                }
            }

            // Gestione loop coda
            if (queue.loopQueue && queue.songs.length === 0 && queue.currentSong) {
                // Ricarica la coda dalla cronologia (esclusa la canzone corrente)
                queue.songs = [...queue.history.slice(1)];
                if (queue.shuffle) {
                    // Mescola la coda ricaricata
                    for (let i = queue.songs.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
                    }
                }
            }

            if (queue.songs.length === 0) {
                queue.currentSong = null;
                if (queue.textChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('✅ Riproduzione Terminata')
                        .setDescription('La coda è vuota. Aggiungi nuove canzoni con `.play`!')
                        .setColor('#00ff00');
                    queue.textChannel.send({ embeds: [embed] });
                }
                return;
            }

            const song = queue.songs.shift();
            queue.currentSong = song;
        }

        const song = queue.currentSong;

        // Emetti evento per aggiornare il pannello web
        this.emit('queueUpdate', {
            guildId: guildId,
            queue: queue.songs,
            currentSong: queue.currentSong
        });

        try {
            let stream;
            

            
            // Determina il tipo di stream in base alla piattaforma
            if (song.platform && song.platform.includes('SoundCloud') && !song.platform.includes('non disponibile')) {
                try {
                    const info = await scdl.getInfo(song.url);
                    if (!info || !info.streamable) {
                        throw new Error('Traccia SoundCloud non più disponibile o non streamabile');
                    }
                    stream = await SoundCloud.download(song.url);
                } catch (scdlError) {
                    logger.error('Errore SoundCloud download:', scdlError.message);
                    const fallbackQuery = song.title.replace(/🎵 SoundCloud/g, '').trim();
                    const youtubeResults = await this.searchYouTube(fallbackQuery, false, null);
                    if (youtubeResults) {
                        song.url = youtubeResults.url;
                        song.platform = '🎥 YouTube (Fallback da SoundCloud)';
                        stream = ytdl(song.url, {
                            filter: 'audioonly',
                            highWaterMark: 1 << 25,
                            quality: 'highestaudio',
                            // Aggiungi filtri audio ottimizzati
                            requestOptions: {
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                                }
                            }
                        });
                    } else {
                        throw new Error('Impossibile riprodurre la traccia SoundCloud e nessun fallback YouTube trovato');
                    }
                }
            } else {
                // YouTube o Spotify→YouTube con filtri ottimizzati
                stream = ytdl(song.url, {
                    filter: 'audioonly',
                    highWaterMark: 1 << 25,
                    quality: 'highestaudio',
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    }
                });
            }

            // Crea risorsa audio con volume aumentato
            const resource = createAudioResource(stream, {
                inlineVolume: true,
                inputType: 'arbitrary'
            });
            
            // Imposta volume aumentato
            resource.volume.setVolume(Math.min(queue.volume * 2, 1.0));
            
            // Aggiungi logging per debug
            logger.music(`🎵 Avvio riproduzione: ${song.title}`);
            
            // Gestisci eventi della risorsa audio
            resource.playStream.on('error', (error) => {
                logger.error('Errore stream audio:', error);
            });
            
            resource.playStream.on('end', () => {
                logger.music('🎵 Stream audio terminato');
            });
            
            player.play(resource);

            const embed = new EmbedBuilder()
                .setTitle('🎵 Ora in Riproduzione')
                .setDescription(`**${song.title}**`)
                .addFields(
                    { name: 'Durata', value: song.duration, inline: true },
                    { name: 'Richiesta da', value: song.requestedBy, inline: true },
                    { name: 'Canzoni in coda', value: `${queue.songs.length}`, inline: true },
                    { name: 'Piattaforma', value: song.platform || '🎥 YouTube', inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setColor('#ff0000');

            // Crea i bottoni di controllo base
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('music_pause')
                        .setLabel('⏸️ Pausa')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_skip')
                        .setLabel('⏭️ Salta')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('music_stop')
                        .setLabel('⏹️ Stop')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('music_queue')
                        .setLabel('📋 Coda')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_nowplaying')
                        .setLabel('🎵 Info')
                        .setStyle(ButtonStyle.Secondary)
                );
                
            // Crea i bottoni di controllo avanzati
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('music_loop')
                        .setLabel(queue.loop ? '🔂 Loop ON' : '🔂 Loop')
                        .setStyle(queue.loop ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_loopqueue')
                        .setLabel(queue.loopQueue ? '🔁 Loop Coda ON' : '🔁 Loop Coda')
                        .setStyle(queue.loopQueue ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_shuffle')
                        .setLabel(queue.shuffle ? '🔀 Shuffle ON' : '🔀 Shuffle')
                        .setStyle(queue.shuffle ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_volume_down')
                        .setLabel('🔉 -10%')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('music_volume_up')
                        .setLabel('🔊 +10%')
                        .setStyle(ButtonStyle.Secondary)
                );

            if (queue.textChannel) {
                queue.textChannel.send({ embeds: [embed], components: [row1, row2] });
            }
        } catch (error) {
            logger.error('Errore nella riproduzione:', error);
            let errorMessage = '❌ Errore nella riproduzione della canzone.';
            
            if (error.message.includes('FFmpeg')) {
                errorMessage = '❌ FFmpeg non trovato. Aggiungi C:\\ffmpeg\\ffmpeg-*\\bin al PATH e riavvia il bot.';
            } else if (error.message.includes('Could not extract functions')) {
                errorMessage = '❌ Errore YouTube. Prova con un altro video o riprova più tardi.';
            } else if (error.message.includes('Video unavailable')) {
                errorMessage = '❌ Video non disponibile. Saltando alla prossima canzone...';
            } else if (error.message.includes('SoundCloud')) {
                errorMessage = '❌ Errore SoundCloud. Le API di SoundCloud potrebbero essere temporaneamente non disponibili. Prova con YouTube o riprova più tardi.';
            } else if (error.message.includes('Spotify')) {
                errorMessage = '❌ Errore Spotify. Verifica le credenziali API o riprova più tardi.';
            } else if (error.message.includes('streamable')) {
                errorMessage = '❌ Traccia non disponibile per lo streaming. Saltando alla prossima canzone...';
            }
            
            if (queue.textChannel) {
                queue.textChannel.send(errorMessage);
            }
            this.playNext(guildId);
        }
    }

    async skip(message) {
        const queue = this.getQueue(message.guild.id);
        const player = this.players.get(message.guild.id);

        if (!queue.currentSong) {
            return message.reply('❌ Nessuna canzone in riproduzione!');
        }

        player.stop();
        message.reply('⏭️ Canzone saltata!');
    }

    async stop(message) {
        const queue = this.getQueue(message.guild.id);
        const player = this.players.get(message.guild.id);

        queue.songs = [];
        queue.currentSong = null;
        
        if (player) {
            player.stop();
        }

        this.cleanup(message.guild.id);
        message.reply('⏹️ Musica fermata e coda svuotata!');
    }

    async pause(message, updateExisting = false) {
        const player = this.players.get(message.guild.id);
        
        if (!player || player.state.status !== AudioPlayerStatus.Playing) {
            return message.reply('❌ Nessuna canzone in riproduzione!');
        }

        player.pause();
        
        if (updateExisting) {
            // Aggiorna il messaggio esistente con le nuove informazioni
            await this.showNowPlaying(message, true);
        } else {
            message.reply('⏸️ Musica messa in pausa!');
        }
    }

    async resume(message, updateExisting = false) {
        const player = this.players.get(message.guild.id);
        
        if (!player || player.state.status !== AudioPlayerStatus.Paused) {
            return message.reply('❌ Nessuna canzone in pausa!');
        }

        player.unpause();
        
        if (updateExisting) {
            // Aggiorna il messaggio esistente con le nuove informazioni
            await this.showNowPlaying(message, true);
        } else {
            message.reply('▶️ Musica ripresa!');
        }
    }

    async setVolume(message, volume, updateExisting = false) {
        if (!volume || isNaN(volume) || volume < 0 || volume > 100) {
            return message.reply('❌ Fornisci un volume valido (0-100)!');
        }

        const queue = this.getQueue(message.guild.id);
        const player = this.players.get(message.guild.id);
        
        const newVolume = volume / 100;
        queue.volume = newVolume;

        if (player && player.state.resource && player.state.resource.volume) {
            player.state.resource.volume.setVolume(newVolume);
        }

        if (updateExisting) {
            // Aggiorna il messaggio esistente con le nuove informazioni
            await this.showNowPlaying(message, true);
        } else {
            message.reply(`🔊 Volume impostato al ${volume}%`);
        }
    }

    async showQueue(message) {
        const queue = this.getQueue(message.guild.id);
        
        if (!queue.currentSong && queue.songs.length === 0) {
            return message.reply('❌ La coda è vuota!');
        }

        let queueString = '';
        
        if (queue.currentSong) {
            queueString += `**🎵 Ora in riproduzione:**\n${queue.currentSong.title}\n\n`;
        }

        if (queue.songs.length > 0) {
            queueString += '**📋 Prossime canzoni:**\n';
            queue.songs.slice(0, 10).forEach((song, index) => {
                queueString += `${index + 1}. ${song.title}\n`;
            });
            
            if (queue.songs.length > 10) {
                queueString += `\n... e altre ${queue.songs.length - 10} canzoni`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🎵 Coda Musicale')
            .setDescription(queueString)
            .setColor('#0099ff')
            .setFooter({ text: `Volume: ${Math.round(queue.volume * 100)}%` });

        message.reply({ embeds: [embed] });
    }

    cleanup(guildId) {
        const connection = this.connections.get(guildId);
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
        }
        
        this.players.delete(guildId);
        this.queues.delete(guildId);
        
        logger.music(`🧹 Cleanup completato per guild ${guildId}`);
    }
    
    performCleanup() {
        try {
            const now = Date.now();
            
            // Pulisci cache scadute
            for (const [key, value] of this.searchCache.entries()) {
                if (value.timestamp && now - value.timestamp > this.cacheConfig.searchTTL) {
                    this.searchCache.delete(key);
                }
            }
            
            for (const [key, value] of this.urlCache.entries()) {
                if (value.timestamp && now - value.timestamp > this.cacheConfig.urlTTL) {
                    this.urlCache.delete(key);
                }
            }
            
            for (const [key, value] of this.metadataCache.entries()) {
                if (value.timestamp && now - value.timestamp > this.cacheConfig.metadataTTL) {
                    this.metadataCache.delete(key);
                }
            }
            
            // Pulisci connessioni inattive
            for (const [guildId, connection] of this.connections.entries()) {
                if (connection.state.status === 'destroyed' || connection.state.status === 'disconnected') {
                    this.cleanup(guildId);
                }
            }
            
            // Pulisci code vuote
            for (const [guildId, queue] of this.queues.entries()) {
                if (queue.songs.length === 0 && !queue.playing) {
                    this.cleanup(guildId);
                }
            }
            
            logger.music('🧹 Cleanup automatico completato');
        } catch (error) {
            logger.error('Errore durante cleanup automatico:', error);
        }
    }
    
    destroy() {
        // Ferma il cleanup automatico
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Pulisci tutte le risorse
        for (const guildId of this.connections.keys()) {
            this.cleanup(guildId);
        }
        
        // Pulisci cache
        this.searchCache.clear();
        this.urlCache.clear();
        this.metadataCache.clear();
        
        logger.music('🧹 MusicManager distrutto e risorse pulite');
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    async toggleLoop(message, updateExisting = false) {
        const queue = this.getQueue(message.guild.id);
        queue.loop = !queue.loop;
        
        if (updateExisting) {
            // Aggiorna il messaggio esistente con le nuove informazioni
            await this.showNowPlaying(message, true);
        } else {
            const status = queue.loop ? 'attivato' : 'disattivato';
            const emoji = queue.loop ? '🔂' : '▶️';
            message.reply(`${emoji} Loop ${status}!`);
        }
    }

    async toggleLoopQueue(message, updateExisting = false) {
        const queue = this.getQueue(message.guild.id);
        queue.loopQueue = !queue.loopQueue;
        
        if (updateExisting) {
            // Aggiorna il messaggio esistente con le nuove informazioni
            await this.showNowPlaying(message, true);
        } else {
            const status = queue.loopQueue ? 'attivato' : 'disattivato';
            const emoji = queue.loopQueue ? '🔁' : '▶️';
            message.reply(`${emoji} Loop coda ${status}!`);
        }
    }

    async toggleShuffle(message, updateExisting = false) {
        const queue = this.getQueue(message.guild.id);
        queue.shuffle = !queue.shuffle;
        
        if (queue.shuffle && queue.songs.length > 1) {
            // Mescola la coda
            for (let i = queue.songs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
            }
        }
        
        if (updateExisting) {
            // Aggiorna il messaggio esistente con le nuove informazioni
            await this.showNowPlaying(message, true);
        } else {
            const status = queue.shuffle ? 'attivato' : 'disattivato';
            const emoji = queue.shuffle ? '🔀' : '▶️';
            message.reply(`${emoji} Shuffle ${status}!`);
        }
    }

    async removeSong(message, position) {
        const queue = this.getQueue(message.guild.id);
        
        if (!position || isNaN(position) || position < 1 || position > queue.songs.length) {
            return message.reply(`❌ Fornisci una posizione valida (1-${queue.songs.length})!`);
        }
        
        const removedSong = queue.songs.splice(position - 1, 1)[0];
        message.reply(`🗑️ Rimossa: **${removedSong.title}**`);
        
        // Emetti evento per aggiornare il pannello web
        this.emit('queueUpdate', {
            guildId: message.guild.id,
            queue: queue.songs,
            currentSong: queue.currentSong
        });
    }

    async clearQueue(message) {
        const queue = this.getQueue(message.guild.id);
        const removedCount = queue.songs.length;
        queue.songs = [];
        
        message.reply(`🗑️ Coda svuotata! Rimosse ${removedCount} canzoni.`);
        
        // Emetti evento per aggiornare il pannello web
        this.emit('queueUpdate', {
            guildId: message.guild.id,
            queue: queue.songs,
            currentSong: queue.currentSong
        });
    }

    async showNowPlaying(message, updateExisting = false) {
        const queue = this.getQueue(message.guild.id);
        
        if (!queue.currentSong) {
            return message.reply('❌ Nessuna canzone in riproduzione!');
        }
        
        const player = this.players.get(message.guild.id);
        const playbackDuration = player?.state?.resource?.playbackDuration || 0;
        const currentTime = Math.floor(playbackDuration / 1000);
        
        const embed = new EmbedBuilder()
            .setTitle('🎵 Ora in Riproduzione')
            .setDescription(`**${queue.currentSong.title}**`)
            .addFields(
                { name: 'Durata', value: queue.currentSong.duration, inline: true },
                { name: 'Tempo trascorso', value: this.formatDuration(currentTime), inline: true },
                { name: 'Richiesta da', value: queue.currentSong.requestedBy, inline: true },
                { name: 'Volume', value: `${Math.round(queue.volume * 100)}%`, inline: true },
                { name: 'Loop', value: queue.loop ? '🔂 Attivo' : '▶️ Disattivo', inline: true },
                { name: 'Shuffle', value: queue.shuffle ? '🔀 Attivo' : '▶️ Disattivo', inline: true }
            )
            .setThumbnail(queue.currentSong.thumbnail)
            .setColor('#ff0000');
            
        // Crea i bottoni di controllo avanzati
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_pause')
                    .setLabel('⏸️ Pausa')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_skip')
                    .setLabel('⏭️ Salta')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('music_stop')
                    .setLabel('⏹️ Stop')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('music_loop')
                    .setLabel(queue.loop ? '🔂 Loop ON' : '🔂 Loop OFF')
                    .setStyle(queue.loop ? ButtonStyle.Success : ButtonStyle.Secondary)
            );
            
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_shuffle')
                    .setLabel(queue.shuffle ? '🔀 Shuffle ON' : '🔀 Shuffle OFF')
                    .setStyle(queue.shuffle ? ButtonStyle.Success : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_queue')
                    .setLabel('📋 Coda')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_volume_down')
                    .setLabel('🔉 -10%')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_volume_up')
                    .setLabel('🔊 +10%')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        if (updateExisting && message.reply.name === 'reply' && message.reply.toString().includes('editReply')) {
            // Se stiamo aggiornando un messaggio esistente (da un pulsante)
            message.reply({ embeds: [embed], components: [row1, row2] });
        } else {
            // Comportamento normale per nuovi messaggi
            message.reply({ embeds: [embed], components: [row1, row2] });
        }
    }

    async jumpToSong(message, position) {
        const queue = this.getQueue(message.guild.id);
        
        if (!position || isNaN(position) || position < 1 || position > queue.songs.length) {
            return message.reply(`❌ Fornisci una posizione valida (1-${queue.songs.length})!`);
        }
        
        // Sposta le canzoni prima della posizione target alla fine
        const songsToMove = queue.songs.splice(0, position - 1);
        queue.songs.push(...songsToMove);
        
        // Salta alla prossima canzone (che ora è quella desiderata)
        const player = this.players.get(message.guild.id);
        if (player) {
            player.stop();
        }
        
        message.reply(`⏭️ Saltando alla canzone #${position}!`);
    }

    getActiveQueues() {
        return Array.from(this.queues.keys()).length;
    }
}

module.exports = MusicManager;