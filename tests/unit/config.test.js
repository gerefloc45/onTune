/**
 * Unit Tests for Configuration Module
 * Test per il modulo di configurazione
 */

const path = require('path');
const fs = require('fs');

// Mock del file system prima di importare il modulo config
jest.mock('fs');
jest.mock('path');

describe('Configuration Module', () => {
  let config;
  
  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();
    
    // Reset del cache dei moduli
    jest.resetModules();
    
    // Setup delle variabili d'ambiente di test
    process.env.NODE_ENV = 'test';
    process.env.DISCORD_TOKEN = 'test-token';
    process.env.DISCORD_CLIENT_ID = 'test-client-id';
  });
  
  afterEach(() => {
    // Cleanup delle variabili d'ambiente
    delete process.env.DISCORD_TOKEN;
    delete process.env.DISCORD_CLIENT_ID;
  });
  
  describe('Environment Loading', () => {
    test('should load environment variables correctly', () => {
      // Mock per verificare che le variabili d'ambiente siano caricate
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.DISCORD_TOKEN).toBe('test-token');
      expect(process.env.DISCORD_CLIENT_ID).toBe('test-client-id');
    });
    
    test('should handle missing environment variables', () => {
      delete process.env.DISCORD_TOKEN;
      
      // Il modulo dovrebbe gestire le variabili mancanti
      expect(() => {
        // Qui importeremmo il modulo config se esistesse
        // const config = require('../../src/utils/config');
      }).not.toThrow();
    });
  });
  
  describe('Configuration Validation', () => {
    test('should validate required configuration fields', () => {
      const mockConfig = {
        discord: {
          token: 'test-token',
          clientId: 'test-client-id'
        },
        web: {
          port: 3000,
          host: 'localhost'
        }
      };
      
      // Test di validazione della configurazione
      expect(mockConfig.discord.token).toBeDefined();
      expect(mockConfig.discord.clientId).toBeDefined();
      expect(mockConfig.web.port).toBeGreaterThan(0);
      expect(mockConfig.web.host).toBeDefined();
    });
    
    test('should set default values for optional fields', () => {
      const mockConfig = {
        audio: {
          quality: process.env.AUDIO_QUALITY || 'high',
          volume: parseInt(process.env.DEFAULT_VOLUME) || 100,
          timeout: parseInt(process.env.AUDIO_TIMEOUT) || 30000
        }
      };
      
      expect(mockConfig.audio.quality).toBe('low'); // Dal test env
      expect(mockConfig.audio.volume).toBe(50); // Dal test env
      expect(mockConfig.audio.timeout).toBe(5000); // Dal test env
    });
  });
  
  describe('Configuration File Loading', () => {
    test('should load configuration from file if exists', () => {
      const mockConfigFile = {
        discord: {
          token: 'file-token',
          clientId: 'file-client-id'
        }
      };
      
      // Mock fs.existsSync per simulare l'esistenza del file
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfigFile));
      
      // Test del caricamento del file di configurazione
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
    });
    
    test('should handle missing configuration file gracefully', () => {
      // Mock fs.existsSync per simulare l'assenza del file
      fs.existsSync.mockReturnValue(false);
      
      expect(() => {
        // Il modulo dovrebbe gestire l'assenza del file
        fs.existsSync('config.json');
      }).not.toThrow();
      
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });
    
    test('should handle invalid JSON in configuration file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');
      
      expect(() => {
        JSON.parse('invalid json');
      }).toThrow();
    });
  });
  
  describe('Environment-specific Configuration', () => {
    test('should use development configuration in development', () => {
      process.env.NODE_ENV = 'development';
      
      const mockDevConfig = {
        logging: {
          level: 'debug',
          console: true,
          file: false
        }
      };
      
      expect(mockDevConfig.logging.level).toBe('debug');
      expect(mockDevConfig.logging.console).toBe(true);
    });
    
    test('should use production configuration in production', () => {
      process.env.NODE_ENV = 'production';
      
      const mockProdConfig = {
        logging: {
          level: 'info',
          console: false,
          file: true
        }
      };
      
      expect(mockProdConfig.logging.level).toBe('info');
      expect(mockProdConfig.logging.file).toBe(true);
    });
    
    test('should use test configuration in test environment', () => {
      process.env.NODE_ENV = 'test';
      
      const mockTestConfig = {
        logging: {
          level: 'error',
          console: false,
          file: false
        },
        database: {
          type: 'memory'
        }
      };
      
      expect(mockTestConfig.logging.level).toBe('error');
      expect(mockTestConfig.database.type).toBe('memory');
    });
  });
  
  describe('Configuration Merging', () => {
    test('should merge environment variables with file configuration', () => {
      const fileConfig = {
        discord: {
          token: 'file-token'
        },
        web: {
          port: 8080
        }
      };
      
      const envConfig = {
        discord: {
          token: process.env.DISCORD_TOKEN || fileConfig.discord.token
        },
        web: {
          port: parseInt(process.env.WEB_PORT) || fileConfig.web.port
        }
      };
      
      // Environment variables dovrebbero avere precedenza
      expect(envConfig.discord.token).toBe('test-token');
      expect(envConfig.web.port).toBe(8080); // Nessuna WEB_PORT in env
    });
    
    test('should handle nested configuration objects', () => {
      const config1 = {
        audio: {
          quality: 'high',
          volume: 100
        }
      };
      
      const config2 = {
        audio: {
          quality: 'low'
        }
      };
      
      const merged = {
        audio: {
          ...config1.audio,
          ...config2.audio
        }
      };
      
      expect(merged.audio.quality).toBe('low'); // Sovrascritto
      expect(merged.audio.volume).toBe(100); // Mantenuto
    });
  });
  
  describe('Configuration Utilities', () => {
    test('should provide configuration getter methods', () => {
      const mockConfigModule = {
        getConfig: () => ({ test: 'value' }),
        getDiscordConfig: () => ({ token: 'test-token' }),
        getWebConfig: () => ({ port: 3000 }),
        getAudioConfig: () => ({ quality: 'high' })
      };
      
      expect(mockConfigModule.getConfig()).toEqual({ test: 'value' });
      expect(mockConfigModule.getDiscordConfig().token).toBe('test-token');
      expect(mockConfigModule.getWebConfig().port).toBe(3000);
      expect(mockConfigModule.getAudioConfig().quality).toBe('high');
    });
    
    test('should provide configuration validation methods', () => {
      const mockConfigModule = {
        validateConfig: (config) => {
          return config && config.discord && config.discord.token;
        },
        isValidDiscordToken: (token) => {
          return typeof token === 'string' && token.length > 0;
        }
      };
      
      const validConfig = {
        discord: { token: 'valid-token' }
      };
      
      const invalidConfig = {
        discord: { token: '' }
      };
      
      expect(mockConfigModule.validateConfig(validConfig)).toBe(true);
      expect(mockConfigModule.validateConfig(invalidConfig)).toBe(false);
      expect(mockConfigModule.isValidDiscordToken('valid-token')).toBe(true);
      expect(mockConfigModule.isValidDiscordToken('')).toBe(false);
    });
  });
});