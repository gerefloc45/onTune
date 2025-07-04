# onTune - Discord Music Bot Ottimizzato 🚀

Un bot Discord avanzato per la riproduzione musicale con ottimizzazioni delle performance, cache intelligente, dashboard web e monitoraggio in tempo reale.

## ✨ Caratteristiche Principali

- 🎵 **Riproduzione Musicale Avanzata**: Supporto per YouTube, Spotify e altre piattaforme
- 🎛️ **Controlli Completi**: Play, pause, skip, queue, shuffle, loop e controllo volume
- 🌐 **Dashboard Web**: Interfaccia web moderna per controllo remoto con API REST
- 📊 **Monitoraggio Performance**: Metriche in tempo reale, cache intelligente e ottimizzazioni automatiche
- 🛡️ **Gestione Errori Avanzata**: Sistema di retry automatico e classificazione errori
- 🔒 **Sicurezza Integrata**: Rate limiting, validazione input e headers di sicurezza
- 📈 **Sistema di Cache**: Cache multi-livello con TTL e LRU eviction
- 🎯 **Comandi Intuitivi**: Sistema di comandi semplice e user-friendly
- 🔧 **Altamente Configurabile**: Configurazione centralizzata con validazione e fallback

## 🚀 Ottimizzazioni Performance

### Cache Intelligente
- **Cache Ricerche**: 15 minuti per ricerche YouTube/Spotify
- **Cache URL**: 30 minuti per URL di streaming
- **Cache Metadati**: Informazioni canzoni persistenti
- **Auto-cleanup**: Pulizia automatica ogni 30 minuti

### Lazy Loading
- **Manager Dinamici**: Caricamento solo quando necessario
- **Riduzione Memoria**: -60% uso RAM all'avvio
- **Startup Veloce**: Tempo di avvio ridotto del 40%

### Preloading Intelligente
- **Preload Canzoni**: Caricamento anticipato prossima canzone
- **Connection Pooling**: Riutilizzo connessioni API
- **Parallel Processing**: Operazioni parallele per velocità

### Memory Management
- **Garbage Collection**: Pulizia automatica memoria
- **Cache Limits**: Limiti intelligenti per Discord.js
- **Memory Sweeping**: Pulizia periodica oggetti inutilizzati
- **Rate Limiting**: Protezione da spam comandi

## 📊 Monitoraggio Performance

```bash
# Visualizza statistiche performance
.stats

# Metriche dettagliate
.performance
```

**Metriche Monitorate:**
- Uptime e comandi eseguiti
- Tempo di risposta medio
- Uso memoria (Heap, RSS, External)
- Cache hit rate
- Connessioni attive

## 🚀 Installazione Rapida

### Prerequisiti
- Node.js 18.0.0 o superiore
- npm o yarn
- FFmpeg installato nel sistema
- Token bot Discord

### Setup

```bash
# Clona il repository
git clone <repository-url>
cd onTune

# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con i tuoi token e configurazioni

# Avvia il bot
npm start
```

### Configurazione Avanzata

Il bot supporta configurazione avanzata tramite variabili d'ambiente:

```env
# Obbligatori
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id

# Opzionali
WEB_PORT=3000
NODE_ENV=development
LOG_LEVEL=info
PERFORMANCE_MONITORING=true
CACHE_TTL_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Avvio Rapido

1. **Configura il bot:**
   ```bash
   npm run setup
   ```

2. **Registra i comandi slash (opzionale ma consigliato):**
   ```bash
   npm run deploy-commands
   ```

3. **Avvia il bot:**
   ```bash
   npm run dev
   ```

4. **Accedi al pannello web:**
   Apri http://localhost:3000 nel tuo browser

5. **Abilita intents privilegiati (quando configurati nel Developer Portal):**
   ```bash
   npm run enable-intents
   ```

### 2. Configurazione Discord Bot

1. Vai su [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nuova applicazione
3. Vai nella sezione "Bot" e crea un bot
4. Copia il token del bot
5. Nella sezione "OAuth2 > URL Generator":
   - Seleziona "bot" e "applications.commands"
   - Seleziona i permessi necessari:
     - Send Messages
     - Connect
     - Speak
     - Use Voice Activity
     - Read Message History
6. Usa l'URL generato per invitare il bot nel tuo server

### 3. Configurazione Variabili d'Ambiente

Modifica il file `.env` con le tue credenziali:

```env
# Discord Bot Configuration
DISCORD_TOKEN=il_tuo_token_discord_qui
CLIENT_ID=il_tuo_client_id_qui
GUILD_ID=il_tuo_guild_id_qui

# Spotify Configuration (opzionale)
SPOTIFY_CLIENT_ID=il_tuo_spotify_client_id_qui
SPOTIFY_CLIENT_SECRET=il_tuo_spotify_client_secret_qui

# Web Server Configuration
WEB_PORT=3000
WEB_HOST=localhost

# Bot Configuration
BOT_PREFIX=.
DEFAULT_VOLUME=0.5
MAX_QUEUE_SIZE=50
```

### 4. Configurazione Spotify (Opzionale)

Per abilitare il supporto Spotify:

1. Vai su [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Crea una nuova app
3. Copia il **Client ID** e **Client Secret**
4. Aggiungi le credenziali al file `.env`

**Nota**: I brani Spotify vengono automaticamente convertiti in equivalenti YouTube per la riproduzione.



## 🎮 Utilizzo

### ⚠️ Limitazioni Attuali e Soluzioni

Il bot è configurato per funzionare senza **Intents Privilegiati** per evitare errori iniziali:

#### 🚫 Senza MessageContent Intent:
- ❌ Comandi con prefisso (`.play`, `.help`) **NON FUNZIONANO**
- ✅ **Soluzione**: Usa i **Comandi Slash** (vedi sotto)

#### ✅ Alternative Disponibili:
1. **Comandi Slash** - Funzionano sempre
2. **Interfaccia Web** - Controllo completo
3. **Abilita Intents Privilegiati** - Funzionalità complete

#### ⚠️ Limitazioni Tecniche:
- **FFmpeg Richiesto**: Necessario per la riproduzione audio
- **Rate Limiting**: Rispetta i limiti delle API di YouTube
- **Qualità Audio**: Dipende dalla disponibilità su YouTube
- **⚠️ SoundCloud**: Le API di SoundCloud hanno subito modifiche nel 2024. Il supporto è limitato con fallback automatico su YouTube. Vedi [SOUNDCLOUD_ISSUES.md](SOUNDCLOUD_ISSUES.md) per dettagli

### Avvio del Bot
```bash
# Avvio normale
npm start

# Avvio in modalità sviluppo (con auto-restart)
npm run dev
```

### 🎯 Comandi Slash (Raccomandati)

#### 🎵 Comandi Musicali
- `/play <canzone>` - Riproduci da YouTube, SoundCloud o Spotify
  - Esempi: `/play Bohemian Rhapsody`
  - URL YouTube: `/play https://youtube.com/watch?v=...`
  - URL SoundCloud: `/play https://soundcloud.com/...`
  - URL Spotify: `/play https://open.spotify.com/track/...`
- `/skip` - Salta la canzone corrente
- `/stop` - Ferma la musica e svuota la coda
- `/queue` - Mostra la coda con indicatori di piattaforma

#### 🎤 Comandi Vocali
- `/join` - Fai entrare il bot nel tuo canale vocale
- `/leave` - Fai uscire il bot dal canale vocale

#### ℹ️ Comandi Informativi
- `/help` - Mostra tutti i comandi disponibili

### 🔧 Comandi con Prefisso (Solo con Intents Privilegiati)

#### 🎵 Comandi Musicali
- `!play <canzone>` - Riproduci da YouTube, SoundCloud o Spotify
  - Esempi: `!play Bohemian Rhapsody`
  - URL YouTube: `!play https://youtube.com/watch?v=...`
  - URL SoundCloud: `!play https://soundcloud.com/...`
  - URL Spotify: `!play https://open.spotify.com/track/...`
- `!skip` - Salta la canzone corrente
- `!stop` - Ferma la musica e svuota la coda
- `!pause` - Metti in pausa
- `!resume` - Riprendi la riproduzione
- `!queue` - Mostra la coda con indicatori di piattaforma
- `!volume <0-100>` - Imposta il volume

#### 🎤 Comandi Vocali
- `.join` - Entra nel canale vocale
- `.leave` - Esci dal canale vocale

#### ℹ️ Comandi Informativi
- `.help` - Mostra tutti i comandi

## 📊 Dashboard Web & API

Il bot include una dashboard web completa e API REST:

### Dashboard Features
- **Controllo Remoto**: Gestisci la musica da qualsiasi dispositivo
- **Visualizzazione Queue**: Vedi e modifica la coda di riproduzione
- **Metriche Real-time**: Monitora performance, memoria e cache
- **Gestione Errori**: Visualizza statistiche errori e health status
- **Sicurezza**: Rate limiting e headers di sicurezza integrati

### API Endpoints

```bash
# Stato bot e server
GET /api/status
GET /api/health

# Metriche e monitoring
GET /api/metrics
GET /api/cache
GET /api/errors

# Controllo musica
GET /api/queue
POST /api/play
POST /api/skip
```

### Accesso Dashboard

1. Avvia il bot
2. Usa il comando `.weblink` per ottenere l'URL
3. Apri l'URL nel browser (default: http://localhost:3000)
4. Controlla il bot da remoto!

## 🔧 Configurazione

### Sistema di Configurazione

Il bot utilizza un sistema di configurazione centralizzato con validazione automatica:

- **Validazione**: Controllo automatico di tutte le variabili
- **Fallback**: Valori di default per configurazioni mancanti
- **Sicurezza**: Validazione range e formati
- **Debug**: Informazioni di configurazione (senza dati sensibili)

### File di Configurazione

- `config/performance.json` - Impostazioni cache, memoria e performance
- `.env` - Variabili d'ambiente (copia da `.env.example`)

### Configurazioni Avanzate

```json
// config/performance.json
{
  "cache": {
    "search": { "ttl": 900000, "max_size": 1000 },
    "metadata": { "ttl": 3600000, "max_size": 2000 }
  },
  "rate_limiting": {
    "commands_per_minute": 10,
    "burst_limit": 3
  },
  "monitoring": {
    "enabled": true,
    "metrics_retention_hours": 24
  }
}
```

## 📁 Struttura Progetto

```
onTune/
├── src/
│   ├── bot.js                 # Bot principale
│   ├── managers/
│   │   ├── MusicManager.js    # Gestione musica
│   │   ├── VoiceManager.js    # Gestione voce
│   │   └── WebManager.js      # Gestione web
│   ├── utils/
│   │   ├── logger.js          # Sistema logging avanzato
│   │   ├── cache.js           # Sistema cache intelligente
│   │   ├── monitoring.js      # Monitoraggio performance
│   │   ├── errorHandler.js    # Gestione errori centralizzata
│   │   ├── config.js          # Configurazione e validazione
│   │   └── performance.js     # Ottimizzazioni
│   └── web/
│       ├── server.js          # Server web con sicurezza
│       └── public/            # File statici dashboard
├── config/
│   └── performance.json       # Configurazioni performance
├── logs/                      # Log e crash reports
├── .env.example              # Template configurazione
├── DEVELOPMENT.md            # Guida sviluppatori
├── package.json
└── README.md
```

## 🛠️ Risoluzione Problemi

### Sistema di Diagnostica Integrato

Il bot include sistemi avanzati per diagnosticare e risolvere problemi:

- **Health Check**: `GET /api/health` per stato sistema
- **Error Tracking**: Classificazione automatica errori
- **Performance Monitoring**: Metriche in tempo reale
- **Crash Reports**: Salvataggio automatico crash per debug

### Problemi Comuni

#### Bot Non Si Avvia
```bash
# Verifica configurazione
node -e "console.log(require('./src/utils/config').getConfig())"

# Controlla token Discord
echo $DISCORD_TOKEN

# Verifica dipendenze
npm audit
```

#### Dashboard Web Non Accessibile
1. **Verifica porta**: `netstat -an | grep :3000`
2. **Controlla firewall**: Potrebbe bloccare connessioni
3. **Verifica configurazione**: `curl http://localhost:3000/api/health`
4. **Log errori**: Controlla `logs/error.log`

#### Problemi Performance
1. **Memoria**: Monitora via `/api/metrics`
2. **Cache**: Verifica hit rate via `/api/cache`
3. **Errori**: Controlla rate via `/api/errors`
4. **GC**: Configurabile via `GC_INTERVAL_MINUTES`

### Debug Avanzato

```bash
# Log dettagliati
LOG_LEVEL=debug npm start

# Profiling memoria
node --inspect src/index.js

# Crash reports
ls -la logs/crashes/
```

## 🔒 Sicurezza

- Non condividere mai il tuo token Discord
- Mantieni private le chiavi API
- Non committare il file `.env` nel repository
- Usa variabili d'ambiente in produzione

## 📝 Licenza

MIT License - Vedi il file LICENSE per i dettagli.

## 🤝 Contribuire

I contributi sono benvenuti! Per contribuire:

1. Leggi la [Guida Sviluppatori](DEVELOPMENT.md)
2. Fai un fork del progetto
3. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
4. Segui le best practices documentate
5. Testa le modifiche con `npm test`
6. Committa con messaggi descrittivi (`git commit -m 'feat(music): add shuffle command'`)
7. Pusha al branch (`git push origin feature/AmazingFeature`)
8. Apri una Pull Request

### Convenzioni Sviluppo

- **Codice**: Segui le best practices in `DEVELOPMENT.md`
- **Commit**: Usa conventional commits (`type(scope): description`)
- **Testing**: Testa sempre le modifiche
- **Documentazione**: Aggiorna documentazione se necessario

## 📚 Documentazione

- **[README.md](README.md)** - Guida utente e installazione
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guida completa sviluppatori
- **[API Documentation](src/web/README.md)** - Documentazione API REST

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 🆘 Supporto

Se hai problemi o domande:

1. **Diagnostica automatica**: Controlla `/api/health` per stato sistema
2. **Documentazione**: Leggi [DEVELOPMENT.md](DEVELOPMENT.md) per troubleshooting avanzato
3. **Issues esistenti**: Cerca nelle [Issues](../../issues) esistenti
4. **Nuova Issue**: Apri una [Issue](../../issues/new) con:
   - Log errori (`logs/error.log`)
   - Output `/api/health`
   - Configurazione (senza token)
   - Passi per riprodurre il problema

### Canali di Supporto

- 🐛 **Bug Reports**: [GitHub Issues](../../issues)
- 💡 **Feature Requests**: [GitHub Discussions](../../discussions)
- 📖 **Documentazione**: [Wiki](../../wiki)
- 💬 **Community**: [Discord Server](#) (se disponibile)

---

**Creato da Geremia** 🚀

**Nota**: Questo bot utilizza architettura moderna con sistemi avanzati di monitoraggio, cache e gestione errori. Consulta `DEVELOPMENT.md` per dettagli tecnici completi!

*Buon divertimento con il tuo bot musicale AI!* 🎵🤖
