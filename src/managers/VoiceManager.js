const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice');
const { createWriteStream, createReadStream } = require('fs');
const { pipeline } = require('stream');
const path = require('path');
const fs = require('fs');

// Simulazione delle API Google Cloud (sostituire con le vere API quando disponibili)
class MockTextToSpeech {
    async synthesizeSpeech(request) {
        // Simulazione - in produzione usare Google Cloud Text-to-Speech
        return [{ audioContent: Buffer.from('mock audio data') }];
    }
}

class MockSpeechToText {
    async recognize(request) {
        // Simulazione - in produzione usare Google Cloud Speech-to-Text
        return [{
            results: [{
                alternatives: [{
                    transcript: 'Testo riconosciuto simulato'
                }]
            }]
        }];
    }
}

class VoiceManager {
    constructor(client) {
        this.client = client;
        this.connections = new Map();
        this.players = new Map();
        this.listeningStates = new Map();
        
        // Inizializza i servizi TTS e STT (mock per ora)
        this.ttsClient = new MockTextToSpeech();
        this.sttClient = new MockSpeechToText();
        
        this.setupTempDirectory();
    }

    setupTempDirectory() {
        this.tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async joinVoiceChannel(message) {
        const voiceChannel = message.member.voice.channel;
        
        if (!voiceChannel) {
            return message.reply('❌ Devi essere in un canale vocale!');
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply('❌ Non ho i permessi per entrare o parlare in questo canale vocale!');
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            const player = createAudioPlayer();
            connection.subscribe(player);

            this.connections.set(message.guild.id, connection);
            this.players.set(message.guild.id, player);

            // Setup event handlers
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`🎤 Connesso al canale vocale: ${voiceChannel.name}`);
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                this.cleanup(message.guild.id);
            });

            player.on('error', error => {
                console.error('Errore del player vocale:', error);
            });

            message.reply(`🎤 Entrato nel canale vocale **${voiceChannel.name}**! Usa \`!speak <testo>\` per farmi parlare o \`!listen\` per attivare l'ascolto AI.`);
        } catch (error) {
            console.error('Errore nell\'entrare nel canale vocale:', error);
            message.reply('❌ Errore nell\'entrare nel canale vocale.');
        }
    }

    async leaveVoiceChannel(message) {
        const connection = this.connections.get(message.guild.id);
        
        if (!connection) {
            return message.reply('❌ Non sono in un canale vocale!');
        }

        this.cleanup(message.guild.id);
        message.reply('👋 Uscito dal canale vocale!');
    }

    async speakInVoice(message, text) {
        if (!text) {
            return message.reply('❌ Fornisci un testo da far pronunciare al bot!');
        }

        const connection = this.connections.get(message.guild.id);
        const player = this.players.get(message.guild.id);

        if (!connection || !player) {
            return message.reply('❌ Non sono connesso a un canale vocale! Usa `!join` prima.');
        }

        try {
            // Genera l'audio TTS direttamente dal testo
            const audioBuffer = await this.generateTTS(text);
            
            if (audioBuffer) {
                const audioPath = path.join(this.tempDir, `speech_${Date.now()}.wav`);
                fs.writeFileSync(audioPath, audioBuffer);
                
                const resource = createAudioResource(audioPath, {
                    inlineVolume: true
                });
                
                resource.volume.setVolume(0.8);
                player.play(resource);
                
                message.reply(`🗣️ **Sto dicendo:** "${text}"`);
                
                // Pulisci il file temporaneo dopo la riproduzione
                player.once(AudioPlayerStatus.Idle, () => {
                    if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath);
                    }
                });
            } else {
                message.reply('❌ Errore nella generazione dell\'audio.');
            }
        } catch (error) {
            console.error('Errore nel parlare:', error);
            message.reply('❌ Errore nella sintesi vocale.');
        }
    }

    async toggleListening(message) {
        const connection = this.connections.get(message.guild.id);
        
        if (!connection) {
            return message.reply('❌ Non sono connesso a un canale vocale! Usa `!join` prima.');
        }

        const isListening = this.listeningStates.get(message.guild.id) || false;
        
        if (isListening) {
            this.stopListening(message.guild.id);
            message.reply('🔇 Ascolto AI disattivato.');
        } else {
            this.startListening(message.guild.id, message.channel);
            message.reply('🎤 Ascolto AI attivato! Parla nel canale vocale e risponderò.');
        }
    }

    startListening(guildId, textChannel) {
        const connection = this.connections.get(guildId);
        if (!connection) return;

        this.listeningStates.set(guildId, true);
        
        // Setup per ricevere audio dagli utenti
        connection.receiver.speaking.on('start', (userId) => {
            if (userId === this.client.user.id) return; // Ignora il bot stesso
            
            console.log(`🎤 ${userId} ha iniziato a parlare`);
            this.handleUserSpeech(userId, guildId, textChannel);
        });

        console.log(`🎤 Ascolto attivato per guild ${guildId}`);
    }

    stopListening(guildId) {
        this.listeningStates.set(guildId, false);
        console.log(`🔇 Ascolto disattivato per guild ${guildId}`);
    }

    async handleUserSpeech(userId, guildId, textChannel) {
        if (!this.listeningStates.get(guildId)) return;

        try {
            const connection = this.connections.get(guildId);
            const audioStream = connection.receiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 1000
                }
            });

            const audioPath = path.join(this.tempDir, `voice_${userId}_${Date.now()}.pcm`);
            const writeStream = createWriteStream(audioPath);

            pipeline(audioStream, writeStream, async (error) => {
                if (error) {
                    console.error('Errore nel salvare l\'audio:', error);
                    return;
                }

                // Converti l'audio in testo
                const transcript = await this.generateSTT(audioPath);
                
                if (transcript && transcript.length > 5) {
                    // Invia solo la trascrizione nel canale di testo
                    const user = await this.client.users.fetch(userId);
                    textChannel.send(`🎤 **${user.username}:** "${transcript}"`);
                }

                // Pulisci il file temporaneo
                if (fs.existsSync(audioPath)) {
                    fs.unlinkSync(audioPath);
                }
            });
        } catch (error) {
            console.error('Errore nella gestione del parlato:', error);
        }
    }

    async speakInVoiceAuto(guildId, text) {
        const player = this.players.get(guildId);
        if (!player) return;

        try {
            const audioBuffer = await this.generateTTS(text);
            
            if (audioBuffer) {
                const audioPath = path.join(this.tempDir, `auto_speech_${Date.now()}.wav`);
                fs.writeFileSync(audioPath, audioBuffer);
                
                const resource = createAudioResource(audioPath, {
                    inlineVolume: true
                });
                
                resource.volume.setVolume(0.6);
                player.play(resource);
                
                // Pulisci il file temporaneo dopo la riproduzione
                player.once(AudioPlayerStatus.Idle, () => {
                    if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath);
                    }
                });
            }
        } catch (error) {
            console.error('Errore nel parlato automatico:', error);
        }
    }

    async generateTTS(text) {
        try {
            // Configurazione per Google Cloud Text-to-Speech
            const request = {
                input: { text: text },
                voice: {
                    languageCode: 'it-IT',
                    name: 'it-IT-Wavenet-A',
                    ssmlGender: 'NEUTRAL'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: 1.0,
                    pitch: 0.0,
                    volumeGainDb: 0.0
                }
            };

            const [response] = await this.ttsClient.synthesizeSpeech(request);
            return response.audioContent;
        } catch (error) {
            console.error('Errore TTS:', error);
            // Fallback: genera un buffer audio fittizio
            return Buffer.from('mock audio data for: ' + text);
        }
    }

    async generateSTT(audioPath) {
        try {
            const audioBytes = fs.readFileSync(audioPath);
            
            const request = {
                audio: {
                    content: audioBytes.toString('base64')
                },
                config: {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 48000,
                    languageCode: 'it-IT',
                    enableAutomaticPunctuation: true
                }
            };

            const [response] = await this.sttClient.recognize(request);
            
            if (response.results && response.results.length > 0) {
                return response.results[0].alternatives[0].transcript;
            }
            
            return null;
        } catch (error) {
            console.error('Errore STT:', error);
            return 'Testo riconosciuto simulato'; // Fallback
        }
    }

    handleVoiceStateUpdate(oldState, newState) {
        // Gestisce quando gli utenti entrano/escono dai canali vocali
        if (newState.member.user.bot) return;

        const guildId = newState.guild.id;
        const connection = this.connections.get(guildId);
        
        if (!connection) return;

        // Se l'utente è entrato nel canale del bot
        if (newState.channelId === connection.joinConfig.channelId && !oldState.channelId) {
            console.log(`👋 ${newState.member.user.username} è entrato nel canale vocale`);
        }
        
        // Se l'utente è uscito dal canale del bot
        if (oldState.channelId === connection.joinConfig.channelId && !newState.channelId) {
            console.log(`👋 ${oldState.member.user.username} è uscito dal canale vocale`);
        }
    }

    cleanup(guildId) {
        const connection = this.connections.get(guildId);
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
        }
        
        this.players.delete(guildId);
        this.listeningStates.delete(guildId);
        
        console.log(`🧹 Cleanup completato per guild ${guildId}`);
    }

    getActiveConnections() {
        return this.connections.size;
    }

    getListeningStates() {
        return Array.from(this.listeningStates.entries())
            .filter(([guildId, isListening]) => isListening)
            .map(([guildId]) => guildId);
    }
}

module.exports = VoiceManager;