# onTune - Discord Music Bot Ottimizzato 🚀

Un bot Discord avanzato per la riproduzione musicale con ottimizzazioni delle performance, cache intelligente, dashboard web e monitoraggio in tempo reale.

## ✨ Caratteristiche Principali

- 🎵 **Riproduzione Multi-Piattaforma**: YouTube, SoundCloud e Spotify
- 🔄 **Sistema Coda Avanzato**: Loop, shuffle e gestione intelligente
- ⚡ **Comandi Slash**: Supporto completo Discord slash commands
- 🌐 **Dashboard Web**: Interfaccia web per controllo remoto
- 📊 **Monitoraggio Performance**: Statistiche in tempo reale

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

## 🚀 Installazione

### Prerequisiti
- Node.js 16+ installato
- Account Discord Developer
- Account Spotify Developer (opzionale per supporto Spotify)
- FFmpeg installato per la riproduzione audio

### 1. Clona e Installa
```bash
cd DiscordBot
npm install
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

### Pannello Web

Accedi al pannello web su: `http://localhost:3000`

Il pannello offre:
- 📊 Monitoraggio stato del bot
- 🎵 Controlli musicali completi
- 🎤 Gestione canali vocali
- 📋 Visualizzazione code in tempo reale
- 📈 Statistiche performance

## 🔧 Configurazione Avanzata

### Aggiunta di Nuovi Comandi

1. Aggiungi il comando in `src/bot.js` nella funzione `handleCommand`
2. Implementa la logica nel manager appropriato
3. Aggiorna il messaggio di help

### Personalizzazione Interfaccia Web

Modifica `src/web/public/index.html` per personalizzare l'interfaccia web.

## 📁 Struttura del Progetto

```
onTune/
├── src/
│   ├── bot.js                 # File principale del bot
│   ├── commands/
│   │   └── slashCommands.js   # Comandi slash Discord
│   ├── managers/
│   │   ├── MusicManager.js    # Gestione musica
│   │   └── VoiceManager.js    # Gestione voce
│   ├── utils/
│   │   ├── logger.js          # Sistema di logging
│   │   └── performance.js     # Monitoraggio performance
│   └── web/
│       ├── server.js          # Server web
│       └── public/            # File statici dashboard
├── config/                    # File di configurazione
├── package.json
├── .env
└── README.md
```

## 🛠️ Risoluzione Problemi

### Bot non si connette
- Verifica che il token Discord sia corretto
- Controlla che il bot abbia i permessi necessari nel server
- Assicurati che tutte le dipendenze siano installate

### Musica non funziona
- Verifica che il bot abbia i permessi per entrare e parlare nei canali vocali
- Controlla che FFmpeg sia installato correttamente
- Assicurati che il canale vocale non sia pieno

### Dashboard Web non accessibile
- Verifica che il server web sia avviato (usa `.webon`)
- Controlla che la porta 3000 non sia occupata
- Assicurati che il firewall non blocchi la connessione

## 🔒 Sicurezza

- Non condividere mai il tuo token Discord
- Mantieni private le chiavi API
- Non committare il file `.env` nel repository
- Usa variabili d'ambiente in produzione

## 📝 Licenza

MIT License - Vedi il file LICENSE per i dettagli.

## 🤝 Contributi

I contributi sono benvenuti! Sentiti libero di:
- Segnalare bug
- Suggerire nuove funzionalità
- Inviare pull request

## 📞 Supporto

Per supporto o domande:
- Apri un issue su GitHub
- Controlla la documentazione
- Verifica i log del bot per errori specifici

---

**Creato da Geremia** 🚀

*Buon divertimento con il tuo bot musicale AI!* 🎵🤖