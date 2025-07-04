const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🤖 Configurazione Discord Music AI Bot\n');
console.log('Questo script ti aiuterà a configurare il bot rapidamente.\n');

const questions = [
    {
        key: 'DISCORD_TOKEN',
        question: '🔑 Inserisci il token del tuo bot Discord: ',
        required: true
    },
    {
        key: 'CLIENT_ID',
        question: '🆔 Inserisci il Client ID del bot: ',
        required: true
    },
    {
        key: 'GUILD_ID',
        question: '🏰 Inserisci l\'ID del server Discord (opzionale): ',
        required: false
    },
    {
        key: 'OPENAI_API_KEY',
        question: '🧠 Inserisci la chiave API OpenAI (opzionale): ',
        required: false
    },
    {
        key: 'WEB_PORT',
        question: '🌐 Porta per il server web (default 3000): ',
        required: false,
        default: '3000'
    }
];

let config = {};
let currentQuestion = 0;

function askQuestion() {
    if (currentQuestion >= questions.length) {
        generateEnvFile();
        return;
    }

    const q = questions[currentQuestion];
    rl.question(q.question, (answer) => {
        if (q.required && !answer.trim()) {
            console.log('❌ Questo campo è obbligatorio!');
            askQuestion();
            return;
        }

        config[q.key] = answer.trim() || q.default || '';
        currentQuestion++;
        askQuestion();
    });
}

function generateEnvFile() {
    let envContent = `# Discord Bot Configuration\nDISCORD_TOKEN=${config.DISCORD_TOKEN}\nCLIENT_ID=${config.CLIENT_ID}\n`;
    
    if (config.GUILD_ID) {
        envContent += `GUILD_ID=${config.GUILD_ID}\n`;
    }
    
    envContent += `\n# OpenAI Configuration\n`;
    if (config.OPENAI_API_KEY) {
        envContent += `OPENAI_API_KEY=${config.OPENAI_API_KEY}\n`;
    } else {
        envContent += `# OPENAI_API_KEY=your_openai_api_key_here\n`;
    }
    
    envContent += `\n# Web Server Configuration\nWEB_PORT=${config.WEB_PORT}\nWEB_HOST=localhost\n`;
    
    envContent += `\n# Bot Configuration\nBOT_PREFIX=!\nDEFAULT_VOLUME=0.5\nMAX_QUEUE_SIZE=50\n`;
    
    envContent += `\n# AI Configuration\nAI_MODEL=gpt-3.5-turbo\nAI_MAX_TOKENS=150\nAI_TEMPERATURE=0.7\n`;

    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ File .env creato con successo!');
    console.log('\n📋 Prossimi passi:');
    console.log('1. Assicurati che il bot abbia i permessi necessari nel server Discord');
    console.log('2. Avvia il bot con: npm start');
    console.log('3. Accedi al pannello web su: http://localhost:' + config.WEB_PORT);
    
    if (!config.OPENAI_API_KEY) {
        console.log('\n💡 Suggerimento: Aggiungi una chiave OpenAI per abilitare l\'AI avanzata');
    }
    
    console.log('\n🎵 Buon divertimento con il tuo bot musicale!');
    
    rl.close();
}

// Controlla se .env esiste già
if (fs.existsSync('.env')) {
    rl.question('⚠️  Il file .env esiste già. Vuoi sovrascriverlo? (s/n): ', (answer) => {
        if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
            console.log('\n🔧 Iniziamo la configurazione...\n');
            askQuestion();
        } else {
            console.log('\n✅ Configurazione annullata. Il file .env esistente è stato mantenuto.');
            rl.close();
        }
    });
} else {
    console.log('🔧 Iniziamo la configurazione...\n');
    askQuestion();
}