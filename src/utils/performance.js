/**
 * Utilità per ottimizzazioni delle performance del bot
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            commandsExecuted: 0,
            averageResponseTime: 0,
            memoryUsage: [],
            cacheHitRate: 0,
            totalCacheRequests: 0,
            cacheHits: 0
        };
        
        this.startTime = Date.now();
        this.setupMonitoring();
    }
    
    setupMonitoring() {
        // Monitora l'uso della memoria ogni 5 minuti
        setInterval(() => {
            const memUsage = process.memoryUsage();
            this.metrics.memoryUsage.push({
                timestamp: Date.now(),
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss
            });
            
            // Mantieni solo gli ultimi 12 campioni (1 ora)
            if (this.metrics.memoryUsage.length > 12) {
                this.metrics.memoryUsage.shift();
            }
            
            // Garbage collection se necessario
            if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
                if (global.gc) {
                    global.gc();
                    console.log('🧹 Garbage collection eseguita');
                }
            }
        }, 5 * 60 * 1000);
    }
    
    trackCommand(commandName, executionTime) {
        this.metrics.commandsExecuted++;
        
        // Calcola tempo di risposta medio
        const currentAvg = this.metrics.averageResponseTime;
        const count = this.metrics.commandsExecuted;
        this.metrics.averageResponseTime = ((currentAvg * (count - 1)) + executionTime) / count;
    }
    
    trackCacheHit(hit = true) {
        this.metrics.totalCacheRequests++;
        if (hit) {
            this.metrics.cacheHits++;
        }
        this.metrics.cacheHitRate = (this.metrics.cacheHits / this.metrics.totalCacheRequests) * 100;
    }
    
    getMetrics() {
        const uptime = Date.now() - this.startTime;
        const memUsage = process.memoryUsage();
        
        return {
            uptime: this.formatUptime(uptime),
            commandsExecuted: this.metrics.commandsExecuted,
            averageResponseTime: Math.round(this.metrics.averageResponseTime),
            cacheHitRate: Math.round(this.metrics.cacheHitRate * 100) / 100,
            memoryUsage: {
                heapUsed: this.formatBytes(memUsage.heapUsed),
                heapTotal: this.formatBytes(memUsage.heapTotal),
                external: this.formatBytes(memUsage.external),
                rss: this.formatBytes(memUsage.rss)
            },
            memoryHistory: this.metrics.memoryUsage
        };
    }
    
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Ottimizzazione per oggetti grandi
    optimizeObject(obj, maxDepth = 3, currentDepth = 0) {
        if (currentDepth >= maxDepth || obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        const optimized = Array.isArray(obj) ? [] : {};
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                optimized[key] = this.optimizeObject(obj[key], maxDepth, currentDepth + 1);
            }
        }
        
        return optimized;
    }
    
    // Debounce per funzioni chiamate frequentemente
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle per limitare la frequenza di esecuzione
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

module.exports = PerformanceOptimizer;