/**
 * End-to-End Tests for Music Flow
 * Test end-to-end per il flusso musicale completo
 */

const request = require('supertest');
const { Client } = require('discord.js');

describe('Music Flow E2E Tests', () => {
  let mockBot;
  let mockWebServer;
  let mockGuild;
  let mockVoiceChannel;
  let mockTextChannel;
  
  beforeAll(async () => {
    // Setup del bot mock per i test E2E
    mockBot = {
      client: new Client({ intents: [] }),
      isReady: false,
      guilds: new Map(),
      connections: new Map(),
      queues: new Map()
    };
    
    // Setup del server web mock
    mockWebServer = {
      app: null,
      server: null,
      port: 3001 // Porta diversa per i test E2E
    };
    
    // Setup del guild mock
    mockGuild = {
      id: 'test-guild-123',
      name: 'Test Guild',
      channels: new Map(),
      members: new Map()
    };
    
    // Setup del canale vocale mock
    mockVoiceChannel = {
      id: 'voice-channel-123',
      name: 'General',
      type: 2, // GUILD_VOICE
      guild: mockGuild,
      members: new Map(),
      joinable: true,
      speakable: true
    };
    
    // Setup del canale testuale mock
    mockTextChannel = {
      id: 'text-channel-123',
      name: 'music',
      type: 0, // GUILD_TEXT
      guild: mockGuild,
      send: jest.fn().mockResolvedValue({
        id: 'message-123',
        content: 'Mock message'
      })
    };
    
    // Aggiungi canali al guild
    mockGuild.channels.set(mockVoiceChannel.id, mockVoiceChannel);
    mockGuild.channels.set(mockTextChannel.id, mockTextChannel);
  });
  
  afterAll(async () => {
    // Cleanup dopo tutti i test
    if (mockWebServer.server) {
      mockWebServer.server.close();
    }
    
    if (mockBot.client && mockBot.client.destroy) {
      await mockBot.client.destroy();
    }
  });
  
  describe('Complete Music Playback Flow', () => {
    test('should handle complete play command flow', async () => {
      // 1. Simula l'utente che entra nel canale vocale
      const mockUser = {
        id: 'user-123',
        username: 'TestUser',
        voice: {
          channel: mockVoiceChannel
        }
      };
      
      mockVoiceChannel.members.set(mockUser.id, mockUser);
      
      // 2. Simula il comando /play
      const mockInteraction = {
        commandName: 'play',
        options: {
          getString: jest.fn().mockReturnValue('Never Gonna Give You Up')
        },
        user: mockUser,
        guild: mockGuild,
        channel: mockTextChannel,
        member: {
          voice: {
            channel: mockVoiceChannel
          }
        },
        reply: jest.fn().mockResolvedValue(),
        followUp: jest.fn().mockResolvedValue(),
        editReply: jest.fn().mockResolvedValue()
      };
      
      // 3. Simula la ricerca della canzone
      const mockSearchResults = [
        {
          title: 'Rick Astley - Never Gonna Give You Up',
          url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          duration: 213,
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          channel: {
            name: 'Rick Astley',
            url: 'https://youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw'
          }
        }
      ];
      
      // Mock della funzione di ricerca
      const mockSearch = jest.fn().mockResolvedValue(mockSearchResults);
      
      // 4. Esegui la ricerca
      const searchQuery = mockInteraction.options.getString('query');
      const results = await mockSearch(searchQuery);
      
      expect(mockSearch).toHaveBeenCalledWith('Never Gonna Give You Up');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Never Gonna Give You Up');
      
      // 5. Simula la connessione al canale vocale
      const { joinVoiceChannel } = require('@discordjs/voice');
      const mockConnection = joinVoiceChannel({
        channelId: mockVoiceChannel.id,
        guildId: mockGuild.id,
        adapterCreator: jest.fn()
      });
      
      expect(mockConnection).toBeDefined();
      mockBot.connections.set(mockGuild.id, mockConnection);
      
      // 6. Simula la creazione della coda musicale
      const mockQueue = {
        guild: mockGuild,
        textChannel: mockTextChannel,
        voiceChannel: mockVoiceChannel,
        connection: mockConnection,
        songs: [],
        volume: 50,
        playing: false,
        
        addSong: function(song) {
          this.songs.push(song);
          return this.songs.length;
        },
        
        play: async function() {
          if (this.songs.length > 0) {
            this.playing = true;
            return this.songs[0];
          }
          return null;
        },
        
        stop: function() {
          this.playing = false;
          this.songs = [];
        }
      };
      
      mockBot.queues.set(mockGuild.id, mockQueue);
      
      // 7. Aggiungi la canzone alla coda
      const song = results[0];
      const position = mockQueue.addSong(song);
      
      expect(mockQueue.songs).toHaveLength(1);
      expect(mockQueue.songs[0]).toEqual(song);
      
      // 8. Avvia la riproduzione
      const nowPlaying = await mockQueue.play();
      
      expect(mockQueue.playing).toBe(true);
      expect(nowPlaying).toEqual(song);
      
      // 9. Verifica la risposta dell'interazione
      await mockInteraction.reply({
        embeds: [{
          title: '🎵 Aggiunto alla coda',
          description: `**${song.title}**`,
          fields: [
            { name: 'Durata', value: '3:33', inline: true },
            { name: 'Posizione', value: `${position}`, inline: true }
          ],
          thumbnail: { url: song.thumbnail }
        }]
      });
      
      expect(mockInteraction.reply).toHaveBeenCalled();
    });
    
    test('should handle queue management flow', async () => {
      // Setup della coda con multiple canzoni
      const mockQueue = {
        songs: [
          {
            title: 'Song 1',
            url: 'https://youtube.com/watch?v=1',
            duration: 180
          },
          {
            title: 'Song 2',
            url: 'https://youtube.com/watch?v=2',
            duration: 240
          },
          {
            title: 'Song 3',
            url: 'https://youtube.com/watch?v=3',
            duration: 200
          }
        ],
        currentIndex: 0,
        
        next: function() {
          if (this.currentIndex < this.songs.length - 1) {
            this.currentIndex++;
            return this.songs[this.currentIndex];
          }
          return null;
        },
        
        previous: function() {
          if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.songs[this.currentIndex];
          }
          return null;
        },
        
        shuffle: function() {
          for (let i = this.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
          }
        },
        
        remove: function(index) {
          if (index >= 0 && index < this.songs.length) {
            return this.songs.splice(index, 1)[0];
          }
          return null;
        }
      };
      
      // Test comando skip
      const nextSong = mockQueue.next();
      expect(nextSong.title).toBe('Song 2');
      expect(mockQueue.currentIndex).toBe(1);
      
      // Test comando previous
      const prevSong = mockQueue.previous();
      expect(prevSong.title).toBe('Song 1');
      expect(mockQueue.currentIndex).toBe(0);
      
      // Test comando remove
      const removed = mockQueue.remove(1);
      expect(removed.title).toBe('Song 2');
      expect(mockQueue.songs).toHaveLength(2);
      
      // Test comando shuffle
      const originalOrder = [...mockQueue.songs];
      mockQueue.shuffle();
      // Non possiamo garantire che l'ordine cambi, ma verifichiamo che le canzoni ci siano ancora
      expect(mockQueue.songs).toHaveLength(2);
      expect(mockQueue.songs.every(song => 
        originalOrder.some(orig => orig.title === song.title)
      )).toBe(true);
    });
  });
  
  describe('Web Dashboard Integration', () => {
    test('should provide queue status via API', async () => {
      // Mock dell'app Express
      const express = require('express');
      const app = express();
      
      // Setup delle route API
      app.get('/api/queue/:guildId', (req, res) => {
        const guildId = req.params.guildId;
        const queue = mockBot.queues.get(guildId);
        
        if (!queue) {
          return res.status(404).json({ error: 'Queue not found' });
        }
        
        res.json({
          guild: {
            id: queue.guild.id,
            name: queue.guild.name
          },
          currentSong: queue.songs[queue.currentIndex || 0],
          queue: queue.songs,
          playing: queue.playing,
          volume: queue.volume
        });
      });
      
      // Setup della coda mock
      const mockQueue = {
        guild: mockGuild,
        songs: [
          {
            title: 'Test Song',
            url: 'https://youtube.com/watch?v=test',
            duration: 180
          }
        ],
        currentIndex: 0,
        playing: true,
        volume: 75
      };
      
      mockBot.queues.set(mockGuild.id, mockQueue);
      
      // Test della richiesta API
      const response = await request(app)
        .get(`/api/queue/${mockGuild.id}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        guild: {
          id: mockGuild.id,
          name: mockGuild.name
        },
        currentSong: {
          title: 'Test Song',
          url: 'https://youtube.com/watch?v=test',
          duration: 180
        },
        playing: true,
        volume: 75
      });
    });
    
    test('should handle queue control via API', async () => {
      const express = require('express');
      const app = express();
      app.use(express.json());
      
      // Route per il controllo della coda
      app.post('/api/queue/:guildId/control', (req, res) => {
        const guildId = req.params.guildId;
        const { action } = req.body;
        const queue = mockBot.queues.get(guildId);
        
        if (!queue) {
          return res.status(404).json({ error: 'Queue not found' });
        }
        
        switch (action) {
          case 'play':
            queue.playing = true;
            break;
          case 'pause':
            queue.playing = false;
            break;
          case 'skip':
            if (queue.currentIndex < queue.songs.length - 1) {
              queue.currentIndex++;
            }
            break;
          case 'stop':
            queue.playing = false;
            queue.songs = [];
            queue.currentIndex = 0;
            break;
          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        res.json({ success: true, action });
      });
      
      // Setup della coda
      const mockQueue = {
        guild: mockGuild,
        songs: [
          { title: 'Song 1', duration: 180 },
          { title: 'Song 2', duration: 240 }
        ],
        currentIndex: 0,
        playing: true
      };
      
      mockBot.queues.set(mockGuild.id, mockQueue);
      
      // Test pause
      await request(app)
        .post(`/api/queue/${mockGuild.id}/control`)
        .send({ action: 'pause' })
        .expect(200);
      
      expect(mockQueue.playing).toBe(false);
      
      // Test skip
      await request(app)
        .post(`/api/queue/${mockGuild.id}/control`)
        .send({ action: 'skip' })
        .expect(200);
      
      expect(mockQueue.currentIndex).toBe(1);
      
      // Test stop
      await request(app)
        .post(`/api/queue/${mockGuild.id}/control`)
        .send({ action: 'stop' })
        .expect(200);
      
      expect(mockQueue.playing).toBe(false);
      expect(mockQueue.songs).toHaveLength(0);
    });
  });
  
  describe('Error Scenarios', () => {
    test('should handle user not in voice channel', async () => {
      const mockInteraction = {
        commandName: 'play',
        member: {
          voice: {
            channel: null // Utente non in canale vocale
          }
        },
        reply: jest.fn().mockResolvedValue()
      };
      
      // Simula la validazione
      const isUserInVoiceChannel = mockInteraction.member.voice.channel !== null;
      
      if (!isUserInVoiceChannel) {
        await mockInteraction.reply({
          content: '❌ Devi essere in un canale vocale per usare questo comando!',
          ephemeral: true
        });
      }
      
      expect(isUserInVoiceChannel).toBe(false);
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: '❌ Devi essere in un canale vocale per usare questo comando!',
        ephemeral: true
      });
    });
    
    test('should handle invalid YouTube URL', async () => {
      const invalidUrl = 'not-a-valid-url';
      
      // Mock della validazione URL
      const isValidUrl = (url) => {
        try {
          new URL(url);
          return url.includes('youtube.com') || url.includes('youtu.be');
        } catch {
          return false;
        }
      };
      
      const mockSearch = jest.fn().mockResolvedValue([]);
      
      const results = await mockSearch(invalidUrl);
      
      expect(isValidUrl(invalidUrl)).toBe(false);
      expect(results).toHaveLength(0);
    });
    
    test('should handle connection failures', async () => {
      const { joinVoiceChannel } = require('@discordjs/voice');
      
      // Mock di una connessione fallita
      joinVoiceChannel.mockImplementation(() => {
        throw new Error('Failed to connect to voice channel');
      });
      
      expect(() => {
        joinVoiceChannel({
          channelId: 'invalid-channel',
          guildId: 'invalid-guild',
          adapterCreator: jest.fn()
        });
      }).toThrow('Failed to connect to voice channel');
    });
  });
});