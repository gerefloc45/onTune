require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const logger = require('./utils/logger');
const PerformanceOptimizer = require('./utils/performance');
const { getMonitor } = require('./utils/monitoring');
const { getConfig, validateConfig } = require('./utils/config');
const { initializeBotCaches } = require('./utils/cache');
const { getErrorHandler, handleCommandError } = require('./utils/errorHandler');
const StandaloneWebServer = require('../web-server');

// Carica configurazione performance con fallback
let performanceConfig;
try {
    const configPath = path.join(__dirname, '..', 'config', 'performance.json');
    if (fs.existsSync(configPath)) {
        performanceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        logger.system('✅ Configurazione performance caricata');
    } else {
        throw new Error('File configurazione non trovato');
    }
} catch (error) {
    logger.system('⚠️ Usando configurazione performance di default:', error.message);
    performanceConfig = {
        discord: {
            cache: { MessageManager: 50, ChannelManager: 200, GuildManager: 100, UserManager: 200 },
            sweepers: {
                messages: { interval: 300, lifetime: 1800 },
                users: { interval: 3600, filter: '!bot' }
            }
        },
        rate_limiting: { commands_per_minute: 10, burst_limit: 3, cooldown_ms: 2000 },
        memory: { gc_interval: 300000, heap_threshold: 0.8 }
    };
}

// Lazy loading per migliorare i tempi di avvio
let MusicManager, VoiceManager, SlashCommands;
const loadManagers = () => {
    if (!MusicManager) MusicManager = require('./managers/MusicManager');
    if (!VoiceManager) VoiceManager = require('./managers/VoiceManager');
    if (!SlashCommands) SlashCommands = require('./commands/slashCommands');
    // WebServer rimosso - ora standalone
};

class DiscordMusicAIBot {
    constructor() {
        // Carica e valida configurazione
        this.config = getConfig();
        const validation = validateConfig();

        if (!validation.valid) {
            logger.system('❌ Problemi di configurazione rilevati:');
            validation.issues.forEach(issue => logger.system(`  - ${issue}`));
            if (validation.issues.some(issue => issue.includes('Token Discord'))) {
                throw new Error('Configurazione Discord non valida. Controlla il file .env');
            }
        }

        logger.system('✅ Configurazione validata:', this.config.environment.nodeEnv);

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ],
            // Configurazione cache ottimizzata da file config
            makeCache: require('discord.js').Options.cacheWithLimits(performanceConfig.discord.cache),
            // Sweeper per pulizia automatica da file config
            sweepers: {
                messages: performanceConfig.discord.sweepers.messages,
                users: {
                    interval: performanceConfig.discord.sweepers.users.interval,
                    filter: () => user => eval(performanceConfig.discord.sweepers.users.filter.replace('!bot', '!user.bot'))
                }
            }
        });

        // Cache per comandi frequenti
        this.commandCache = new Map();
        // Rate limiter per utente da file config
        this.rateLimiter = new Map();
        this.RATE_LIMIT = {
            COMMANDS_PER_MINUTE: performanceConfig.rate_limiting.commands_per_minute,
            BURST_LIMIT: performanceConfig.rate_limiting.burst_limit,
            COOLDOWN: performanceConfig.rate_limiting.cooldown_ms
        };

        // Garbage Collection automatico
        if (global.gc && performanceConfig.memory.gc_interval) {
            setInterval(() => {
                const memUsage = process.memoryUsage();
                const heapUsed = memUsage.heapUsed / memUsage.heapTotal;

                if (heapUsed > performanceConfig.memory.heap_threshold) {
                    global.gc();
                    console.log(`🗑️ Garbage Collection eseguito - Heap: ${(heapUsed * 100).toFixed(1)}%`);
                }
            }, performanceConfig.memory.gc_interval);
        }

        // Performance optimizer
        this.performance = new PerformanceOptimizer();

        // Inizializza monitoraggio
        this.monitor = getMonitor();
        logger.system('📊 Sistema di monitoraggio inizializzato');

        // Inizializza cache
        this.caches = initializeBotCaches();
        logger.system('📦 Sistema di cache inizializzato');

        // Inizializza gestione errori
        this.errorHandler = getErrorHandler();
        logger.system('🛡️ Sistema di gestione errori inizializzato');

        // Inizializzazione lazy dei manager
        this.musicManager = null;
        this.voiceManager = null;
        this.musicManagerInitializing = false;
        this.slashCommands = null;
        
        // Inizializza server web standalone
        this.webServer = new StandaloneWebServer();
        this.webServer.start().catch(error => {
            logger.system('⚠️ Errore avvio server web:', error.message);
        });

        this.setupEventHandlers();
        this.setupCommands();
    }

    setupEventHandlers() {
        this.client.once('ready', async () => {
            logger.system(`🤖 Bot TUNE è online!`);
            logger.music(`🎵 Sistema musicale attivo`);
            logger.voice(`🎤 Voice Manager attivo`);

            this.client.user.setActivity('🎵 Musica e Voce | .help', { type: 'LISTENING' });

            // Server web ora standalone - non più gestito dal bot
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            const prefix = process.env.BOT_PREFIX || '.';
            if (!message.content.startsWith(prefix)) {
                return;
            }

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            // Ottimizzazione: evita di processare comandi vuoti
            if (!command) return;

            const startTime = Date.now();

            try {
                 await this.handleCommand(message, command, args);
                 const responseTime = Date.now() - startTime;
                 this.monitor.recordCommand(command, responseTime, true);
             } catch (error) {
                 const responseTime = Date.now() - startTime;
                 this.monitor.recordCommand(command, responseTime, false);
                 await handleCommandError(error, message, command);
             }
        });

        this.client.on('voiceStateUpdate', (oldState, newState) => {
            // Lazy loading del VoiceManager
            if (!this.voiceManager) {
                loadManagers();
                this.voiceManager = new VoiceManager(this);
            }
            this.voiceManager.handleVoiceStateUpdate(oldState, newState);
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.isButton()) {
                await this.handleButtonInteraction(interaction);
            } else {
                // Lazy loading per SlashCommands
                if (!this.slashCommands) {
                    loadManagers();
                    this.slashCommands = new SlashCommands(this);
                }
                await this.slashCommands.handleInteraction(interaction);
            }
        });
    }

    async initializeMusicManager() {
        if (this.musicManager || this.musicManagerInitializing) {
            return this.musicManager;
        }

        this.musicManagerInitializing = true;
        try {
            loadManagers();
            this.musicManager = new MusicManager(this.client);
            await this.musicManager.initialize();
            logger.music('🎵 Sistema musicale completamente inizializzato');
        } catch (error) {
            logger.error('Errore inizializzazione MusicManager:', error);
        } finally {
            this.musicManagerInitializing = false;
        }

        return this.musicManager;
    }

    async handleCommand(message, command, args) {
        const startTime = Date.now();

        try {
            // Rate limiting per utente
            const userId = message.author.id;
            const now = Date.now();
            const userLimit = this.rateLimiter.get(userId);

            if (userLimit && now - userLimit < 1000) { // 1 secondo di cooldown
                return;
            }
            this.rateLimiter.set(userId, now);

            // Pulizia periodica del rate limiter
            if (this.rateLimiter.size > 1000) {
                const cutoff = now - 60000; // 1 minuto
                for (const [id, time] of this.rateLimiter.entries()) {
                    if (time < cutoff) this.rateLimiter.delete(id);
                }
            }

            // Lazy loading dei manager quando necessario
            if (!this.musicManager && ['play', 'p', 'skip', 's', 'stop', 'pause', 'resume', 'queue', 'q', 'volume', 'v', 'loop', 'loopqueue', 'lq', 'shuffle', 'remove', 'rm', 'clear', 'nowplaying', 'np', 'jump', 'j'].includes(command)) {
                await this.initializeMusicManager();
            }

            if (!this.voiceManager && ['join', 'leave', 'speak', 'listen'].includes(command)) {
                loadManagers();
                this.voiceManager = new VoiceManager(this.client);
            }

            switch (command) {
                case 'help':
                    await this.sendHelpMessage(message);
                    break;
                case 'play':
                case 'p':
                    await this.musicManager.play(message, args.join(' '));
                    break;
                case 'skip':
                case 's':
                    await this.musicManager.skip(message);
                    break;
                case 'stop':
                    await this.musicManager.stop(message);
                    break;
                case 'pause':
                    await this.musicManager.pause(message);
                    break;
                case 'resume':
                    await this.musicManager.resume(message);
                    break;
                case 'queue':
                case 'q':
                    await this.musicManager.showQueue(message);
                    break;
                case 'volume':
                case 'v':
                    await this.musicManager.setVolume(message, args[0]);
                    break;
                case 'loop':
                    await this.musicManager.toggleLoop(message);
                    break;
                case 'loopqueue':
                case 'lq':
                    await this.musicManager.toggleLoopQueue(message);
                    break;
                case 'shuffle':
                    await this.musicManager.toggleShuffle(message);
                    break;
                case 'remove':
                case 'rm':
                    await this.musicManager.removeSong(message, args[0]);
                    break;
                case 'clear':
                    await this.musicManager.clearQueue(message);
                    break;
                case 'nowplaying':
                case 'np':
                    await this.musicManager.showNowPlaying(message);
                    break;
                case 'jump':
                case 'j':
                    await this.musicManager.jumpToSong(message, args[0]);
                    break;
                // Comandi web rimossi - server ora standalone

                default:
                    message.reply('❌ Comando non riconosciuto. Usa `.help` per vedere tutti i comandi.');
            }
        } catch (error) {
            console.error('Errore nel comando:', error);
            message.reply('❌ Si è verificato un errore durante l\'esecuzione del comando.');
        } finally {
            // Traccia performance del comando
            const executionTime = Date.now() - startTime;
            this.performance.trackCommand(command, executionTime);
        }
    }





    async sendHelpMessage(message) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 Discord Music Bot - Comandi')
            .setColor('#00ff00')
            .setDescription('Ecco tutti i comandi disponibili:')
            .addFields(
                {
                    name: '🎵 **Comandi Musicali Base**',
                    value: '`.play <canzone>` - Riproduci una canzone\n`.skip` - Salta la canzone corrente\n`.stop` - Ferma la musica\n`.pause` - Metti in pausa\n`.resume` - Riprendi la riproduzione\n`.queue` - Mostra la coda\n`.volume <0-100>` - Imposta il volume',
                    inline: false
                },
                {
                    name: '🔄 **Comandi Musicali Avanzati**',
                    value: '`.loop` - Loop canzone corrente\n`.loopqueue` - Loop intera coda\n`.shuffle` - Attiva/disattiva shuffle\n`.nowplaying` - Mostra canzone corrente\n`.remove <numero>` - Rimuovi canzone dalla coda\n`.clear` - Svuota la coda\n`.jump <numero>` - Salta a una canzone specifica',
                    inline: false
                },


            )
            .setFooter({ text: 'Bot creato da Gerefloc45 - Versione Ottimizzata' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    setupCommands() {
        // Setup per i comandi slash se necessario
        // Log rimosso per evitare duplicazione
    }

    getStatus() {
        const guilds = this.client.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            voiceConnections: guild.members.me?.voice?.channel ? 1 : 0
        }));

        return {
            bot: {
                username: this.client.user?.username || 'MusicBot',
                id: this.client.user?.id || 'unknown',
                status: this.client.ws.status === 0 ? 'online' : 'offline',
                ping: this.client.ws.ping,
                uptime: process.uptime()
            },
            guilds: guilds,
            totalGuilds: guilds.length,
            totalMembers: guilds.reduce((acc, guild) => acc + guild.memberCount, 0),
            music: {
                activeQueues: this.musicManager ? Object.keys(this.musicManager.queues || {}).length : 0,
                totalSongs: this.musicManager ? Object.values(this.musicManager.queues || {}).reduce((acc, queue) => acc + (queue.songs?.length || 0), 0) : 0
            },
            system: {
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            }
        };
    }

    // Metodi del server web rimossi - ora standalone

    // Handler dei comandi web rimossi - server ora standalone

    async start() {
        try {
            logger.system('🚀 Avvio del bot in corso...');

            // Verifica finale della configurazione
            if (!this.config.discord.token || this.config.discord.token === 'your_discord_bot_token_here') {
                throw new Error('Token Discord non configurato. Copia .env.example in .env e configura le variabili.');
            }

            await this.client.login(this.config.discord.token);

            // Log informazioni di avvio
            logger.system('✅ Bot avviato con successo');
            logger.system(`📊 Ambiente: ${this.config.environment.nodeEnv}`);
            logger.system(`🌐 Porta web: ${this.config.web.port}`);
            logger.system(`📈 Monitoraggio: ${this.config.performance.monitoringEnabled ? 'Abilitato' : 'Disabilitato'}`);

        } catch (error) {
            logger.system('❌ Errore durante l\'avvio del bot:', error.message);

            // Suggerimenti per errori comuni
            if (error.message.includes('TOKEN_INVALID')) {
                logger.system('💡 Suggerimento: Verifica che il token Discord sia corretto nel file .env');
            } else if (error.message.includes('ENOTFOUND')) {
                logger.system('💡 Suggerimento: Verifica la connessione internet');
            }

            process.exit(1);
        }
    }

    async handleButtonInteraction(interaction) {
        try {
            // Verifica se l'interazione è già stata gestita
            if (interaction.deferred || interaction.replied) {
                return;
            }

            // Per i pulsanti musicali, usiamo update per modificare il messaggio esistente
            const isMusicButton = interaction.customId.startsWith('music_');

            if (isMusicButton) {
                await interaction.deferUpdate();
            } else {
                await interaction.deferReply();
            }

            // Simula il messaggio per il music manager
            const fakeMessage = {
                member: interaction.member,
                guild: interaction.guild,
                channel: interaction.channel,
                reply: async (content) => {
                    if (isMusicButton) {
                        // Per i pulsanti musicali, aggiorna il messaggio esistente
                        if (typeof content === 'string') {
                            await interaction.editReply({ content: content, embeds: [], components: [] });
                        } else {
                            await interaction.editReply(content);
                        }
                    } else {
                        // Per altri pulsanti, comportamento normale
                        if (typeof content === 'string') {
                            await interaction.editReply(content);
                        } else {
                            await interaction.editReply(content);
                        }
                    }
                }
            };

            // Lazy loading del MusicManager per le interazioni
            if (!this.musicManager) {
                await this.initializeMusicManager();
            }

            switch (interaction.customId) {
                case 'music_pause':
                    const player = this.musicManager.players.get(interaction.guild.id);
                    if (player && player.state.status === 'playing') {
                        await this.musicManager.pause(fakeMessage, true);
                    } else {
                        await this.musicManager.resume(fakeMessage, true);
                    }
                    break;
                case 'music_skip':
                    await this.musicManager.skip(fakeMessage);
                    break;
                case 'music_stop':
                    await this.musicManager.stop(fakeMessage);
                    break;
                case 'music_queue':
                    await this.musicManager.showQueue(fakeMessage);
                    break;
                case 'music_loop':
                    await this.musicManager.toggleLoop(fakeMessage, true);
                    break;
                case 'music_loopqueue':
                    await this.musicManager.toggleLoopQueue(fakeMessage, true);
                    break;
                case 'music_shuffle':
                    await this.musicManager.toggleShuffle(fakeMessage, true);
                    break;
                case 'music_nowplaying':
                    await this.musicManager.showNowPlaying(fakeMessage, true);
                    break;
                case 'music_volume_up':
                    const currentQueue = this.musicManager.getQueue(interaction.guild.id);
                    const newVolumeUp = Math.min(1.0, currentQueue.volume + 0.1);
                    await this.musicManager.setVolume(fakeMessage, Math.round(newVolumeUp * 100), true);
                    break;
                case 'music_volume_down':
                    const currentQueueDown = this.musicManager.getQueue(interaction.guild.id);
                    const newVolumeDown = Math.max(0.0, currentQueueDown.volume - 0.1);
                    await this.musicManager.setVolume(fakeMessage, Math.round(newVolumeDown * 100), true);
                    break;
                default:
                    await interaction.editReply('❌ Bottone non riconosciuto!');
            }
        } catch (error) {
            // Gestisci errori specifici di Discord
            if (error.code === 10062) {
                // Unknown interaction - interazione scaduta, ignora silenziosamente
                return;
            }
            if (error.code === 40060) {
                // Interaction already acknowledged - già gestita, ignora
                return;
            }

            console.error('Errore gestione bottone:', error);

            // Prova a rispondere solo se l'interazione non è stata ancora gestita
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply('❌ Errore durante l\'esecuzione del comando.');
                } else if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply('❌ Errore durante l\'esecuzione del comando.');
                }
            } catch (replyError) {
                // Se anche la risposta fallisce, logga l'errore ma non crashare
                console.error('Errore durante la risposta di errore:', replyError);
            }
        }
    }



    async shutdown() {
        try {
            console.log('🧹 Pulizia risorse in corso...');

            // Distruggi MusicManager se inizializzato
            if (this.musicManager && typeof this.musicManager.destroy === 'function') {
                this.musicManager.destroy();
            }

            // Distruggi VoiceManager se inizializzato
            if (this.voiceManager && typeof this.voiceManager.destroy === 'function') {
                this.voiceManager.destroy();
            }

            // Ferma il server web standalone
            if (this.webServer && typeof this.webServer.stop === 'function') {
                await this.webServer.stop();
            }

            // Disconnetti il client Discord
            if (this.client && this.client.isReady()) {
                await this.client.destroy();
            }

            console.log('✅ Shutdown completato');
        } catch (error) {
            console.error('❌ Errore durante shutdown:', error);
        }
    }
}

// Avvia il bot
const bot = new DiscordMusicAIBot();
bot.start();

// Gestione graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Ricevuto SIGINT, spegnimento graceful...');
    await bot.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Ricevuto SIGTERM, spegnimento graceful...');
    await bot.shutdown();
    process.exit(0);
});

process.on('uncaughtException', async (error) => {
    console.error('❌ Errore non gestito:', error);
    await bot.shutdown();
    process.exit(1);
});

module.exports = DiscordMusicAIBot;
