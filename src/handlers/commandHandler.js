import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client) => {
    const commandsFolder = path.join(__dirname, '..', 'commands');
    if (!fs.existsSync(commandsFolder)) return;

    const categoryFolders = fs.readdirSync(commandsFolder);

    for (const category of categoryFolders) {
        const categoryPath = path.join(commandsFolder, category);
        if (!fs.statSync(categoryPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(categoryPath, file);
            const { default: command } = await import(`file://${filePath}`);

            if (command && 'data' in command && 'execute' in command) {
                // Map the command name directly into the Client global collection mapping
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command file at ${filePath} is missing "data" or "execute".`);
            }
        }
    }
    console.log(`⚙️ Command Handler: Successfully registered all execution targets into local memory.`);
};