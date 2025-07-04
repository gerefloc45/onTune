const logger = require('./logger');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            commands: {
                total: 0,
                errors: 0,
                avgResponseTime: 0,
                responseTimes: []
            },
            memory: {
                heapUsed: 0,
                heapTotal: 0,
                external: 0,
                rss: 0
            },
            connections: {
                active: 0,
                total: 0,
                errors: 0
            },
            music: {
                songsPlayed: 0,
                queueSize: 0,
                activeConnections: 0
            }
        };

        this.startTime = Date.now();
        this.lastCleanup = Date.now();

        // Avvia monitoraggio automatico
        this.startMonitoring();
    }

    startMonitoring() {
        // Monitora memoria ogni 30 secondi
        setInterval(() => {
            this.updateMemoryMetrics();
        }, 30000);

        // Log metriche ogni 10 minuti
        setInterval(() => {
            this.logMetrics();
        }, 600000);

        // Pulizia metriche ogni ora
        setInterval(() => {
            this.cleanupMetrics();
        }, 3600000);
    }

    updateMemoryMetrics() {
        const memUsage = process.memoryUsage();
        this.metrics.memory = {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memUsage.external / 1024 / 1024), // MB
            rss: Math.round(memUsage.rss / 1024 / 1024) // MB
        };
    }

    recordCommand(commandName, responseTime, success = true) {
        this.metrics.commands.total++;
        if (!success) {
            this.metrics.commands.errors++;
        }

        // Mantieni solo gli ultimi 100 tempi di risposta
        this.metrics.commands.responseTimes.push(responseTime);
        if (this.metrics.commands.responseTimes.length > 100) {
            this.metrics.commands.responseTimes.shift();
        }

        // Calcola tempo medio di risposta
        const sum = this.metrics.commands.responseTimes.reduce((a, b) => a + b, 0);
        this.metrics.commands.avgResponseTime = Math.round(sum / this.metrics.commands.responseTimes.length);

        logger.performance(`Comando ${commandName} eseguito in ${responseTime}ms`);
    }

    recordConnection(type = 'connect', success = true) {
        if (type === 'connect') {
            this.metrics.connections.active++;
            this.metrics.connections.total++;
        } else if (type === 'disconnect') {
            this.metrics.connections.active = Math.max(0, this.metrics.connections.active - 1);
        }

        if (!success) {
            this.metrics.connections.errors++;
        }
    }

    updateMusicMetrics(queueSize, activeConnections) {
        this.metrics.music.queueSize = queueSize;
        this.metrics.music.activeConnections = activeConnections;
    }

    recordSongPlayed() {
        this.metrics.music.songsPlayed++;
    }

    getMetrics() {
        this.updateMemoryMetrics();

        const uptime = Date.now() - this.startTime;
        const uptimeHours = Math.round(uptime / 1000 / 60 / 60 * 100) / 100;

        return {
            ...this.metrics,
            uptime: {
                ms: uptime,
                hours: uptimeHours,
                formatted: this.formatUptime(uptime)
            },
            timestamp: new Date().toISOString()
        };
    }

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else {
            return `${minutes}m ${seconds % 60}s`;
        }
    }

    logMetrics() {
        const metrics = this.getMetrics();

        logger.performance('📊 Metriche Performance:', {
            uptime: metrics.uptime.formatted,
            memory: `${metrics.memory.heapUsed}MB/${metrics.memory.heapTotal}MB`,
            commands: {
                total: metrics.commands.total,
                errors: metrics.commands.errors,
                avgResponse: `${metrics.commands.avgResponseTime}ms`,
                errorRate: `${((metrics.commands.errors / metrics.commands.total) * 100).toFixed(1)}%`
            },
            connections: {
                active: metrics.connections.active,
                total: metrics.connections.total,
                errors: metrics.connections.errors
            },
            music: {
                songsPlayed: metrics.music.songsPlayed,
                queueSize: metrics.music.queueSize,
                activeConnections: metrics.music.activeConnections
            }
        });

        // Salva metriche su file per analisi
        this.saveMetricsToFile(metrics);
    }

    saveMetricsToFile(metrics) {
        try {
            const metricsDir = path.join(__dirname, '../../logs');
            if (!fs.existsSync(metricsDir)) {
                fs.mkdirSync(metricsDir, { recursive: true });
            }

            const filename = `metrics-${new Date().toISOString().split('T')[0]}.json`;
            const filepath = path.join(metricsDir, filename);

            let existingData = [];
            if (fs.existsSync(filepath)) {
                try {
                    existingData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                } catch (error) {
                    logger.system('⚠️ Errore lettura file metriche esistente:', error.message);
                }
            }

            existingData.push(metrics);

            // Mantieni solo le ultime 144 metriche (24 ore con intervallo di 10 minuti)
            if (existingData.length > 144) {
                existingData = existingData.slice(-144);
            }

            fs.writeFileSync(filepath, JSON.stringify(existingData, null, 2));
        } catch (error) {
            logger.system('❌ Errore salvataggio metriche:', error.message);
        }
    }

    cleanupMetrics() {
        // Reset contatori se necessario
        const now = Date.now();
        const hoursSinceLastCleanup = (now - this.lastCleanup) / 1000 / 60 / 60;

        if (hoursSinceLastCleanup >= 24) {
            // Reset giornaliero
            this.metrics.commands.total = 0;
            this.metrics.commands.errors = 0;
            this.metrics.connections.total = 0;
            this.metrics.connections.errors = 0;
            this.metrics.music.songsPlayed = 0;

            this.lastCleanup = now;
            logger.performance('🧹 Metriche resettate (cleanup giornaliero)');
        }
    }

    // Metodo per ottenere un report di salute del sistema
    getHealthReport() {
        const metrics = this.getMetrics();
        const health = {
            status: 'healthy',
            issues: [],
            score: 100
        };

        // Controlla memoria
        const memoryUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
        if (memoryUsagePercent > 90) {
            health.issues.push('Uso memoria critico (>90%)');
            health.score -= 30;
            health.status = 'critical';
        } else if (memoryUsagePercent > 75) {
            health.issues.push('Uso memoria elevato (>75%)');
            health.score -= 15;
            if (health.status === 'healthy') health.status = 'warning';
        }

        // Controlla tasso di errori comandi
        if (metrics.commands.total > 0) {
            const errorRate = (metrics.commands.errors / metrics.commands.total) * 100;
            if (errorRate > 10) {
                health.issues.push(`Tasso errori comandi elevato (${errorRate.toFixed(1)}%)`);
                health.score -= 20;
                if (health.status !== 'critical') health.status = 'warning';
            }
        }

        // Controlla tempo di risposta medio
        if (metrics.commands.avgResponseTime > 5000) {
            health.issues.push(`Tempo risposta lento (${metrics.commands.avgResponseTime}ms)`);
            health.score -= 15;
            if (health.status === 'healthy') health.status = 'warning';
        }

        return {
            ...health,
            metrics: metrics,
            timestamp: new Date().toISOString()
        };
    }
}

// Singleton
let monitorInstance = null;

function getMonitor() {
    if (!monitorInstance) {
        monitorInstance = new PerformanceMonitor();
    }
    return monitorInstance;
}

module.exports = { getMonitor, PerformanceMonitor };
