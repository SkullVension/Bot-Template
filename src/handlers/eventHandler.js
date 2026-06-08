import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client) => {
    const eventsFolder = path.join(__dirname, '..', 'events');
    if (!fs.existsSync(eventsFolder)) return;

    const eventFiles = fs.readdirSync(eventsFolder).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsFolder, file);
        const { default: event } = await import(`file://${filePath}`);

        if (event && 'name' in event && 'execute' in event) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }
    }
    console.log(`⚙️ Event Handler: Successfully attached system event listeners to Gateway runtime.`);
};