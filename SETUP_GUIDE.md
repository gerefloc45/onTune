# 🔧 Guida Completa alla Configurazione

## 📋 Indice
1. [Configurazione Base](#configurazione-base)
2. [Intents Privilegiati](#intents-privilegiati)
3. [Comandi Slash vs Prefisso](#comandi-slash-vs-prefisso)
4. [Permessi Bot](#permessi-bot)
5. [Risoluzione Problemi](#risoluzione-problemi)

## 🚀 Configurazione Base

### 1. Installazione
```bash
npm install
npm run setup
```

### 2. Configurazione Iniziale
Il bot è configurato per funzionare **immediatamente** senza intents privilegiati:
- ✅ Comandi Slash funzionano
- ✅ Interfaccia Web funziona
- ❌ Comandi con prefisso NON funzionano

### 3. Avvio
```bash
npm run dev
```

## 🔐 Intents Privilegiati

### Cosa Sono?
Gli **Intents Privilegiati** sono permessi speciali che permettono al bot di:
- Leggere il contenuto dei messaggi (`MessageContent`)
- Accedere alla lista membri del server (`GuildMembers`)
- Vedere lo stato di presenza degli utenti (`GuildPresences`)

### Come Abilitarli?

#### 1. Discord Developer Portal
1. Vai su https://discord.com/developers/applications
2. Seleziona la tua applicazione
3. Vai su **Bot** nel menu laterale
4. Scorri fino a **Privileged Gateway Intents**
5. Abilita:
   - ✅ **Message Content Intent**
   - ✅ **Server Members Intent** (opzionale)

#### 2. Aggiorna il Codice
```bash
npm run enable-intents
```

#### 3. Riavvia il Bot
```bash
npm run dev
```

### ⚠️ Limitazioni
- **Bot con <100 server**: Puoi abilitare gli intents liberamente
- **Bot con 100+ server**: Richiede verifica Discord
- **Bot verificati**: Processo di approvazione richiesto

## 🎯 Comandi Slash vs Prefisso

### Comandi Slash (Raccomandati)
✅ **Vantaggi:**
- Funzionano sempre (non richiedono intents)
- Autocompletamento
- Validazione parametri
- Interfaccia moderna
- Supporto mobile ottimale

❌ **Svantaggi:**
- Devono essere registrati
- Limite di 100 comandi globali

### Comandi con Prefisso
✅ **Vantaggi:**
- Più flessibili
- Nessun limite di numero
- Supporto alias

❌ **Svantaggi:**
- Richiedono MessageContent Intent
- Nessun autocompletamento
- Meno user-friendly

### Registrazione Comandi Slash
```bash
# Registra comandi globalmente (1 ora per attivarsi)
npm run deploy-commands

# Registra per un server specifico (immediato)
DISCORD_GUILD_ID=123456789 npm run deploy-commands
```

## 🛡️ Permessi Bot

### Permessi Minimi Richiesti
Quando inviti il bot, seleziona:

#### Permessi Generali
- ✅ **View Channels** - Vedere i canali
- ✅ **Send Messages** - Inviare messaggi
- ✅ **Use Slash Commands** - Usare comandi slash

#### Permessi Musicali
- ✅ **Connect** - Connettersi ai canali vocali
- ✅ **Speak** - Parlare nei canali vocali
- ✅ **Use Voice Activity** - Usare attivazione vocale

#### Permessi Avanzati (Opzionali)
- ✅ **Manage Messages** - Gestire messaggi
- ✅ **Embed Links** - Incorporare link
- ✅ **Attach Files** - Allegare file
- ✅ **Read Message History** - Leggere cronologia

### URL di Invito
```
https://discord.com/api/oauth2/authorize?client_id=TUO_CLIENT_ID&permissions=3148800&scope=bot%20applications.commands
```

## 🔧 Risoluzione Problemi

### Bot Non Risponde ai Comandi

#### Comandi Slash Non Funzionano
1. **Verifica registrazione:**
   ```bash
   npm run deploy-commands
   ```

2. **Controlla permessi:**
   - Bot ha permesso "Use Slash Commands"?
   - Bot può vedere il canale?

3. **Aspetta propagazione:**
   - Comandi globali: fino a 1 ora
   - Comandi server: immediati

#### Comandi Prefisso Non Funzionano
1. **Verifica intents:**
   - MessageContent Intent abilitato nel Developer Portal?
   - Codice aggiornato con `npm run enable-intents`?

2. **Controlla logs:**
   ```bash
   npm run dev
   ```
   Cerca messaggi di errore o avvisi

### Errori Comuni

#### "Used disallowed intents"
- **Causa:** Intents privilegiati nel codice ma non abilitati nel portal
- **Soluzione:** Abilita nel Developer Portal o rimuovi dal codice

#### "Missing Permissions"
- **Causa:** Bot non ha permessi sufficienti
- **Soluzione:** Re-invita con permessi corretti

#### "Command not found"
- **Causa:** Comandi slash non registrati
- **Soluzione:** `npm run deploy-commands`

### Debug Avanzato

#### Verifica Stato Bot
```bash
# Controlla se il bot è online
curl http://localhost:3000/api/status
```

#### Logs Dettagliati
Aggiungi al file `.env`:
```
DEBUG=true
LOG_LEVEL=debug
```

## 📞 Supporto

Se hai problemi:
1. Controlla i logs del bot
2. Verifica la configurazione `.env`
3. Controlla i permessi Discord
4. Consulta la documentazione Discord

### Link Utili
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Documentazione Discord.js](https://discord.js.org/)
- [Guida Intents](https://discord.com/developers/docs/topics/gateway#gateway-intents)
- [Calcolatore Permessi](https://discordapi.com/permissions.html)