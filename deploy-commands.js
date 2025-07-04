#!/usr/bin/env node

/**
 * Script per registrare i comandi slash su Discord
 * Esegui questo script per abilitare i comandi slash come alternativa
 * ai comandi con prefisso quando MessageContent intent non è disponibile
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const SlashCommands = require('./src/commands/slashCommands');

// Crea un'istanza temporanea per ottenere i comandi
const tempBot = {
    musicManager: { play: () => {}, skip: () => {}, stop: () => {}, showQueue: () => {} },

    voiceManager: { joinVoiceChannel: () => {}, leaveVoiceChannel: () => {} }
};

const slashCommands = new SlashCommands(tempBot);
const commands = slashCommands.getCommands();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
    try {
        console.log('🚀 Inizio registrazione comandi slash...');
        console.log(`📝 Registrando ${commands.length} comandi...`);
        
        // Registra i comandi globalmente (disponibili in tutti i server)
        if (process.env.DISCORD_GUILD_ID) {
            // Registrazione per un server specifico (più veloce per testing)
            console.log(`🎯 Registrazione per il server: ${process.env.DISCORD_GUILD_ID}`);
            
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
                { body: commands }
            );
            
            console.log(`✅ ${data.length} comandi slash registrati per il server!`);
        } else {
            // Registrazione globale (può richiedere fino a 1 ora per essere attiva)
            console.log('🌍 Registrazione globale (può richiedere fino a 1 ora)');
            
            const data = await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands }
            );
            
            console.log(`✅ ${data.length} comandi slash registrati globalmente!`);
        }
        
        console.log('');
        console.log('🎉 Comandi slash disponibili:');
        commands.forEach(cmd => {
            console.log(`   /${cmd.name} - ${cmd.description}`);
        });
        
        console.log('');
        console.log('💡 I comandi slash funzionano anche senza MessageContent intent!');
        console.log('🔄 Riavvia il bot per attivare la gestione delle interazioni.');
        
    } catch (error) {
        console.error('❌ Errore durante la registrazione dei comandi:', error);
        
        if (error.code === 50001) {
            console.log('');
            console.log('🔧 Soluzione:');
            console.log('1. Verifica che DISCORD_CLIENT_ID sia corretto nel file .env');
            console.log('2. Assicurati che il bot abbia il permesso "applications.commands"');
        }
        
        if (error.code === 50013) {
            console.log('');
            console.log('🔧 Soluzione:');
            console.log('1. Il bot non ha permessi sufficienti nel server');
            console.log('2. Assicurati che il bot abbia il permesso "Use Slash Commands"');
        }
        
        process.exit(1);
    }
}

// Verifica configurazione
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN non trovato nel file .env');
    process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
    console.error('❌ DISCORD_CLIENT_ID non trovato nel file .env');
    console.log('💡 Puoi trovare il Client ID nella sezione "General Information" del Discord Developer Portal');
    process.exit(1);
}

deployCommands();