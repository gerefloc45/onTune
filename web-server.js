require('dotenv').config();
const WebServer = require('./src/web/server');
const logger = require('./src/utils/logger');

/**
 * Server Web Standalone
 * Avvia il server web senza il bot Discord
 */

class StandaloneWebServer {
    constructor() {
        this.webServer = null;
    }

    async start() {
        try {
            logger.system('🌐 Avvio del server web standalone...');
            
            // Crea e avvia il server web
            this.webServer = new WebServer();
            await this.webServer.start();
            
            logger.system('✅ Server web avviato con successo');
            logger.system(`🌐 Porta: ${process.env.WEB_PORT || 3000}`);
            logger.system(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            
            // Gestione graceful shutdown
            process.on('SIGINT', () => this.shutdown());
            process.on('SIGTERM', () => this.shutdown());
            
        } catch (error) {
            logger.system('❌ Errore durante l\'avvio del server web:', error.message);
            process.exit(1);
        }
    }

    async shutdown() {
        logger.system('🛑 Spegnimento del server web in corso...');
        
        if (this.webServer) {
            await this.webServer.stop();
        }
        
        logger.system('✅ Server web spento correttamente');
        process.exit(0);
    }
}

// Avvia il server se questo file viene eseguito direttamente
if (require.main === module) {
    const server = new StandaloneWebServer();
    server.start();
}

module.exports = StandaloneWebServer;