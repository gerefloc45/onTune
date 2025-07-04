/**
 * Environment Configuration for Tests
 * Configurazione delle variabili d'ambiente per i test
 */

// Imposta NODE_ENV per i test
process.env.NODE_ENV = 'test';

// Configurazione di base per i test
process.env.LOG_LEVEL = 'error'; // Solo errori nei test
process.env.LOG_TO_FILE = 'false';
process.env.LOG_TO_CONSOLE = 'false';

// Discord Bot Configuration (valori mock)
process.env.DISCORD_TOKEN = 'mock-discord-token-for-testing';
process.env.DISCORD_CLIENT_ID = 'mock-client-id';
process.env.DISCORD_GUILD_ID = 'mock-guild-id';

// Web Server Configuration
process.env.WEB_PORT = '0'; // Porta casuale per i test
process.env.WEB_HOST = 'localhost';
process.env.API_BASE_URL = 'http://localhost';

// Database Configuration (se necessario)
process.env.DB_TYPE = 'memory'; // Database in memoria per i test
process.env.DB_PATH = ':memory:';

// Cache Configuration
process.env.CACHE_TYPE = 'memory';
process.env.CACHE_TTL = '300';
process.env.CACHE_MAX_SIZE = '100';

// Audio Configuration
process.env.AUDIO_QUALITY = 'low'; // Qualità bassa per test più veloci
process.env.MAX_QUEUE_SIZE = '5';
process.env.DEFAULT_VOLUME = '50';
process.env.AUDIO_TIMEOUT = '5000';

// YouTube Configuration (mock)
process.env.YOUTUBE_API_KEY = 'mock-youtube-api-key';
process.env.YOUTUBE_COOKIE = 'mock-youtube-cookie';

// Spotify Configuration (mock)
process.env.SPOTIFY_CLIENT_ID = 'mock-spotify-client-id';
process.env.SPOTIFY_CLIENT_SECRET = 'mock-spotify-client-secret';

// Security Configuration
process.env.JWT_SECRET = 'mock-jwt-secret-for-testing-only';
process.env.SESSION_SECRET = 'mock-session-secret-for-testing';
process.env.ENCRYPTION_KEY = 'mock-encryption-key-32-chars-long';

// Rate Limiting (più permissivo per i test)
process.env.RATE_LIMIT_WINDOW = '60000'; // 1 minuto
process.env.RATE_LIMIT_MAX_REQUESTS = '1000'; // Molte richieste per i test

// Feature Flags
process.env.ENABLE_WEB_DASHBOARD = 'true';
process.env.ENABLE_API_SERVER = 'true';
process.env.ENABLE_METRICS = 'false'; // Disabilita metriche nei test
process.env.ENABLE_ANALYTICS = 'false';
process.env.ENABLE_CRASH_REPORTING = 'false';

// Development Features (disabilitate nei test)
process.env.ENABLE_HOT_RELOAD = 'false';
process.env.ENABLE_DEBUG_MODE = 'false';
process.env.ENABLE_PROFILING = 'false';

// Paths Configuration
process.env.LOGS_DIR = './temp/test-logs';
process.env.CACHE_DIR = './temp/test-cache';
process.env.TEMP_DIR = './temp/test-temp';
process.env.BACKUP_DIR = './temp/test-backups';
process.env.AUDIO_CACHE_DIR = './temp/test-audio-cache';

// External Services (mock endpoints)
process.env.HEALTH_CHECK_URL = 'http://localhost/health';
process.env.METRICS_ENDPOINT = 'http://localhost/metrics';
process.env.WEBHOOK_URL = 'http://localhost/webhook';

// Timeouts (più brevi per test più veloci)
process.env.CONNECTION_TIMEOUT = '5000';
process.env.REQUEST_TIMEOUT = '3000';
process.env.SHUTDOWN_TIMEOUT = '2000';

// Memory Limits (più bassi per i test)
process.env.MAX_MEMORY_USAGE = '128'; // 128MB
process.env.MEMORY_CHECK_INTERVAL = '10000'; // 10 secondi

// Concurrency Limits
process.env.MAX_CONCURRENT_DOWNLOADS = '2';
process.env.MAX_CONCURRENT_STREAMS = '1';
process.env.MAX_CONCURRENT_REQUESTS = '5';

// Test-specific Configuration
process.env.TEST_TIMEOUT = '30000'; // 30 secondi
process.env.TEST_RETRIES = '0'; // Nessun retry nei test
process.env.TEST_PARALLEL = 'false';

// Disable external network calls in tests
process.env.DISABLE_EXTERNAL_CALLS = 'true';
process.env.MOCK_EXTERNAL_SERVICES = 'true';

// Cleanup Configuration
process.env.AUTO_CLEANUP = 'true';
process.env.CLEANUP_INTERVAL = '5000'; // 5 secondi
process.env.TEMP_FILE_TTL = '300'; // 5 minuti

// Validation
process.env.STRICT_VALIDATION = 'true';
process.env.VALIDATE_CONFIG = 'true';
process.env.FAIL_ON_MISSING_CONFIG = 'false'; // Permissivo nei test

console.log('✓ Test environment variables configured');