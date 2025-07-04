# Guida allo Sviluppo - onTune Bot

## 🏗️ Architettura del Sistema

### Componenti Principali

- **Bot Core** (`src/bot.js`) - Logica principale del bot Discord
- **Managers** (`src/managers/`) - Gestione musica, voce e web
- **Utils** (`src/utils/`) - Utilità condivise (logging, cache, monitoring, errori)
- **Web Dashboard** (`src/web/`) - Interfaccia web per controllo remoto
- **Config** (`config/`) - File di configurazione performance

### Sistemi di Supporto

1. **Sistema di Logging** - Winston con rotazione file e livelli configurabili
2. **Sistema di Cache** - Cache intelligente con TTL e LRU eviction
3. **Sistema di Monitoraggio** - Metriche performance in tempo reale
4. **Sistema di Gestione Errori** - Classificazione e retry automatico
5. **Sistema di Configurazione** - Validazione e fallback per variabili d'ambiente

## 🚀 Setup Sviluppo

### Prerequisiti

```bash
# Node.js 18+ e npm
node --version
npm --version

# FFmpeg per elaborazione audio
# Windows: Scarica da https://ffmpeg.org/
# Linux: sudo apt install ffmpeg
# macOS: brew install ffmpeg
```

### Installazione

```bash
# Clona il repository
git clone <repository-url>
cd onTune

# Installa dipendenze
npm install

# Copia configurazione ambiente
cp .env.example .env

# Modifica .env con i tuoi token
nano .env
```

### Configurazione Ambiente

```env
# Obbligatori
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id

# Opzionali ma raccomandati
WEB_PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

## 📊 Sistemi di Monitoraggio

### Metriche Disponibili

- **Performance**: Tempo risposta comandi, uso memoria, uptime
- **Errori**: Conteggio per tipo, rate errori, stack trace
- **Cache**: Hit rate, dimensioni, cleanup automatico
- **Connessioni**: Bot Discord, server web, connessioni vocali

### API Endpoints

```bash
# Stato generale del bot
GET /api/status

# Metriche performance dettagliate
GET /api/metrics

# Report salute sistema
GET /api/health

# Statistiche errori
GET /api/errors

# Statistiche cache
GET /api/cache
```

## 🛠️ Best Practices

### Gestione Errori

```javascript
// ✅ Corretto - Usa il sistema di gestione errori
const { getErrorHandler } = require('./utils/errorHandler');

try {
    await riskyOperation();
} catch (error) {
    const errorHandler = getErrorHandler();
    await errorHandler.handleError(error, {
        command: 'play',
        userId: message.author.id
    });
}

// ❌ Evita - Gestione errori manuale
try {
    await riskyOperation();
} catch (error) {
    console.error(error);
    message.reply('Errore generico');
}
```

### Uso Cache

```javascript
// ✅ Corretto - Usa il sistema di cache
const { getCacheManager } = require('./utils/cache');
const cache = getCacheManager().getCache('music_search');

const result = await cache.getOrSet('search_query', async () => {
    return await expensiveSearchOperation();
});

// ❌ Evita - Cache manuale
if (!this.searchCache[query]) {
    this.searchCache[query] = await expensiveSearchOperation();
}
```

### Logging

```javascript
// ✅ Corretto - Usa logger strutturato
const logger = require('./utils/logger');

logger.command('Comando play eseguito', {
    userId: message.author.id,
    query: searchQuery,
    responseTime: 150
});

// ❌ Evita - Console.log diretto
console.log('Comando play eseguito');
```

### Configurazione

```javascript
// ✅ Corretto - Usa sistema di configurazione
const { getConfig } = require('./utils/config');
const config = getConfig();

if (config.spotify.enabled) {
    // Logica Spotify
}

// ❌ Evita - Accesso diretto a process.env
if (process.env.SPOTIFY_CLIENT_ID) {
    // Logica Spotify
}
```

## 🔧 Sviluppo Funzionalità

### Aggiungere Nuovo Comando

1. **Definisci il comando** in `src/bot.js`:

```javascript
case 'newcommand':
    await this.handleNewCommand(message, args);
    break;
```

2. **Implementa la logica**:

```javascript
async handleNewCommand(message, args) {
    const startTime = Date.now();
    
    try {
        // Validazione input
        if (!args.length) {
            return message.reply('❌ Parametri mancanti');
        }
        
        // Logica comando
        const result = await this.performOperation(args);
        
        // Risposta utente
        await message.reply(`✅ ${result}`);
        
        // Log successo
        logger.command('Nuovo comando eseguito', {
            userId: message.author.id,
            args: args.length,
            responseTime: Date.now() - startTime
        });
        
    } catch (error) {
        // Il sistema di gestione errori si occuperà automaticamente
        throw error;
    }
}
```

### Aggiungere Nuovo Manager

1. **Crea file manager** in `src/managers/`:

```javascript
const logger = require('../utils/logger');
const { getCacheManager } = require('../utils/cache');

class NewManager {
    constructor(bot) {
        this.bot = bot;
        this.cache = getCacheManager().createCache('new_manager', {
            maxSize: 500,
            ttl: 30 * 60 * 1000 // 30 minuti
        });
    }
    
    async initialize() {
        logger.system('🔧 NewManager inizializzato');
    }
    
    async cleanup() {
        this.cache.clear();
        logger.system('🧹 NewManager pulito');
    }
}

module.exports = NewManager;
```

2. **Integra nel bot principale**:

```javascript
// In bot.js constructor
this.newManager = null;

// Lazy loading
getNewManager() {
    if (!this.newManager) {
        const NewManager = require('./managers/NewManager');
        this.newManager = new NewManager(this);
        this.newManager.initialize();
    }
    return this.newManager;
}
```

## 🧪 Testing

### Test Manuali

```bash
# Avvia in modalità sviluppo
NODE_ENV=development npm start

# Testa comandi base
.help
.play test song
.queue

# Verifica dashboard web
open http://localhost:3000

# Controlla metriche
curl http://localhost:3000/api/health
```

### Debugging

```bash
# Log dettagliati
LOG_LEVEL=debug npm start

# Monitoraggio memoria
node --inspect src/index.js

# Profiling performance
node --prof src/index.js
```

## 📈 Ottimizzazioni Performance

### Configurazione Cache

```json
// config/performance.json
{
  "cache": {
    "search": { "ttl": 900000, "max_size": 1000 },
    "metadata": { "ttl": 3600000, "max_size": 2000 }
  }
}
```

### Monitoraggio Memoria

- **Heap Usage**: Mantieni sotto 80% del limite
- **GC Frequency**: Configurabile tramite `GC_INTERVAL_MINUTES`
- **Cache Size**: Monitora hit rate e dimensioni

### Rate Limiting

- **Comandi**: 10 per minuto per utente
- **API Web**: 100 richieste per 15 minuti per IP
- **Discord API**: Gestione automatica rate limit

## 🔒 Sicurezza

### Variabili Sensibili

- **Mai committare** file `.env`
- **Usa** `.env.example` per template
- **Valida** input utente sempre
- **Sanitizza** output per prevenire injection

### Middleware Sicurezza

- **Helmet**: Headers di sicurezza HTTP
- **CORS**: Configurazione origine controllata
- **Rate Limiting**: Prevenzione spam/DoS
- **Input Validation**: Sanitizzazione parametri

## 📝 Manutenzione

### Pulizia Periodica

```bash
# Pulizia log vecchi (automatica)
# Pulizia cache scadute (automatica)
# Pulizia metriche (24h retention)

# Manuale
npm run cleanup
```

### Aggiornamenti Dipendenze

```bash
# Controlla aggiornamenti
npm outdated

# Aggiorna patch/minor
npm update

# Aggiorna major (con attenzione)
npm install package@latest
```

### Backup

- **Configurazione**: File `.env` e `config/`
- **Log**: Directory `logs/` (opzionale)
- **Cache**: Export/import automatico disponibile

## 🚨 Troubleshooting

### Problemi Comuni

1. **Bot non si avvia**:
   - Verifica token Discord in `.env`
   - Controlla permessi bot
   - Verifica connessione internet

2. **Errori audio**:
   - Installa/aggiorna FFmpeg
   - Verifica permessi canale vocale
   - Controlla qualità connessione

3. **Dashboard non accessibile**:
   - Verifica porta `WEB_PORT` libera
   - Controlla firewall
   - Verifica configurazione CORS

4. **Performance degradate**:
   - Monitora uso memoria (`/api/metrics`)
   - Controlla hit rate cache
   - Verifica log errori

### Log Debugging

```bash
# Errori critici
tail -f logs/error.log

# Tutti i log
tail -f logs/combined.log

# Crash reports
ls -la logs/crashes/
```

## 🤝 Contribuire

1. **Fork** il repository
2. **Crea** branch feature (`git checkout -b feature/amazing-feature`)
3. **Segui** le best practices sopra
4. **Testa** le modifiche
5. **Commit** con messaggi descrittivi
6. **Push** al branch (`git push origin feature/amazing-feature`)
7. **Apri** Pull Request

### Convenzioni Commit

```bash
# Formato
type(scope): description

# Esempi
feat(music): add shuffle command
fix(cache): resolve memory leak
docs(readme): update installation guide
refactor(error): improve error classification
```

## 📚 Risorse

- [Discord.js Documentation](https://discord.js.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Winston Logging](https://github.com/winstonjs/winston)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Nota**: Questa documentazione è in continuo aggiornamento. Per domande o suggerimenti, apri una issue nel repository.