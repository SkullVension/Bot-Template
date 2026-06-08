import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField } from 'discord.js';
import { archiveTicketTranscript } from '../../events/ticketLogging.js';

export default {
    customId: 'close_ticket_btn', // Matches the ID on your panel button component
    
    /**
     * Executes when a user clicks the red "🔒 Close Ticket" button.
     */
    async execute(interaction, client) {
        const staffRoleId = process.env.STAFF_ROLE_ID;

        // 🛡️ Security Check: Ensure only users with Admin permissions or the Staff Role can proceed
        const isStaff = interaction.member.roles.cache.has(staffRoleId);
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isStaff && !isAdmin) {
            return await interaction.reply({
                content: '⚠️ Access Denied: Only authorized system staff clearance profiles can archive ticket channels.',
                ephemeral: true
            });
        }

        // 📝 Construct the Native Text Input Window Pop-up (Modal)
        const modal = new ModalBuilder()
            .setCustomId(`ticket_close_modal_${interaction.channel.id}`)
            .setTitle('Archive Ticket Matrix');

        const reasonInput = new TextInputBuilder()
            .setCustomId('ticket_close_reason')
            .setLabel('Reason for closure:')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Provide a formal description explaining the resolution or cause of ticket closure...')
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(500);

        // Action rows are required to house modal input components safely
        const actionRow = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(actionRow);

        // Flash the pop-up modal directly onto the staff member's viewport screen
        await interaction.showModal(modal);
    },

    /**
     * Executes when the staff member fills out the pop-up and hits "Submit".
     * Routed automatically via your interactionCreate.js script.
     */
    async handleModal(interaction, client) {
        // Acknowledge the modal immediately to prevent Discord from showing a "Thinking..." timeout error
        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.fields.getTextInputValue('ticket_close_reason');
        const channel = interaction.channel;

        try {
            // Send warning update message into the channel viewport right before destruction sequence
            await interaction.editReply({ content: '⏳ Compiling historical channel transcripts and initializing server cleanup...' });
            
            // 📝 Execute your background logging module to scrape, format, and save all messages
            await archiveTicketTranscript(channel, interaction.user, reason);

            // 💥 Delay deletion sequence by 3 seconds so the API safely commits the text history logs first
            setTimeout(async () => {
                await channel.delete().catch((err) => {
                    console.error(`[CRITICAL] Failed to delete ticket channel entry ${channel.id}:`, err);
                });
            }, 3000);

        } catch (error) {
            console.error('❌ System runtime failure inside Ticket Closure Modal Execution Context:', error);
            await interaction.followUp({
                content: '⚠️ Failed to securely archive and delete this channel workspace. Verify internal API permissions.',
                ephemeral: true
            });
        }
    }
};