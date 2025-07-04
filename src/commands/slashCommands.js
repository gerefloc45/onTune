const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

/**
 * Comandi Slash - Alternativa ai comandi con prefisso
 * Funzionano anche senza MessageContent Intent privilegiato
 */

class SlashCommands {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Map();
        this.setupCommands();
    }

    setupCommands() {
        // Comando Help
        this.commands.set('help', {
            data: new SlashCommandBuilder()
                .setName('help')
                .setDescription('Mostra tutti i comandi disponibili'),
            async execute(interaction) {
                const embed = new EmbedBuilder()
                    .setTitle('🤖 Discord Music Bot - Comandi Slash')
                    .setColor('#00ff00')
                    .setDescription('Ecco tutti i comandi slash disponibili:')
                    .addFields(
                        {
                            name: '🎵 **Comandi Musicali Base**',
                            value: '`.play <canzone>` - Riproduci una canzone\n`.skip` - Salta la canzone corrente\n`.stop` - Ferma la musica\n`.pause` - Metti in pausa\n`.resume` - Riprendi la riproduzione\n`.queue` - Mostra la coda\n`.volume <numero>` - Imposta il volume (0-100)',
                            inline: false
                        },
                        {
                            name: '🔄 **Comandi Musicali Avanzati**',
                            value: '`.loop` - Loop canzone corrente\n`.loopqueue` - Loop intera coda\n`.shuffle` - Attiva/disattiva shuffle\n`.nowplaying` - Mostra canzone corrente\n`.remove <numero>` - Rimuovi canzone dalla coda\n`.clear` - Svuota la coda\n`.jump <numero>` - Salta a una canzone specifica',
                            inline: false
                        },

                    )
                    .setFooter({ text: 'Bot creato da Geremia - Comandi Slash attivi' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        });

        // Comando Play
        this.commands.set('play', {
            data: new SlashCommandBuilder()
                .setName('play')
                .setDescription('Riproduci una canzone')
                .addStringOption(option =>
                    option.setName('canzone')
                        .setDescription('Nome della canzone o URL')
                        .setRequired(true)),
            async execute(interaction) {
                const song = interaction.options.getString('canzone');
                await interaction.deferReply();
                
                try {
                    // Simula il messaggio per il music manager
                    const fakeMessage = {
                        member: interaction.member,
                        guild: interaction.guild,
                        channel: interaction.channel,
                        reply: async (content) => {
                            if (typeof content === 'string') {
                                await interaction.editReply(content);
                            } else {
                                await interaction.editReply(content);
                            }
                        }
                    };
                    
                    await this.bot.musicManager.play(fakeMessage, song);
                } catch (error) {
                    console.error('Errore comando play:', error);
                    await interaction.editReply('❌ Errore durante la riproduzione della canzone.');
                }
            }
        });

        // Comando Skip
        this.commands.set('skip', {
            data: new SlashCommandBuilder()
                .setName('skip')
                .setDescription('Salta la canzone corrente'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.skip(fakeMessage);
            }
        });

        // Comando Stop
        this.commands.set('stop', {
            data: new SlashCommandBuilder()
                .setName('stop')
                .setDescription('Ferma la musica e svuota la coda'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.stop(fakeMessage);
            }
        });

        // Comando Queue
        this.commands.set('queue', {
            data: new SlashCommandBuilder()
                .setName('queue')
                .setDescription('Mostra la coda musicale corrente'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.showQueue(fakeMessage);
            }
        });







        // Comando Pause
        this.commands.set('pause', {
            data: new SlashCommandBuilder()
                .setName('pause')
                .setDescription('Metti in pausa la musica'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.pause(fakeMessage);
            }
        });

        // Comando Resume
        this.commands.set('resume', {
            data: new SlashCommandBuilder()
                .setName('resume')
                .setDescription('Riprendi la riproduzione'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.resume(fakeMessage);
            }
        });

        // Comando Volume
        this.commands.set('volume', {
            data: new SlashCommandBuilder()
                .setName('volume')
                .setDescription('Imposta il volume della musica')
                .addIntegerOption(option =>
                    option.setName('numero')
                        .setDescription('Volume da 0 a 100')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(100)),
            async execute(interaction) {
                await interaction.deferReply();
                
                const volume = interaction.options.getInteger('numero');
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.setVolume(fakeMessage, volume.toString());
            }
        });

        // Comando Loop
        this.commands.set('loop', {
            data: new SlashCommandBuilder()
                .setName('loop')
                .setDescription('Attiva/disattiva il loop della canzone corrente'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.toggleLoop(fakeMessage);
            }
        });

        // Comando Loop Queue
        this.commands.set('loopqueue', {
            data: new SlashCommandBuilder()
                .setName('loopqueue')
                .setDescription('Attiva/disattiva il loop dell\'intera coda'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.toggleLoopQueue(fakeMessage);
            }
        });

        // Comando Shuffle
        this.commands.set('shuffle', {
            data: new SlashCommandBuilder()
                .setName('shuffle')
                .setDescription('Attiva/disattiva la modalità shuffle'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.toggleShuffle(fakeMessage);
            }
        });

        // Comando Now Playing
        this.commands.set('nowplaying', {
            data: new SlashCommandBuilder()
                .setName('nowplaying')
                .setDescription('Mostra la canzone attualmente in riproduzione'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.showNowPlaying(fakeMessage);
            }
        });

        // Comando Remove
        this.commands.set('remove', {
            data: new SlashCommandBuilder()
                .setName('remove')
                .setDescription('Rimuovi una canzone dalla coda')
                .addIntegerOption(option =>
                    option.setName('numero')
                        .setDescription('Numero della canzone da rimuovere')
                        .setRequired(true)
                        .setMinValue(1)),
            async execute(interaction) {
                await interaction.deferReply();
                
                const number = interaction.options.getInteger('numero');
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.removeSong(fakeMessage, number.toString());
            }
        });

        // Comando Clear
        this.commands.set('clear', {
            data: new SlashCommandBuilder()
                .setName('clear')
                .setDescription('Svuota completamente la coda musicale'),
            async execute(interaction) {
                await interaction.deferReply();
                
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.clearQueue(fakeMessage);
            }
        });

        // Comando Jump
        this.commands.set('jump', {
            data: new SlashCommandBuilder()
                .setName('jump')
                .setDescription('Salta a una canzone specifica nella coda')
                .addIntegerOption(option =>
                    option.setName('numero')
                        .setDescription('Numero della canzone a cui saltare')
                        .setRequired(true)
                        .setMinValue(1)),
            async execute(interaction) {
                await interaction.deferReply();
                
                const number = interaction.options.getInteger('numero');
                const fakeMessage = {
                    member: interaction.member,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    reply: async (content) => await interaction.editReply(content)
                };
                
                await this.bot.musicManager.jumpToSong(fakeMessage, number.toString());
            }
        });

        // Comando Web Dashboard rimosso - ora si usa .webon e .weboff

    }

    getCommands() {
        return Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
    }

    async handleInteraction(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commands.get(interaction.commandName);
        if (!command) {
            console.error(`Comando slash non trovato: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Errore esecuzione comando slash:', error);
            
            const errorMessage = '❌ Errore durante l\'esecuzione del comando.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
}

module.exports = SlashCommands;