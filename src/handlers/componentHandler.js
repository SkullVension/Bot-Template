import { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client) => {
    // Add custom component collection matrices directly into client instance
    client.buttons = new Collection();
    client.selectMenus = new Collection();

    const componentsFolder = path.join(__dirname, '..', 'components');
    if (!fs.existsSync(componentsFolder)) return;

    // Load Buttons
    const buttonsPath = path.join(componentsFolder, 'buttons');
    if (fs.existsSync(buttonsPath)) {
        const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
        for (const file of buttonFiles) {
            const { default: button } = await import(`file://${path.join(buttonsPath, file)}`);
            if (button && 'customId' in button && 'execute' in button) {
                client.buttons.set(button.customId, button);
            }
        }
    }

    // Load Select Menus
    const menusPath = path.join(componentsFolder, 'selectMenus');
    if (fs.existsSync(menusPath)) {
        const menuFiles = fs.readdirSync(menusPath).filter(file => file.endsWith('.js'));
        for (const file of menuFiles) {
            const { default: menu } = await import(`file://${path.join(menusPath, file)}`);
            if (menu && 'customId' in menu && 'execute' in menu) {
                client.selectMenus.set(menu.customId, menu);
            }
        }
    }
    console.log(`⚙️ Component Handler: Mounted UI interactive assets successfully into the routing pipeline.`);
};