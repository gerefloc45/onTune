# Test Suite per onTune Bot

Questa directory contiene tutti i test per il bot Discord onTune, organizzati in diverse categorie per garantire una copertura completa e una manutenzione facile.

## Struttura dei Test

```
tests/
├── unit/           # Test unitari per singoli moduli
├── integration/    # Test di integrazione tra componenti
├── e2e/           # Test end-to-end per flussi completi
├── setup.js       # Configurazione globale per Jest
├── env.js         # Variabili d'ambiente per i test
└── README.md      # Questa documentazione
```

## Tipi di Test

### Test Unitari (`unit/`)
Testano singole funzioni, classi o moduli in isolamento:
- **config.test.js**: Test per il sistema di configurazione
- Validazione delle funzioni pure
- Mock delle dipendenze esterne
- Test delle condizioni limite

### Test di Integrazione (`integration/`)
Testano l'interazione tra più componenti:
- **bot.test.js**: Test per l'integrazione del bot Discord
- Interazione tra moduli
- Test delle API interne
- Verifica dei flussi di dati

### Test End-to-End (`e2e/`)
Testano scenari completi dall'inizio alla fine:
- **music-flow.test.js**: Test del flusso musicale completo
- Simulazione di interazioni utente reali
- Test dell'interfaccia web
- Verifica dei flussi business completi

## Esecuzione dei Test

### Comandi Disponibili

```bash
# Esegui tutti i test
npm test

# Esegui test in modalità watch (sviluppo)
npm run test:watch

# Esegui test con coverage
npm run test:coverage

# Esegui test per CI/CD
npm run test:ci

# Esegui solo test unitari
npm run test:unit

# Esegui solo test di integrazione
npm run test:integration

# Esegui solo test end-to-end
npm run test:e2e
```

### Variabili d'Ambiente

I test utilizzano variabili d'ambiente specifiche definite in `env.js`:
- `NODE_ENV=test`
- Token e credenziali mock
- Configurazioni ottimizzate per i test
- Disabilitazione di servizi esterni

## Configurazione Jest

La configurazione Jest è definita in `jest.config.js` nella root del progetto:

- **Ambiente**: Node.js
- **Timeout**: 30 secondi per test asincroni
- **Coverage**: Soglia minima del 70%
- **Mock**: Automatici per Discord.js, Express, e altre dipendenze
- **Reporter**: Console + JUnit XML per CI

## Mock e Utilities

### Setup Globale (`setup.js`)
- Mock per Discord.js e dipendenze audio
- Utilities per directory temporanee
- Configurazione console per ridurre il rumore
- Cleanup automatico tra i test

### Mock Principali
- **Discord.js**: Client, eventi, interazioni
- **@discordjs/voice**: Audio player, connessioni vocali
- **Express**: Server web, middleware
- **File System**: Operazioni su file per test isolati

## Best Practices

### Scrittura dei Test
1. **Nomi descrittivi**: Usa nomi che spiegano cosa testa il test
2. **Arrange-Act-Assert**: Organizza i test in sezioni chiare
3. **Isolamento**: Ogni test deve essere indipendente
4. **Mock appropriati**: Mock solo le dipendenze esterne
5. **Cleanup**: Pulisci sempre le risorse dopo i test

### Organizzazione
1. **Un file per modulo**: Ogni modulo dovrebbe avere il suo file di test
2. **Gruppi logici**: Usa `describe()` per raggruppare test correlati
3. **Test parametrici**: Usa `test.each()` per test con dati multipli
4. **Setup condiviso**: Usa `beforeEach()` e `afterEach()` per setup comune

### Performance
1. **Test veloci**: I test unitari dovrebbero essere < 100ms
2. **Parallelizzazione**: Jest esegue test in parallelo per default
3. **Mock pesanti**: Mock operazioni costose (rete, file system)
4. **Cleanup memoria**: Evita memory leak nei test lunghi

## Debugging dei Test

### VS Code
Usa la configurazione di debug in `.vscode/launch.json`:
- **Debug Maintenance Script**: Per testare script di manutenzione
- **Test Configuration Loading**: Per testare il caricamento config

### Comandi Utili
```bash
# Esegui un singolo test file
npx jest tests/unit/config.test.js

# Esegui test con pattern
npx jest --testNamePattern="should load environment"

# Debug con Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose
```

## Coverage Report

Il coverage report viene generato in `coverage/`:
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info` (per CI/CD)
- **Text**: Output console durante i test

### Soglie di Coverage
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## CI/CD Integration

I test sono integrati nei workflow GitHub Actions:

### Workflow CI (`ci.yml`)
- Esegue test su multiple versioni Node.js
- Upload dei risultati come artifacts
- Upload coverage su Codecov
- Fallisce se i test non passano

### Workflow Maintenance (`maintenance.yml`)
- Test di smoke per verificare la salute del sistema
- Validazione della configurazione
- Check delle dipendenze

## Troubleshooting

### Problemi Comuni

1. **Test timeout**:
   ```bash
   # Aumenta il timeout
   jest.setTimeout(60000);
   ```

2. **Memory leak**:
   ```bash
   # Esegui test in serie
   npm test -- --runInBand
   ```

3. **Mock non funzionanti**:
   ```javascript
   // Reset mock tra test
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

4. **Variabili d'ambiente**:
   ```javascript
   // Verifica che env.js sia caricato
   console.log(process.env.NODE_ENV); // dovrebbe essere 'test'
   ```

### Log e Debug
- I log sono disabilitati nei test per default
- Usa `console.error` per debug (non viene mockato)
- Abilita log specifici modificando `setup.js`

## Contribuire

Quando aggiungi nuove funzionalità:

1. **Scrivi test prima** (TDD quando possibile)
2. **Mantieni coverage alto** (>70% per nuove funzioni)
3. **Testa edge cases** (errori, input invalidi)
4. **Documenta test complessi** con commenti
5. **Aggiorna questo README** se necessario

## Risorse

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Discord.js Testing Guide](https://discordjs.guide/testing/)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-overall-quality-practices)
- [Supertest Documentation](https://github.com/visionmedia/supertest)