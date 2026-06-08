import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize client with necessary Intents to track events and read background data
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration, // Required to capture standard bans/kicks events
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// Setup runtime data structural matrices
client.commands = new Collection();

// 📂 Core Bootstrapping Systems Execution
const initializeFramework = async () => {
    const handlersFolder = path.join(__dirname, 'handlers');
    const handlerFiles = fs.readdirSync(handlersFolder).filter(file => file.endsWith('.js'));

    console.log('⚙️ Initializing file handlers from internal system paths...');
    
    for (const file of handlerFiles) {
        const filePath = path.join(handlersFolder, file);
        const { default: handler } = await import(`file://${filePath}`);
        if (typeof handler === 'function') {
            handler(client);
        }
    }
};

// Handle graceful engine shutdowns or process unhandled edge-case crash rejections safely
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ CRITICAL SYSTEM: Unhandled Promise Rejection detected at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error('⚠️ CRITICAL SYSTEM: Uncaught Exception thrown:', err, 'at origin:', origin);
});

// Fire bootstrap handlers and login application shell
(async () => {
    await initializeFramework();
    await client.login(process.env.DISCORD_TOKEN);
})();