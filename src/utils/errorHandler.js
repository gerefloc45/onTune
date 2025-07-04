const logger = require('./logger');
const { getMonitor } = require('./monitoring');

class ErrorHandler {
    constructor() {
        this.errorCounts = new Map();
        this.lastErrors = [];
        this.maxLastErrors = 50;
        
        // Tipi di errori e loro gestione
        this.errorTypes = {
            DISCORD_API: {
                retryable: true,
                maxRetries: 3,
                backoffMs: 1000
            },
            VOICE_CONNECTION: {
                retryable: true,
                maxRetries: 2,
                backoffMs: 2000
            },
            MUSIC_STREAM: {
                retryable: true,
                maxRetries: 1,
                backoffMs: 500
            },
            RATE_LIMIT: {
                retryable: true,
                maxRetries: 5,
                backoffMs: 5000
            },
            PERMISSION: {
                retryable: false,
                userMessage: 'Non ho i permessi necessari per eseguire questa azione.'
            },
            VALIDATION: {
                retryable: false,
                userMessage: 'I dati forniti non sono validi.'
            },
            NETWORK: {
                retryable: true,
                maxRetries: 3,
                backoffMs: 2000
            },
            UNKNOWN: {
                retryable: false,
                userMessage: 'Si è verificato un errore imprevisto.'
            }
        };
        
        this.setupGlobalHandlers();
    }
    
    setupGlobalHandlers() {
        // Gestione errori non catturati
        process.on('uncaughtException', (error) => {
            this.handleCriticalError('UNCAUGHT_EXCEPTION', error);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.handleCriticalError('UNHANDLED_REJECTION', reason, { promise });
        });
        
        // Gestione segnali di sistema
        process.on('SIGTERM', () => {
            logger.system('📡 Ricevuto SIGTERM, avvio shutdown graceful...');
            this.gracefulShutdown();
        });
        
        process.on('SIGINT', () => {
            logger.system('📡 Ricevuto SIGINT, avvio shutdown graceful...');
            this.gracefulShutdown();
        });
    }
    
    // Classifica il tipo di errore
    classifyError(error) {
        const message = error.message?.toLowerCase() || '';
        const code = error.code || '';
        
        // Errori Discord API
        if (code.startsWith('50') || message.includes('discord') || message.includes('api')) {
            if (code === '50013' || message.includes('permission')) {
                return 'PERMISSION';
            }
            if (code === '429' || message.includes('rate limit')) {
                return 'RATE_LIMIT';
            }
            return 'DISCORD_API';
        }
        
        // Errori di connessione vocale
        if (message.includes('voice') || message.includes('connection') || code.includes('VOICE')) {
            return 'VOICE_CONNECTION';
        }
        
        // Errori di streaming musicale
        if (message.includes('stream') || message.includes('ytdl') || message.includes('audio')) {
            return 'MUSIC_STREAM';
        }
        
        // Errori di rete
        if (message.includes('network') || message.includes('timeout') || message.includes('enotfound') || message.includes('econnreset')) {
            return 'NETWORK';
        }
        
        // Errori di validazione
        if (message.includes('invalid') || message.includes('validation') || message.includes('required')) {
            return 'VALIDATION';
        }
        
        return 'UNKNOWN';
    }
    
    // Gestione principale degli errori
    async handleError(error, context = {}) {
        const errorType = this.classifyError(error);
        const errorId = this.generateErrorId();
        
        // Registra l'errore
        this.recordError(errorType, error, context, errorId);
        
        // Log dell'errore
        logger.system(`❌ Errore ${errorType} [${errorId}]:`, {
            message: error.message,
            stack: error.stack,
            context: context
        });
        
        // Aggiorna metriche
        const monitor = getMonitor();
        monitor.recordCommand(context.command || 'unknown', context.responseTime || 0, false);
        
        // Determina la strategia di gestione
        const strategy = this.errorTypes[errorType] || this.errorTypes.UNKNOWN;
        
        return {
            errorId,
            errorType,
            retryable: strategy.retryable,
            userMessage: this.getUserMessage(errorType, error, context),
            shouldRetry: strategy.retryable && this.shouldRetry(errorType, context),
            retryDelay: strategy.backoffMs || 0
        };
    }
    
    // Genera un ID univoco per l'errore
    generateErrorId() {
        return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Registra l'errore per statistiche
    recordError(errorType, error, context, errorId) {
        // Conteggio errori per tipo
        const count = this.errorCounts.get(errorType) || 0;
        this.errorCounts.set(errorType, count + 1);
        
        // Mantieni lista degli ultimi errori
        const errorRecord = {
            id: errorId,
            type: errorType,
            message: error.message,
            timestamp: new Date().toISOString(),
            context: context,
            stack: error.stack
        };
        
        this.lastErrors.unshift(errorRecord);
        if (this.lastErrors.length > this.maxLastErrors) {
            this.lastErrors.pop();
        }
    }
    
    // Determina se riprovare l'operazione
    shouldRetry(errorType, context) {
        const strategy = this.errorTypes[errorType];
        if (!strategy.retryable) return false;
        
        const retryCount = context.retryCount || 0;
        return retryCount < strategy.maxRetries;
    }
    
    // Genera messaggio user-friendly
    getUserMessage(errorType, error, context) {
        const strategy = this.errorTypes[errorType];
        
        if (strategy.userMessage) {
            return strategy.userMessage;
        }
        
        // Messaggi specifici per contesto
        switch (errorType) {
            case 'DISCORD_API':
                return 'Problema di comunicazione con Discord. Riprovo automaticamente...';
            case 'VOICE_CONNECTION':
                return 'Problema di connessione vocale. Verifica che io sia connesso al canale.';
            case 'MUSIC_STREAM':
                return 'Problema durante la riproduzione. Provo con la prossima canzone...';
            case 'RATE_LIMIT':
                return 'Troppe richieste. Attendi qualche secondo e riprova.';
            case 'NETWORK':
                return 'Problema di connessione internet. Riprovo automaticamente...';
            default:
                return 'Si è verificato un errore. Il team è stato notificato.';
        }
    }
    
    // Gestione errori critici
    handleCriticalError(type, error, extra = {}) {
        logger.system(`🚨 ERRORE CRITICO ${type}:`, {
            message: error.message || error,
            stack: error.stack,
            extra: extra
        });
        
        // Salva stato per debug
        this.saveCrashReport(type, error, extra);
        
        // Tentativo di shutdown graceful
        setTimeout(() => {
            logger.system('💀 Forzando uscita dopo errore critico');
            process.exit(1);
        }, 5000);
        
        this.gracefulShutdown();
    }
    
    // Salva report di crash
    saveCrashReport(type, error, extra) {
        try {
            const fs = require('fs');
            const path = require('path');
            
            const crashReport = {
                type: type,
                timestamp: new Date().toISOString(),
                error: {
                    message: error.message || error,
                    stack: error.stack,
                    name: error.name
                },
                extra: extra,
                process: {
                    pid: process.pid,
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: process.version
                },
                lastErrors: this.lastErrors.slice(0, 10) // Ultimi 10 errori
            };
            
            const crashDir = path.join(__dirname, '../../logs/crashes');
            if (!fs.existsSync(crashDir)) {
                fs.mkdirSync(crashDir, { recursive: true });
            }
            
            const filename = `crash_${Date.now()}.json`;
            const filepath = path.join(crashDir, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(crashReport, null, 2));
            logger.system(`💾 Report di crash salvato: ${filename}`);
            
        } catch (saveError) {
            logger.system('❌ Errore nel salvare il crash report:', saveError.message);
        }
    }
    
    // Shutdown graceful
    async gracefulShutdown() {
        logger.system('🛑 Avvio shutdown graceful...');
        
        try {
            // Salva metriche finali
            const monitor = getMonitor();
            monitor.logMetrics();
            
            // Chiudi cache
            const { getCacheManager } = require('./cache');
            const cacheManager = getCacheManager();
            cacheManager.destroyAll();
            
            logger.system('✅ Shutdown graceful completato');
            
        } catch (shutdownError) {
            logger.system('❌ Errore durante shutdown graceful:', shutdownError.message);
        } finally {
            process.exit(0);
        }
    }
    
    // Wrapper per operazioni con retry automatico
    async withRetry(operation, context = {}) {
        let lastError = null;
        let retryCount = 0;
        
        while (true) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                const errorInfo = await this.handleError(error, {
                    ...context,
                    retryCount
                });
                
                if (!errorInfo.shouldRetry) {
                    throw error;
                }
                
                retryCount++;
                logger.system(`🔄 Retry ${retryCount} per ${errorInfo.errorType} in ${errorInfo.retryDelay}ms`);
                
                if (errorInfo.retryDelay > 0) {
                    await this.sleep(errorInfo.retryDelay);
                }
            }
        }
    }
    
    // Utility per sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Statistiche errori
    getErrorStats() {
        const total = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
        
        return {
            totalErrors: total,
            errorsByType: Object.fromEntries(this.errorCounts),
            recentErrors: this.lastErrors.slice(0, 10),
            errorRate: this.calculateErrorRate()
        };
    }
    
    calculateErrorRate() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        const recentErrors = this.lastErrors.filter(error => {
            const errorTime = new Date(error.timestamp).getTime();
            return errorTime > oneHourAgo;
        });
        
        return {
            lastHour: recentErrors.length,
            perMinute: Math.round(recentErrors.length / 60 * 100) / 100
        };
    }
    
    // Reset statistiche (per manutenzione)
    resetStats() {
        this.errorCounts.clear();
        this.lastErrors = [];
        logger.system('🧹 Statistiche errori resettate');
    }
}

// Singleton
let errorHandlerInstance = null;

function getErrorHandler() {
    if (!errorHandlerInstance) {
        errorHandlerInstance = new ErrorHandler();
    }
    return errorHandlerInstance;
}

// Wrapper per gestione errori in comandi
async function handleCommandError(error, message, commandName) {
    const errorHandler = getErrorHandler();
    
    const errorInfo = await errorHandler.handleError(error, {
        command: commandName,
        userId: message.author.id,
        guildId: message.guild?.id,
        channelId: message.channel.id
    });
    
    // Invia messaggio all'utente
    try {
        await message.reply(`❌ ${errorInfo.userMessage}`);
    } catch (replyError) {
        logger.system('❌ Errore nell\'inviare messaggio di errore:', replyError.message);
    }
    
    return errorInfo;
}

// Decorator per metodi con gestione errori automatica
function withErrorHandling(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            const errorHandler = getErrorHandler();
            await errorHandler.handleError(error, {
                method: `${target.constructor.name}.${propertyKey}`,
                args: args.length
            });
            throw error;
        }
    };
    
    return descriptor;
}

module.exports = {
    ErrorHandler,
    getErrorHandler,
    handleCommandError,
    withErrorHandling
};