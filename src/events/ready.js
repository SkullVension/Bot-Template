import { Events, ActivityType } from 'discord.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`
===========================================================================
    ____  ____  ______   __________  ___  __    ___  __________  ____
   / __ )/ __ \\/_  __/  /_  __/ ____/  |/  /   /   |/_  __/ __ \\/ __ \\
  / __  / / / / / /      / / / /   / /|_/ /   / /| | / / / /_/ / /_/ /
 / /_/ / /_/ / / /      / / / /___/ /  / /   / ___ |/ / / ____/ _, _/ 
/_____/\\____/ /_/      /_/ \\____/_/  /_/   /_/  |_/_/ /_/   /_/ |_|  
                                                                     
 Core Infrastructure Designed & Engineered By Skull Vension [2026]
 Powered by Vanilla JS Stack & Discord.js v14 Gateway Shell Engine
===========================================================================
        `);

        console.log(`📡 Gateway Online: Connected securely as application identity [ ${client.user.tag} ]`);

        client.user.setPresence({
            activities: [{ name: 'System Clearance /help', type: ActivityType.Watching }],
            status: 'dnd',
        });
    },
};