const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class ConfigValidator {
    constructor() {
        this.requiredVars = [
            'DISCORD_TOKEN',
            'DISCORD_CLIENT_ID'
        ];
        
        this.optionalVars = {
            WEB_PORT: '3000',
            NODE_ENV: 'development',
            LOG_LEVEL: 'info',
            LOG_FILE_ENABLED: 'true',
            PERFORMANCE_MONITORING: 'true',
            METRICS_RETENTION_HOURS: '24',
            CACHE_TTL_MINUTES: '15',
            CACHE_MAX_SIZE: '1000',
            RATE_LIMIT_WINDOW_MINUTES: '15',
            RATE_LIMIT_MAX_REQUESTS: '100',
            MEMORY_THRESHOLD_PERCENT: '80',
            GC_INTERVAL_MINUTES: '5'
        };
    }
    
    loadConfig() {
        // Carica file .env se esiste
        const envPath = path.join(__dirname, '../../.env');
        if (fs.existsSync(envPath)) {
            require('dotenv').config({ path: envPath });
            logger.system('✅ File .env caricato');
        } else {
            logger.system('⚠️ File .env non trovato, usando variabili di sistema');
        }
        
        // Valida variabili richieste
        const missingVars = this.validateRequired();
        if (missingVars.length > 0) {
            logger.system('❌ Variabili d\'ambiente mancanti:', missingVars);
            throw new Error(`Variabili d'ambiente mancanti: ${missingVars.join(', ')}`);
        }
        
        // Imposta valori di default per variabili opzionali
        this.setDefaults();
        
        // Valida e converte tipi
        this.validateAndConvert();
        
        logger.system('✅ Configurazione validata e caricata');
        
        return this.getConfig();
    }
    
    validateRequired() {
        const missing = [];
        
        for (const varName of this.requiredVars) {
            if (!process.env[varName]) {
                missing.push(varName);
            }
        }
        
        return missing;
    }
    
    setDefaults() {
        for (const [varName, defaultValue] of Object.entries(this.optionalVars)) {
            if (!process.env[varName]) {
                process.env[varName] = defaultValue;
                logger.system(`📝 Impostato valore default per ${varName}: ${defaultValue}`);
            }
        }
    }
    
    validateAndConvert() {
        // Valida e converte WEB_PORT
        const port = parseInt(process.env.WEB_PORT);
        if (isNaN(port) || port < 1 || port > 65535) {
            throw new Error(`WEB_PORT non valido: ${process.env.WEB_PORT}`);
        }
        process.env.WEB_PORT = port.toString();
        
        // Valida NODE_ENV
        const validEnvs = ['development', 'production', 'test'];
        if (!validEnvs.includes(process.env.NODE_ENV)) {
            logger.system(`⚠️ NODE_ENV non valido: ${process.env.NODE_ENV}, usando 'development'`);
            process.env.NODE_ENV = 'development';
        }
        
        // Valida LOG_LEVEL
        const validLogLevels = ['error', 'warn', 'info', 'debug'];
        if (!validLogLevels.includes(process.env.LOG_LEVEL)) {
            logger.system(`⚠️ LOG_LEVEL non valido: ${process.env.LOG_LEVEL}, usando 'info'`);
            process.env.LOG_LEVEL = 'info';
        }
        
        // Converte valori booleani
        const booleanVars = ['LOG_FILE_ENABLED', 'PERFORMANCE_MONITORING'];
        for (const varName of booleanVars) {
            const value = process.env[varName].toLowerCase();
            process.env[varName] = (value === 'true' || value === '1').toString();
        }
        
        // Valida valori numerici
        const numericVars = {
            METRICS_RETENTION_HOURS: { min: 1, max: 168 }, // 1 ora - 1 settimana
            CACHE_TTL_MINUTES: { min: 1, max: 1440 }, // 1 minuto - 1 giorno
            CACHE_MAX_SIZE: { min: 100, max: 10000 },
            RATE_LIMIT_WINDOW_MINUTES: { min: 1, max: 60 },
            RATE_LIMIT_MAX_REQUESTS: { min: 10, max: 1000 },
            MEMORY_THRESHOLD_PERCENT: { min: 50, max: 95 },
            GC_INTERVAL_MINUTES: { min: 1, max: 60 }
        };
        
        for (const [varName, { min, max }] of Object.entries(numericVars)) {
            const value = parseInt(process.env[varName]);
            if (isNaN(value) || value < min || value > max) {
                logger.system(`⚠️ ${varName} non valido: ${process.env[varName]}, usando valore default`);
                process.env[varName] = this.optionalVars[varName];
            }
        }
    }
    
    getConfig() {
        return {
            discord: {
                token: process.env.DISCORD_TOKEN,
                clientId: process.env.DISCORD_CLIENT_ID
            },
            web: {
                port: parseInt(process.env.WEB_PORT),
                allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                isDevelopment: process.env.NODE_ENV === 'development',
                isProduction: process.env.NODE_ENV === 'production'
            },
            logging: {
                level: process.env.LOG_LEVEL,
                fileEnabled: process.env.LOG_FILE_ENABLED === 'true'
            },
            performance: {
                monitoringEnabled: process.env.PERFORMANCE_MONITORING === 'true',
                metricsRetentionHours: parseInt(process.env.METRICS_RETENTION_HOURS),
                memoryThresholdPercent: parseInt(process.env.MEMORY_THRESHOLD_PERCENT),
                gcIntervalMinutes: parseInt(process.env.GC_INTERVAL_MINUTES)
            },
            cache: {
                ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES),
                maxSize: parseInt(process.env.CACHE_MAX_SIZE)
            },
            rateLimit: {
                windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES),
                maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
            },
            spotify: {
                clientId: process.env.SPOTIFY_CLIENT_ID || null,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET || null,
                enabled: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
            },
            tunnel: {
                ngrokAuthToken: process.env.NGROK_AUTH_TOKEN || null
            }
        };
    }
    
    // Metodo per verificare la configurazione in runtime
    validateRuntime() {
        const issues = [];
        
        // Verifica token Discord
        if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'your_discord_bot_token_here') {
            issues.push('Token Discord non configurato correttamente');
        }
        
        // Verifica configurazione Spotify se abilitata
        if (process.env.SPOTIFY_CLIENT_ID && !process.env.SPOTIFY_CLIENT_SECRET) {
            issues.push('Configurazione Spotify incompleta (manca CLIENT_SECRET)');
        }
        
        // Verifica porta web
        const port = parseInt(process.env.WEB_PORT);
        if (port < 1024 && process.getuid && process.getuid() !== 0) {
            issues.push(`Porta ${port} richiede privilegi amministratore`);
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
    
    // Metodo per ottenere informazioni di debug sulla configurazione
    getDebugInfo() {
        const config = this.getConfig();
        
        // Rimuovi informazioni sensibili
        const debugConfig = JSON.parse(JSON.stringify(config));
        if (debugConfig.discord.token) {
            debugConfig.discord.token = debugConfig.discord.token.substring(0, 10) + '...';
        }
        if (debugConfig.spotify.clientSecret) {
            debugConfig.spotify.clientSecret = '***';
        }
        if (debugConfig.tunnel.ngrokAuthToken) {
            debugConfig.tunnel.ngrokAuthToken = '***';
        }
        
        return debugConfig;
    }
}

// Singleton
let configInstance = null;

function getConfig() {
    if (!configInstance) {
        const validator = new ConfigValidator();
        configInstance = validator.loadConfig();
    }
    return configInstance;
}

function validateConfig() {
    const validator = new ConfigValidator();
    return validator.validateRuntime();
}

function getDebugConfig() {
    const validator = new ConfigValidator();
    return validator.getDebugInfo();
}

module.exports = { getConfig, validateConfig, getDebugConfig, ConfigValidator };