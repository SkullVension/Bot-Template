import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsFolder = path.join(__dirname, 'src', 'commands');

// Read through all category subfolders inside src/commands/
const categoryFolders = fs.readdirSync(commandsFolder);

for (const category of categoryFolders) {
    const categoryPath = path.join(commandsFolder, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(categoryPath, file);
        // Using dynamic absolute imports for modern ES Modules compatibility
        const { default: command } = await import(`file://${filePath}`);
        
        if (command && 'data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] Command script at ${file} is missing required data or execution targets.`);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`⏳ Initializing refresh sync for ${commands.length} structural application (/) commands...`);

        if (process.env.GUILD_ID) {
            // Rapid deployment specifically targeting your localized testing sandbox server
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log('✅ Successfully reloaded application (/) commands inside local Development Guild.');
        } else {
            // Global production routing deployment (Can take up to an hour to propagate worldwide)
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log('🌐 Successfully reloaded global application (/) commands across entire network infrastructure.');
        }
    } catch (error) {
        console.error('❌ System deployment runtime encountered critical API execution error:', error);
    }
})();