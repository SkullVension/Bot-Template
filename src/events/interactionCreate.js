import { Events, InteractionType } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // 1. ROUTE SLASH COMMANDS
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Runtime execution failure within command [ ${interaction.commandName} ]:`, error);
                const errorMessage = { content: '⚠️ An internal architectural error occurred while executing this application directive.', ephemeral: true };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }

        // 2. ROUTE COMPONENT SELECTION DROPDOWNS (e.g., Ticket Category Selection Menu)
        else if (interaction.isStringSelectMenu()) {
            const menu = client.selectMenus.get(interaction.customId);
            if (!menu) return;

            try {
                await menu.execute(interaction, client);
            } catch (error) {
                console.error(`Runtime failure within select menu component [ ${interaction.customId} ]:`, error);
            }
        }

        // 3. ROUTE INTERACTIVE COMPONENT BUTTON CLICKS (e.g., Ticket Close Button Action)
        else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);
            if (!button) return;

            try {
                await button.execute(interaction, client);
            } catch (error) {
                console.error(`Runtime failure within interactive button component [ ${interaction.customId} ]:`, error);
            }
        }
        
        // 4. ROUTE MODAL POP-UP WINDOW SUBMISSIONS (e.g., Ticket Close Reason Entry)
        else if (interaction.type === InteractionType.ModalSubmit) {
            // Modals can be handled inline or passed to dedicated handlers via dynamic IDs
            const modalId = interaction.customId;
            if (modalId.startsWith('ticket_close_modal_')) {
                const handler = client.buttons.get('close_ticket_btn');
                if (handler && 'handleModal' in handler) {
                    await handler.handleModal(interaction, client);
                }
            }
        }
    },
};