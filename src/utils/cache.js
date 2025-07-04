const logger = require('./logger');
const { getConfig } = require('./config');

class SmartCache {
    constructor(name, options = {}) {
        this.name = name;
        this.config = getConfig();
        
        // Configurazione cache
        this.maxSize = options.maxSize || this.config.cache.maxSize;
        this.ttl = options.ttl || (this.config.cache.ttlMinutes * 60 * 1000); // Converti in ms
        this.cleanupInterval = options.cleanupInterval || (this.ttl / 2);
        
        // Storage interno
        this.cache = new Map();
        this.accessTimes = new Map();
        this.hitCount = 0;
        this.missCount = 0;
        this.createdAt = Date.now();
        
        // Avvia pulizia automatica
        this.startCleanup();
        
        logger.system(`📦 Cache '${this.name}' inizializzata (max: ${this.maxSize}, ttl: ${this.ttl}ms)`);
    }
    
    set(key, value, customTtl = null) {
        const now = Date.now();
        const expiresAt = now + (customTtl || this.ttl);
        
        // Se la cache è piena, rimuovi l'elemento meno recentemente usato
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }
        
        this.cache.set(key, {
            value: value,
            createdAt: now,
            expiresAt: expiresAt,
            accessCount: 0
        });
        
        this.accessTimes.set(key, now);
        
        logger.performance(`Cache '${this.name}': SET ${key}`);
    }
    
    get(key) {
        const now = Date.now();
        const item = this.cache.get(key);
        
        if (!item) {
            this.missCount++;
            logger.performance(`Cache '${this.name}': MISS ${key}`);
            return null;
        }
        
        // Controlla scadenza
        if (item.expiresAt < now) {
            this.delete(key);
            this.missCount++;
            logger.performance(`Cache '${this.name}': EXPIRED ${key}`);
            return null;
        }
        
        // Aggiorna statistiche di accesso
        item.accessCount++;
        this.accessTimes.set(key, now);
        this.hitCount++;
        
        logger.performance(`Cache '${this.name}': HIT ${key}`);
        return item.value;
    }
    
    has(key) {
        const item = this.cache.get(key);
        if (!item) return false;
        
        // Controlla scadenza
        if (item.expiresAt < Date.now()) {
            this.delete(key);
            return false;
        }
        
        return true;
    }
    
    delete(key) {
        const deleted = this.cache.delete(key);
        this.accessTimes.delete(key);
        
        if (deleted) {
            logger.performance(`Cache '${this.name}': DELETE ${key}`);
        }
        
        return deleted;
    }
    
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.accessTimes.clear();
        this.hitCount = 0;
        this.missCount = 0;
        
        logger.performance(`Cache '${this.name}': CLEAR (${size} items removed)`);
    }
    
    // Rimuovi l'elemento meno recentemente usato (LRU)
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, time] of this.accessTimes) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.delete(oldestKey);
            logger.performance(`Cache '${this.name}': LRU evicted ${oldestKey}`);
        }
    }
    
    // Pulizia elementi scaduti
    cleanup() {
        const now = Date.now();
        let removedCount = 0;
        
        for (const [key, item] of this.cache) {
            if (item.expiresAt < now) {
                this.delete(key);
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            logger.performance(`Cache '${this.name}': Cleanup removed ${removedCount} expired items`);
        }
        
        return removedCount;
    }
    
    startCleanup() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }
    
    stopCleanup() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
    
    // Statistiche cache
    getStats() {
        const now = Date.now();
        const totalRequests = this.hitCount + this.missCount;
        const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
        
        return {
            name: this.name,
            size: this.cache.size,
            maxSize: this.maxSize,
            hitCount: this.hitCount,
            missCount: this.missCount,
            hitRate: Math.round(hitRate * 100) / 100,
            totalRequests: totalRequests,
            uptime: now - this.createdAt,
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    
    // Stima dell'uso di memoria (approssimativo)
    estimateMemoryUsage() {
        let totalSize = 0;
        
        for (const [key, item] of this.cache) {
            // Stima dimensione chiave (stringa)
            totalSize += key.length * 2; // 2 bytes per carattere UTF-16
            
            // Stima dimensione valore (approssimativo)
            if (typeof item.value === 'string') {
                totalSize += item.value.length * 2;
            } else if (typeof item.value === 'object') {
                totalSize += JSON.stringify(item.value).length * 2;
            } else {
                totalSize += 8; // Stima per numeri/booleani
            }
            
            // Overhead metadati
            totalSize += 64; // Stima per createdAt, expiresAt, accessCount
        }
        
        return Math.round(totalSize / 1024); // Ritorna in KB
    }
    
    // Metodi di utilità per pattern comuni
    async getOrSet(key, asyncFunction, customTtl = null) {
        let value = this.get(key);
        
        if (value === null) {
            try {
                value = await asyncFunction();
                if (value !== null && value !== undefined) {
                    this.set(key, value, customTtl);
                }
            } catch (error) {
                logger.system(`❌ Errore in getOrSet per cache '${this.name}', key '${key}':`, error.message);
                throw error;
            }
        }
        
        return value;
    }
    
    // Preload di dati
    async preload(keyValuePairs) {
        const promises = [];
        
        for (const [key, asyncFunction] of keyValuePairs) {
            promises.push(
                asyncFunction().then(value => {
                    if (value !== null && value !== undefined) {
                        this.set(key, value);
                    }
                }).catch(error => {
                    logger.system(`⚠️ Errore preload cache '${this.name}', key '${key}':`, error.message);
                })
            );
        }
        
        await Promise.allSettled(promises);
        logger.performance(`Cache '${this.name}': Preload completato per ${keyValuePairs.length} items`);
    }
    
    // Esporta cache per backup
    export() {
        const data = [];
        const now = Date.now();
        
        for (const [key, item] of this.cache) {
            if (item.expiresAt > now) {
                data.push({
                    key: key,
                    value: item.value,
                    remainingTtl: item.expiresAt - now
                });
            }
        }
        
        return data;
    }
    
    // Importa cache da backup
    import(data) {
        let importedCount = 0;
        
        for (const item of data) {
            if (item.remainingTtl > 0) {
                this.set(item.key, item.value, item.remainingTtl);
                importedCount++;
            }
        }
        
        logger.performance(`Cache '${this.name}': Importati ${importedCount} items`);
        return importedCount;
    }
    
    // Distruttore
    destroy() {
        this.stopCleanup();
        this.clear();
        logger.system(`🗑️ Cache '${this.name}' distrutta`);
    }
}

// Manager globale delle cache
class CacheManager {
    constructor() {
        this.caches = new Map();
        this.config = getConfig();
        
        // Statistiche globali
        this.startTime = Date.now();
        
        // Avvia monitoraggio globale
        this.startGlobalMonitoring();
    }
    
    createCache(name, options = {}) {
        if (this.caches.has(name)) {
            logger.system(`⚠️ Cache '${name}' già esistente, ritorno istanza esistente`);
            return this.caches.get(name);
        }
        
        const cache = new SmartCache(name, options);
        this.caches.set(name, cache);
        
        logger.system(`✅ Cache '${name}' creata`);
        return cache;
    }
    
    getCache(name) {
        return this.caches.get(name) || null;
    }
    
    deleteCache(name) {
        const cache = this.caches.get(name);
        if (cache) {
            cache.destroy();
            this.caches.delete(name);
            logger.system(`🗑️ Cache '${name}' eliminata`);
            return true;
        }
        return false;
    }
    
    getAllStats() {
        const stats = {
            totalCaches: this.caches.size,
            uptime: Date.now() - this.startTime,
            caches: {}
        };
        
        for (const [name, cache] of this.caches) {
            stats.caches[name] = cache.getStats();
        }
        
        return stats;
    }
    
    startGlobalMonitoring() {
        // Log statistiche ogni 30 minuti
        setInterval(() => {
            this.logGlobalStats();
        }, 30 * 60 * 1000);
    }
    
    logGlobalStats() {
        const stats = this.getAllStats();
        
        logger.performance('📊 Statistiche Cache Globali:', {
            totalCaches: stats.totalCaches,
            uptime: Math.round(stats.uptime / 1000 / 60) + ' minuti'
        });
        
        for (const [name, cacheStats] of Object.entries(stats.caches)) {
            logger.performance(`📦 Cache '${name}':`, {
                size: `${cacheStats.size}/${cacheStats.maxSize}`,
                hitRate: `${cacheStats.hitRate}%`,
                requests: cacheStats.totalRequests,
                memory: `${cacheStats.memoryUsage}KB`
            });
        }
    }
    
    // Pulizia globale
    cleanupAll() {
        let totalRemoved = 0;
        
        for (const [name, cache] of this.caches) {
            totalRemoved += cache.cleanup();
        }
        
        logger.performance(`🧹 Cleanup globale: ${totalRemoved} items rimossi`);
        return totalRemoved;
    }
    
    // Distruttore globale
    destroyAll() {
        for (const [name, cache] of this.caches) {
            cache.destroy();
        }
        this.caches.clear();
        logger.system('🗑️ Tutte le cache distrutte');
    }
}

// Singleton del manager
let cacheManagerInstance = null;

function getCacheManager() {
    if (!cacheManagerInstance) {
        cacheManagerInstance = new CacheManager();
    }
    return cacheManagerInstance;
}

// Cache predefinite per il bot
function initializeBotCaches() {
    const manager = getCacheManager();
    
    // Cache per ricerche musicali
    const searchCache = manager.createCache('music_search', {
        maxSize: 1000,
        ttl: 15 * 60 * 1000 // 15 minuti
    });
    
    // Cache per metadati tracce
    const metadataCache = manager.createCache('track_metadata', {
        maxSize: 2000,
        ttl: 60 * 60 * 1000 // 1 ora
    });
    
    // Cache per URL stream
    const urlCache = manager.createCache('stream_urls', {
        maxSize: 500,
        ttl: 30 * 60 * 1000 // 30 minuti
    });
    
    logger.system('✅ Cache del bot inizializzate');
    
    return {
        search: searchCache,
        metadata: metadataCache,
        urls: urlCache
    };
}

module.exports = {
    SmartCache,
    CacheManager,
    getCacheManager,
    initializeBotCaches
};