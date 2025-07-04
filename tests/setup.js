/**
 * Jest Setup File
 * Configurazione globale per i test
 */

const path = require('path');
const fs = require('fs');

// Mock console per ridurre il rumore nei test
global.console = {
  ...console,
  // Mantieni solo errori e warn nei test
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error
};

// Mock per Discord.js
jest.mock('discord.js', () => {
  const mockClient = {
    login: jest.fn().mockResolvedValue('mock-token'),
    on: jest.fn(),
    once: jest.fn(),
    user: {
      id: 'mock-bot-id',
      username: 'MockBot',
      tag: 'MockBot#0000'
    },
    guilds: {
      cache: new Map()
    },
    channels: {
      cache: new Map()
    },
    destroy: jest.fn().mockResolvedValue()
  };

  return {
    Client: jest.fn(() => mockClient),
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 2,
      GuildVoiceStates: 4,
      MessageContent: 8
    },
    Events: {
      Ready: 'ready',
      MessageCreate: 'messageCreate',
      InteractionCreate: 'interactionCreate'
    },
    SlashCommandBuilder: jest.fn(() => ({
      setName: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      addStringOption: jest.fn().mockReturnThis(),
      addIntegerOption: jest.fn().mockReturnThis(),
      toJSON: jest.fn().mockReturnValue({})
    })),
    REST: jest.fn(() => ({
      setToken: jest.fn().mockReturnThis(),
      put: jest.fn().mockResolvedValue([])
    })),
    Routes: {
      applicationGuildCommands: jest.fn().mockReturnValue('mock-route')
    }
  };
});

// Mock per @discordjs/voice
jest.mock('@discordjs/voice', () => ({
  joinVoiceChannel: jest.fn().mockReturnValue({
    destroy: jest.fn(),
    subscribe: jest.fn(),
    on: jest.fn()
  }),
  createAudioPlayer: jest.fn().mockReturnValue({
    play: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    unpause: jest.fn(),
    on: jest.fn(),
    state: { status: 'idle' }
  }),
  createAudioResource: jest.fn().mockReturnValue({
    playStream: 'mock-stream'
  }),
  AudioPlayerStatus: {
    Idle: 'idle',
    Playing: 'playing',
    Paused: 'paused'
  },
  VoiceConnectionStatus: {
    Ready: 'ready',
    Connecting: 'connecting',
    Disconnected: 'disconnected'
  }
}));

// Mock per ytdl-core
jest.mock('ytdl-core', () => {
  const mockStream = {
    pipe: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    destroy: jest.fn()
  };
  
  const ytdl = jest.fn().mockReturnValue(mockStream);
  ytdl.validateURL = jest.fn().mockReturnValue(true);
  ytdl.getInfo = jest.fn().mockResolvedValue({
    videoDetails: {
      title: 'Mock Video Title',
      author: { name: 'Mock Author' },
      lengthSeconds: '240',
      videoId: 'mock-video-id'
    }
  });
  
  return ytdl;
});

// Mock per play-dl
jest.mock('play-dl', () => ({
  search: jest.fn().mockResolvedValue([
    {
      title: 'Mock Song',
      url: 'https://youtube.com/watch?v=mock',
      durationInSec: 240,
      channel: { name: 'Mock Channel' }
    }
  ]),
  stream: jest.fn().mockResolvedValue({
    stream: 'mock-stream',
    type: 'opus'
  }),
  validate: jest.fn().mockReturnValue('yt_video')
}));

// Mock per socket.io
jest.mock('socket.io', () => {
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn()
  };
  
  const mockIo = {
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnValue({
      emit: jest.fn()
    }),
    sockets: {
      sockets: new Map()
    }
  };
  
  return {
    Server: jest.fn(() => mockIo),
    Socket: jest.fn(() => mockSocket)
  };
});

// Mock per express
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn((port, callback) => {
      if (callback) callback();
      return {
        close: jest.fn()
      };
    }),
    set: jest.fn()
  };
  
  const express = jest.fn(() => mockApp);
  express.static = jest.fn().mockReturnValue('mock-static-middleware');
  express.json = jest.fn().mockReturnValue('mock-json-middleware');
  express.urlencoded = jest.fn().mockReturnValue('mock-urlencoded-middleware');
  
  return express;
});

// Utility per creare directory temporanee per i test
global.createTempDir = () => {
  const tempDir = path.join(__dirname, '..', 'temp', `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
};

// Utility per pulire directory temporanee
global.cleanupTempDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

// Mock per file system operations nei test
global.mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  rmSync: jest.fn()
};

// Timeout globale per i test asincroni
jest.setTimeout(30000);

// Setup per ogni test
beforeEach(() => {
  // Reset tutti i mock
  jest.clearAllMocks();
  
  // Reset console mocks
  global.console.log.mockClear();
  global.console.debug.mockClear();
  global.console.info.mockClear();
});

// Cleanup dopo ogni test
afterEach(() => {
  // Cleanup eventuali timer
  jest.clearAllTimers();
});

// Setup globale
beforeAll(() => {
  // Imposta timezone per test consistenti
  process.env.TZ = 'UTC';
});

// Cleanup globale
afterAll(() => {
  // Cleanup finale
});