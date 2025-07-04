# TUNE Web API Documentation

Documentazione completa delle API REST del bot TUNE.

## 🌐 Panoramica

Il server web di TUNE espone diverse API REST per il monitoraggio, controllo e gestione del bot. Tutte le API restituiscono risposte in formato JSON.

### Base URL
```
http://localhost:3000
```

### Sicurezza
- **Rate Limiting**: 100 richieste per IP ogni 15 minuti
- **CORS**: Configurato per origini specifiche in produzione
- **Headers di Sicurezza**: Helmet.js integrato
- **Validazione Input**: Sanitizzazione automatica

## 📊 Endpoint di Monitoraggio

### GET /api/status
Restituisce lo stato generale del bot e del server.

**Response:**
```json
{
  "status": "online",
  "uptime": 3600000,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "discord": {
    "connected": true,
    "guilds": 5,
    "users": 150
  },
  "web": {
    "port": 3000,
    "connections": 3
  }
}
```

### GET /api/health
Restituisce un report dettagliato sullo stato di salute del sistema.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "memory": {
      "status": "healthy",
      "usage_percent": 45.2,
      "threshold_percent": 80
    },
    "commands": {
      "status": "healthy",
      "error_rate_percent": 2.1,
      "threshold_percent": 10
    },
    "response_time": {
      "status": "healthy",
      "avg_ms": 150,
      "threshold_ms": 1000
    }
  },
  "recommendations": []
}
```

### GET /api/metrics
Restituisce metriche dettagliate di performance.

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime_ms": 3600000,
  "commands": {
    "total": 1250,
    "errors": 25,
    "success_rate": 98.0,
    "avg_response_time_ms": 150
  },
  "memory": {
    "heap_used_mb": 45.2,
    "heap_total_mb": 67.8,
    "external_mb": 12.3,
    "rss_mb": 89.1,
    "usage_percent": 45.2
  },
  "connections": {
    "active": 3,
    "total": 127,
    "errors": 2
  },
  "music": {
    "songs_played": 89,
    "queue_size": 5,
    "active_connections": 2
  }
}
```

### GET /api/cache
Restituisce statistiche delle cache del sistema.

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "caches": {
    "search": {
      "size": 245,
      "max_size": 1000,
      "hits": 1890,
      "misses": 245,
      "hit_rate": 88.5,
      "memory_usage_mb": 12.3,
      "ttl_ms": 900000
    },
    "metadata": {
      "size": 567,
      "max_size": 2000,
      "hits": 3456,
      "misses": 567,
      "hit_rate": 85.9,
      "memory_usage_mb": 23.1,
      "ttl_ms": 3600000
    },
    "streams": {
      "size": 12,
      "max_size": 100,
      "hits": 89,
      "misses": 12,
      "hit_rate": 88.1,
      "memory_usage_mb": 5.7,
      "ttl_ms": 300000
    }
  },
  "global_stats": {
    "total_size": 824,
    "total_memory_mb": 41.1,
    "avg_hit_rate": 87.5
  }
}
```

### GET /api/errors
Restituisce statistiche degli errori del sistema.

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "total_errors": 47,
  "error_rate_percent": 2.1,
  "by_type": {
    "DISCORD_API": 12,
    "VOICE_CONNECTION": 8,
    "MUSIC_STREAM": 15,
    "RATE_LIMIT": 3,
    "PERMISSION": 5,
    "VALIDATION": 2,
    "NETWORK": 1,
    "UNKNOWN": 1
  },
  "recent_errors": [
    {
      "id": "err_1642248600_abc123",
      "type": "MUSIC_STREAM",
      "message": "Stream connection failed",
      "timestamp": "2024-01-15T10:25:00.000Z",
      "retry_count": 2
    }
  ],
  "critical_errors": 0
}
```

## 🎵 Endpoint Musicali

### GET /api/queue
Restituisce lo stato della coda musicale.

**Response:**
```json
{
  "guild_id": "123456789012345678",
  "current_song": {
    "title": "Song Title",
    "artist": "Artist Name",
    "duration": 240000,
    "position": 45000,
    "url": "https://youtube.com/watch?v=..."
  },
  "queue": [
    {
      "title": "Next Song",
      "artist": "Next Artist",
      "duration": 180000,
      "url": "https://youtube.com/watch?v=..."
    }
  ],
  "is_playing": true,
  "is_paused": false,
  "volume": 50,
  "loop_mode": "off",
  "shuffle": false
}
```

### POST /api/play
Avvia la riproduzione di una canzone.

**Request Body:**
```json
{
  "query": "song title or URL",
  "guild_id": "123456789012345678",
  "user_id": "987654321098765432"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Song added to queue",
  "song": {
    "title": "Song Title",
    "artist": "Artist Name",
    "duration": 240000,
    "url": "https://youtube.com/watch?v=..."
  },
  "queue_position": 3
}
```

### POST /api/skip
Salta la canzone corrente.

**Request Body:**
```json
{
  "guild_id": "123456789012345678",
  "user_id": "987654321098765432"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Song skipped",
  "next_song": {
    "title": "Next Song Title",
    "artist": "Next Artist",
    "duration": 180000
  }
}
```

### POST /api/pause
Mette in pausa/riprende la riproduzione.

**Request Body:**
```json
{
  "guild_id": "123456789012345678",
  "action": "pause" // o "resume"
}
```

### POST /api/volume
Modifica il volume.

**Request Body:**
```json
{
  "guild_id": "123456789012345678",
  "volume": 75 // 0-100
}
```

## 🔧 Endpoint di Configurazione

### GET /api/config
Restituisce la configurazione corrente (senza dati sensibili).

**Response:**
```json
{
  "web_port": 3000,
  "node_env": "development",
  "log_level": "info",
  "performance_monitoring": true,
  "cache_ttl_minutes": 15,
  "rate_limit_max_requests": 100,
  "rate_limit_window_minutes": 15,
  "memory_threshold_percent": 80,
  "gc_interval_minutes": 30
}
```

## 📡 WebSocket Events

Il server supporta anche connessioni WebSocket per aggiornamenti in tempo reale.

### Connessione
```javascript
const socket = io('http://localhost:3000');
```

### Eventi Disponibili

#### `metrics_update`
Aggiornamenti metriche ogni 30 secondi.
```javascript
socket.on('metrics_update', (data) => {
  console.log('New metrics:', data);
});
```

#### `song_changed`
Notifica quando cambia la canzone.
```javascript
socket.on('song_changed', (data) => {
  console.log('Now playing:', data.song);
});
```

#### `queue_updated`
Notifica quando la coda viene modificata.
```javascript
socket.on('queue_updated', (data) => {
  console.log('Queue updated:', data.queue);
});
```

#### `error_occurred`
Notifica errori in tempo reale.
```javascript
socket.on('error_occurred', (data) => {
  console.log('Error:', data.error);
});
```

## 🚨 Codici di Errore

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (parametri mancanti/invalidi)
- `401` - Unauthorized (se autenticazione abilitata)
- `403` - Forbidden (rate limit superato)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": true,
  "message": "Descrizione errore",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "request_id": "req_1642248600_xyz789"
}
```

## 🔒 Sicurezza e Rate Limiting

### Rate Limits
- **Globale**: 100 richieste per IP ogni 15 minuti
- **API Musicali**: 20 richieste per IP ogni minuto
- **Metriche**: 60 richieste per IP ogni minuto

### Headers di Sicurezza
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (in produzione)

### CORS Policy
- **Development**: Tutte le origini permesse
- **Production**: Solo origini specifiche configurate

## 📝 Esempi di Utilizzo

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Ottenere metriche
const metrics = await axios.get('http://localhost:3000/api/metrics');
console.log(metrics.data);

// Riprodurre una canzone
const response = await axios.post('http://localhost:3000/api/play', {
  query: 'Never Gonna Give You Up',
  guild_id: '123456789012345678',
  user_id: '987654321098765432'
});
```

### Python
```python
import requests

# Ottenere stato di salute
response = requests.get('http://localhost:3000/api/health')
health_data = response.json()
print(f"Status: {health_data['status']}")

# Controllare cache
response = requests.get('http://localhost:3000/api/cache')
cache_data = response.json()
print(f"Hit rate: {cache_data['global_stats']['avg_hit_rate']}%")
```

### cURL
```bash
# Stato del bot
curl http://localhost:3000/api/status

# Metriche performance
curl http://localhost:3000/api/metrics

# Riprodurre canzone
curl -X POST http://localhost:3000/api/play \
  -H "Content-Type: application/json" \
  -d '{"query":"Bohemian Rhapsody","guild_id":"123456789012345678","user_id":"987654321098765432"}'
```

## 🔧 Configurazione Avanzata

### Variabili d'Ambiente per API
```env
# Server web
WEB_PORT=3000
WEB_HOST=0.0.0.0

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15

# Sicurezza
SESSION_SECRET=your_session_secret
ENABLE_HTTPS=false
```

### Performance Tuning
```json
{
  "web": {
    "compression": true,
    "cache_static_files": true,
    "request_timeout_ms": 30000,
    "max_request_size": "10mb"
  },
  "websocket": {
    "ping_timeout": 60000,
    "ping_interval": 25000,
    "max_connections": 100
  }
}
```

---

**Nota**: Questa documentazione è aggiornata alla versione corrente del bot. Per funzionalità aggiuntive o modifiche, consulta il codice sorgente in `src/web/server.js`.
