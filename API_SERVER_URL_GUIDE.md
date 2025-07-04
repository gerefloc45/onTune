# 🌐 API Server URL - Guida Completa

## Panoramica
L'API Server URL permette di generare automaticamente URL accessibili per il server web del bot Discord, sia per accesso generale che specifico per guild.

## Endpoint Disponibili

### 1. URL Base del Server
```http
GET /api/server-url
```

**Descrizione**: Genera l'URL base del server web

**Risposta di esempio**:
```json
{
  "success": true,
  "data": {
    "url": "http://192.168.1.100:3001",
    "type": "base-server",
    "publicIP": "203.0.113.1",
    "localIP": "192.168.1.100",
    "port": 3001
  }
}
```

### 2. URL Specifico per Guild
```http
GET /api/server-url/{guildId}
```

**Parametri**:
- `guildId` (string): ID del server Discord

**Descrizione**: Genera l'URL specifico per la dashboard di una guild

**Risposta di esempio**:
```json
{
  "success": true,
  "data": {
    "url": "http://192.168.1.100:3001/dashboard/1234567890123456789",
    "type": "guild-specific",
    "guildId": "1234567890123456789"
  }
}
```

## Funzionalità

### 🔍 Rilevamento IP Automatico
- **IP Pubblico**: L'API tenta di rilevare l'IP pubblico del server
- **Fallback Locale**: Se l'IP pubblico non è disponibile, usa l'IP locale
- **Accessibilità**: Genera URL ottimizzati per l'accesso esterno quando possibile

### 🛡️ Gestione Errori
- Gestione automatica degli errori di rete
- Fallback su IP locale in caso di problemi
- Risposte JSON strutturate con codici di errore appropriati

## Esempi di Utilizzo

### JavaScript/Fetch
```javascript
// Ottieni URL base del server
fetch('/api/server-url')
  .then(response => response.json())
  .then(data => {
    console.log('URL Server:', data.data.url);
    console.log('IP Pubblico:', data.data.publicIP);
  });

// Ottieni URL specifico per guild
fetch('/api/server-url/1234567890123456789')
  .then(response => response.json())
  .then(data => {
    console.log('URL Dashboard:', data.data.url);
    window.open(data.data.url, '_blank');
  });
```

### cURL
```bash
# URL base
curl http://localhost:3001/api/server-url

# URL specifico per guild
curl http://localhost:3001/api/server-url/1234567890123456789
```

### Python
```python
import requests

# URL base del server
response = requests.get('http://localhost:3001/api/server-url')
data = response.json()
print(f"URL Server: {data['data']['url']}")

# URL specifico per guild
guild_id = "1234567890123456789"
response = requests.get(f'http://localhost:3001/api/server-url/{guild_id}')
data = response.json()
print(f"URL Dashboard: {data['data']['url']}")
```

## Integrazione con Discord Bot

### Comando Discord
L'API è integrata con il comando Discord `.weblink` che utilizza internamente questa funzionalità:

```
.weblink
```

### Utilizzo Programmatico
```javascript
// Nel codice del bot
const serverUrl = await bot.generatePublicDashboardLink(guildId);
console.log('Dashboard URL:', serverUrl);
```

## Configurazione

### Variabili d'Ambiente
```env
WEB_PORT=3001          # Porta del server web
WEB_HOST=0.0.0.0       # Host di ascolto (tutte le interfacce)
```

### Requisiti di Rete
- **Porta Aperta**: La porta configurata deve essere accessibile
- **Firewall**: Configurare il firewall per permettere connessioni in entrata
- **Router**: Configurare port forwarding se necessario per accesso esterno

## Sicurezza

### ⚠️ Considerazioni Importanti
- L'API non richiede autenticazione per la generazione di URL
- Gli URL generati sono pubblicamente accessibili
- Assicurarsi che il server web sia configurato correttamente per l'accesso pubblico
- Considerare l'uso di HTTPS in produzione

### 🔒 Best Practices
1. **Limitare l'accesso**: Configurare firewall appropriati
2. **Monitoraggio**: Tenere traccia degli accessi alla dashboard
3. **Aggiornamenti**: Mantenere il bot aggiornato per patch di sicurezza

## Risoluzione Problemi

### Errori Comuni

#### "Cannot read property 'getPort' of undefined"
- **Causa**: Server web non inizializzato
- **Soluzione**: Assicurarsi che il server web sia avviato con `.webon`

#### "Timeout" nella rilevazione IP
- **Causa**: Problemi di connessione internet
- **Soluzione**: L'API userà automaticamente l'IP locale

#### URL non accessibile esternamente
- **Causa**: Configurazione di rete
- **Soluzione**: Verificare port forwarding e configurazione firewall

### Debug
```javascript
// Test dell'API
fetch('/api/server-url')
  .then(response => response.json())
  .then(data => console.log('Debug Info:', data))
  .catch(error => console.error('Errore:', error));
```

## Changelog

### v1.0.0
- ✅ Implementazione endpoint `/api/server-url`
- ✅ Supporto per URL base e specifici per guild
- ✅ Rilevamento automatico IP pubblico/locale
- ✅ Gestione errori completa
- ✅ Integrazione con comando Discord `.weblink`

---

**Nota**: Questa API è parte del sistema di dashboard web del Discord Bot e richiede che il server web sia attivo per funzionare correttamente.