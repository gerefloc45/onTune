const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

class WebServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') || [] : "*",
                methods: ["GET", "POST"]
            }
        });
        // Tunnel functionality removed

        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }

    setupMiddleware() {
        // Middleware di sicurezza
        this.app.use(helmet({
            contentSecurityPolicy: false // Disabilitato per compatibilità con Socket.IO
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minuti
            max: 100, // limite di 100 richieste per IP
            message: 'Troppe richieste da questo IP, riprova più tardi.',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);

        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));

        // Middleware per gestione errori globale
        this.app.use((err, req, res, next) => {
            console.error('❌ Errore server web:', err);
            res.status(500).json({
                success: false,
                error: process.env.NODE_ENV === 'production' ? 'Errore interno del server' : err.message
            });
        });
    }

    setupRoutes() {
        // API Routes di base
        this.app.get('/api/status', (req, res) => {
            res.json({
                success: true,
                data: {
                    status: 'online',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    server: 'standalone'
                }
            });
        });

        // Tunnel API removed - server now runs on localhost only

        // API per generare URL del server
        this.app.get('/api/server-url', (req, res) => {
            try {
                const port = this.getPort() || process.env.WEB_PORT || 3000;
                const baseUrl = `http://localhost:${port}`;

                res.json({
                    success: true,
                    data: {
                        type: 'server_base',
                        url: baseUrl,
                        port: port
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Serve the web interface
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('🌐 Nuovo client web connesso:', socket.id);

            // Invia lo stato iniziale
            socket.emit('status', {
                status: 'online',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                server: 'standalone'
            });

            // Gestisci la disconnessione
            socket.on('disconnect', () => {
                console.log('🌐 Client web disconnesso:', socket.id);
            });

            // Gestisci richieste di aggiornamento stato
            socket.on('requestStatus', () => {
                socket.emit('status', {
                    status: 'online',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    server: 'standalone'
                });
            });
        });

        // Invia aggiornamenti periodici a tutti i client connessi
        setInterval(() => {
            this.io.emit('status', {
                status: 'online',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                server: 'standalone'
            });
        }, 5000);
    }

    async start() {
        const port = process.env.WEB_PORT || 3000;
        const host = process.env.WEB_HOST || '0.0.0.0'; // Ascolta su tutte le interfacce

        return new Promise(async (resolve, reject) => {
            this.server.listen(port, host, async (error) => {
                if (error) {
                    console.error('❌ Errore nell\'avvio del server web:', error);
                    reject(error);
                } else {
                    // Determina l'URL basato sulla configurazione
                    let serverUrl = null;

                    // Se WEB_HOST è specificato e non è localhost/0.0.0.0, usa quello
                    if (host && host !== '0.0.0.0' && host !== 'localhost' && host !== '127.0.0.1') {
                        serverUrl = `http://${host}:${port}`;
                        console.log(`🌐 Server configurato per IP specifico: ${serverUrl}`);
                    } else {
                        // Usa sempre localhost - tunnel rimosso
                        serverUrl = `http://localhost:${port}`;
                    }

                    console.log(`🌐 Server web avviato su ${serverUrl}`);
                    console.log(`📱 Interfaccia web disponibile`);
                    console.log(`🔗 Accesso: ${serverUrl}`);

                    // Invia l'URL del server a tutti i client connessi
                    if (this.io) {
                        this.io.emit('server-url', {
                            url: serverUrl,
                            isLocal: true
                        });
                    }

                    resolve();
                }
            });
        });
    }

    async stop() {
        return new Promise((resolve) => {
            this.server.close(() => {
                console.log('🌐 Server web fermato');
                resolve();
            });
        });
    }

    getPort() {
        return this.server.listening ? this.server.address().port : null;
    }

    isRunning() {
        return this.server !== null && this.server.listening;
    }

    // Tunnel methods removed - server now runs on localhost only
}

module.exports = WebServer;
