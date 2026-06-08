import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove-warn')
        .setDescription('Expunges an active warning record matching a specific Case Reference ID code.')
        .addUserOption(option => option.setName('target').setDescription('The user who holds the target infraction.').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('The unique Case Reference ID string (e.g., W-123456).').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('target');
        const targetId = interaction.options.getString('id').toUpperCase();

        if (!client.infractionDatabase || !client.infractionDatabase.has(targetUser.id)) {
            return await interaction.reply({ content: '⚠️ Profile Error: No warning logs are registered to this user account.', ephemeral: true });
        }

        const warnings = client.infractionDatabase.get(targetUser.id);
        const initialCount = warnings.length;

        // Filter out the specific case matching the user-provided ID
        const filteredWarnings = warnings.filter(warn => warn.id !== targetId);

        if (filteredWarnings.length === initialCount) {
            return await interaction.reply({ content: `⚠️ Validation Error: Case ID reference \`${targetId}\` was not discovered on this user profile.`, ephemeral: true });
        }

        // Commit updated array modifications back to your map database
        client.infractionDatabase.set(targetUser.id, filteredWarnings);

        const successEmbed = new EmbedBuilder()
            .setTitle('✨ Infraction Log Cleared')
            .setColor(0x2ecc71) // Systems normal emerald green hex
            .setDescription(`Successfully expunged record case key \`${targetId}\` from the historical logs of profile ${targetUser}.`);

        await interaction.reply({ embeds: [successEmbed] });
    },
};