import { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    customId: 'ticket_creation_menu', // Matches the customId on your setup panel dropdown configuration

    async execute(interaction, client) {
        // Defer interaction immediately to prevent Gateway timeout lag screens
        await interaction.deferReply({ ephemeral: true });

        const selectedOption = interaction.values[0];
        const guild = interaction.guild;
        const user = interaction.user;

        // Resolve environment targets safely from runtime environment variable configurations
        const staffRoleId = process.env.STAFF_ROLE_ID;
        const categoryId = process.env.TICKET_CATEGORY_ID;

        // Map selection identifiers to clean visual channel prefixes and embed descriptions
        let ticketTypeLabel = '';
        let welcomeMessage = '';

        switch (selectedOption) {
            case 'ticket_staff_apply':
                ticketTypeLabel = 'apply';
                welcomeMessage = `Thank you for submitting a staff application profile, <@${user.id}>. Our executive leadership clearance team will review your account metrics shortly.\n\n**Please state your application layout details below.**`;
                break;
            case 'ticket_gen_support':
                ticketTypeLabel = 'support';
                welcomeMessage = `Greetings <@${user.id}>, welcome to general technical support diagnostics. Describe your issue or infrastructure inquiry in detail below.`;
                break;
            case 'ticket_report_user':
                ticketTypeLabel = 'report';
                welcomeMessage = `Attention Staff Alert: <@${user.id}> has initiated a user infraction report matrix. Provide user identification IDs, server evidence links, or video captures below.`;
                break;
            case 'ticket_other':
                ticketTypeLabel = 'other';
                welcomeMessage = `Hello <@${user.id}>, you have opened a general query ticket. State your specific target inquiry and an authorized agent will assist shortly.`;
                break;
            default:
                return await interaction.editReply({ content: '⚠️ Critical: Received unknown configuration parameter option.' });
        }

        try {
            // 🔨 Core Security Permissions Matrix Configuration
            const permissionOverwrites = [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel] // Block public community visibility
                },
                {
                    id: user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ] // Grant full access permissions directly to the target caller
                }
            ];

            // If a specific Staff Role ID is defined, append it explicitly to the permissions mapping array
            if (staffRoleId) {
                permissionOverwrites.push({
                    id: staffRoleId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                });
            }

            // 📂 Instantiation: Generate the private text communication channel inside Discord
            const ticketChannel = await guild.channels.create({
                name: `${ticketTypeLabel}-${user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId || null, // Place inside target category housing fold if configured
                topic: `Ticket Instance Owner ID: ${user.id} | System Allocation`, // Essential anchor for the transcript logger engine!
                permissionOverwrites: permissionOverwrites
            });

            // 🎨 Construct High-End Control Panel Embed Interface
            const controlEmbed = new EmbedBuilder()
                .setTitle(`🎟️ Support Workspace Assigned`)
                .setColor(0x2b2d31) // Minimal dark theme visual hex
                .setDescription(welcomeMessage)
                .addFields([
                    { name: '👤 Operational Identity', value: `<@${user.id}> (\`${user.id}\`)`, inline: true },
                    { name: '⚙️ Workspace Category', value: `\`${ticketTypeLabel.toUpperCase()}\``, inline: true }
                ])
                .setTimestamp()
                .setFooter({ text: 'System Ticket Controller Runtime Core' });

            // Build the red interactive button to handle channel destruction routines
            const closeButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket_btn') // Triggers the button code we just wrote!
                    .setLabel('Close Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            // Send notification ping alert payload to target channels to alert both groups
            const staffPingString = staffRoleId ? `<@&${staffRoleId}>` : '';
            await ticketChannel.send({
                content: `${user} ${staffPingString}`,
                embeds: [controlEmbed],
                components: [closeButtonRow]
            });

            // Confirm creation status cleanly back to the selecting user's viewport safely
            await interaction.editReply({
                content: `✅ Your private operational channel has been successfully generated here: <#${ticketChannel.id}>`,
            });

        } catch (error) {
            console.error('❌ Ticket creation loop encountered fatal API response failure:', error);
            await interaction.editReply({
                content: '⚠️ Failed to securely instantiate your ticket channel asset workspace. Verify application configuration permissions.',
            });
        }
    }
};