const winston = require('winston');
const path = require('path');

// Singleton pattern per prevenire duplicazione del logger
let loggerInstance = null;

function createLogger() {
    if (loggerInstance) {
        return loggerInstance;
    }
    
    loggerInstance = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
        })
    ),
    transports: [
        // Console output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                })
            ),
            handleExceptions: false,
            handleRejections: false
        }),
        // File per errori
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            handleExceptions: false
        }),
        // File per tutti i log
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            handleExceptions: false
        })
    ],
     exitOnError: false
    });
    
    return loggerInstance;
}

// Crea o ottieni l'istanza del logger
const logger = createLogger();

// Funzioni helper per diversi tipi di log
logger.music = (message, data = {}) => {
    logger.info(`[MUSIC] ${message}`, data);
};

logger.ai = (message, data = {}) => {
    logger.info(`[AI] ${message}`, data);
};

logger.voice = (message, data = {}) => {
    logger.info(`[VOICE] ${message}`, data);
};

logger.command = (message, data = {}) => {
    logger.info(`[COMMAND] ${message}`, data);
};

logger.system = (message, data = {}) => {
    logger.info(`[SYSTEM] ${message}`, data);
};

module.exports = logger;