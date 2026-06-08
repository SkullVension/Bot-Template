import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Deploys the persistent interactive ticket generation panel.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // Ensures only server admins can drop the panel

    async execute(interaction, client) {
        // Acknowledge the setup caller instantly while the bot compiles the assets
        await interaction.reply({ content: '⏳ Deploying system support interaction panel...', ephemeral: true });

        // 🎨 Construct High-End Support Hub Panel Embed Interface
        const panelEmbed = new EmbedBuilder()
            .setTitle('🎟️ Helpdesk Support & System Clearance Hub')
            .setColor(0x2b2d31) // Sleek minimalist dark theme slate hex
            .setDescription(
                'Welcome to the server administration support interface. Select the exact department matching your current inquiry from the dropdown selection menu below to launch an encrypted communication lane.\n\n' +
                '**📁 Department Options:**\n' +
                '• 💼 **Staff Application:** Submit a clearance profile to join the executive team.\n' +
                '• 💬 **General Support:** General technical support diagnostics or inquiries.\n' +
                '• ⚠️ **Report Someone:** File an infraction record against a user with proof.\n' +
                '• ⚙️ **Other Inquiries:** Miscellaneous administrative routing.'
            )
            .addFields([
                { name: '⏰ Operational Hours', value: '`24/7 Continuous Automated Response`', inline: true },
                { name: '🛡️ Data Preservation', value: '`Transcripts are auto-logged upon channel closure`', inline: true }
            ])
            .setFooter({ text: 'System Ticket Routing Core • Powered by SkullVension' });

        // 🎛️ Construct the 4-Tier Interactive Dropdown Menu Structure
        const menuDropdown = new StringSelectMenuBuilder()
            .setCustomId('ticket_creation_menu') // CRITICAL: This directly triggers your ticketDropdown.js handler!
            .setPlaceholder('Select a department category...')
            .addOptions([
                {
                    label: 'Staff Application',
                    description: 'Submit an application to join the team.',
                    value: 'ticket_staff_apply',
                    emoji: '💼',
                },
                {
                    label: 'General Support',
                    description: 'Open a general server assistance workspace.',
                    value: 'ticket_gen_support',
                    emoji: '💬',
                },
                {
                    label: 'Report Someone',
                    description: 'Report a user infraction with evidence.',
                    value: 'ticket_report_user',
                    emoji: '⚠️',
                },
                {
                    label: 'Other Inquiries',
                    description: 'For all inquiries that don\'t fit elsewhere.',
                    value: 'ticket_other',
                    emoji: '⚙',
                },
            ]);

        // Action rows are required components to hold select menus safely
        const actionRow = new ActionRowBuilder().addComponents(menuDropdown);

        try {
            // Drop the persistent panel live into the current active channel viewport
            await interaction.channel.send({
                embeds: [panelEmbed],
                components: [actionRow]
            });

            // Update original interaction status to confirm clean execution delivery
            await interaction.editReply({ content: '✅ Interactive support hub panel has been successfully initialized and deployed.' });
        } catch (error) {
            console.error('❌ Failed to drop persistent support panel text frame:', error);
            await interaction.editReply({ content: '⚠️ Failed to deploy panel frame asset. Verify internal text channel permissions.' });
        }
    },
};