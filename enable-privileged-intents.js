#!/usr/bin/env node

/**
 * Script per abilitare automaticamente gli Intents Privilegiati
 * Esegui questo script dopo aver abilitato gli intents nel Discord Developer Portal
 */

const fs = require('fs');
const path = require('path');

const BOT_FILE_PATH = path.join(__dirname, 'src', 'bot.js');

console.log('🔧 Abilitazione Intents Privilegiati...');

try {
    // Leggi il file bot.js
    let botContent = fs.readFileSync(BOT_FILE_PATH, 'utf8');
    
    // Controlla se gli intents sono già abilitati
    if (botContent.includes('GatewayIntentBits.MessageContent,') && 
        !botContent.includes('// GatewayIntentBits.MessageContent,')) {
        console.log('✅ Gli intents privilegiati sono già abilitati!');
        process.exit(0);
    }
    
    // Abilita MessageContent Intent
    botContent = botContent.replace(
        /\/\/ GatewayIntentBits\.MessageContent,/g,
        'GatewayIntentBits.MessageContent,'
    );
    
    // Abilita GuildMembers Intent
    botContent = botContent.replace(
        /\/\/ GatewayIntentBits\.GuildMembers/g,
        'GatewayIntentBits.GuildMembers'
    );
    
    // Rimuovi i controlli per message.content vuoto
    botContent = botContent.replace(
        /\/\/ Senza MessageContent intent privilegiato, message\.content potrebbe essere vuoto[\s\S]*?return;[\s\S]*?}/g,
        ''
    );
    
    // Rimuovi il controllo nell'handleAIResponse
    botContent = botContent.replace(
        /if \(!message\.content\) {[\s\S]*?return;[\s\S]*?}/g,
        ''
    );
    
    // Scrivi il file aggiornato
    fs.writeFileSync(BOT_FILE_PATH, botContent);
    
    console.log('✅ Intents privilegiati abilitati con successo!');
    console.log('📝 File bot.js aggiornato');
    console.log('🔄 Riavvia il bot per applicare le modifiche');
    console.log('');
    console.log('🎯 Funzionalità ora disponibili:');
    console.log('   ✅ Lettura contenuto messaggi');
    console.log('   ✅ Comandi con prefisso (!play, !help, ecc.)');
    console.log('   ✅ Risposte AI complete');
    console.log('   ✅ Gestione membri del server');
    
} catch (error) {
    console.error('❌ Errore durante l\'abilitazione degli intents:', error.message);
    console.log('');
    console.log('🔧 Soluzione manuale:');
    console.log('1. Apri src/bot.js');
    console.log('2. Rimuovi i commenti da:');
    console.log('   - GatewayIntentBits.MessageContent,');
    console.log('   - GatewayIntentBits.GuildMembers');
    console.log('3. Rimuovi i controlli per message.content vuoto');
    process.exit(1);
}