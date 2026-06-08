import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Appends a communication mute restriction to a member profile.')
        .addUserOption(option => option.setName('target').setDescription('The user to restrict.').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Duration interval for restriction.').setRequired(true)
            .addChoices(
                { name: '60 Seconds', value: 60 },
                { name: '5 Minutes', value: 300 },
                { name: '10 Minutes', value: 600 },
                { name: '1 Hour', value: 3600 },
                { name: '1 Day', value: 86400 },
                { name: '1 Week', value: 604800 }
            ))
        .addStringOption(option => option.setName('reason').setDescription('Reason for restriction.').setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No formal reason provided.';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return await interaction.reply({ content: '⚠️ Target profile could not be resolved within active server cache matrices.', ephemeral: true });
        }

        if (targetUser.id === interaction.user.id) {
            return await interaction.reply({ content: '⚠️ You cannot restrict your own identity profile.', ephemeral: true });
        }

        if (!member.moderatable) {
            return await interaction.reply({ content: '⚠️ Action aborted: Target profile possesses superior hierarchy clearance levels.', ephemeral: true });
        }

        // Direct API Execution (Calculates milliseconds)
        await member.timeout(duration * 1000, `Executed by ${interaction.user.tag}: ${reason}`);

        const confirmEmbed = new EmbedBuilder()
            .setTitle('⏳ Communication Restriction Applied')
            .setColor(0x5dade2)
            .setDescription(`**Target:** ${targetUser.tag} (\`${targetUser.id}\`)\n**Authorized Administrator:** ${interaction.user}\n**Duration Interval:** \`${duration}\` Seconds\n**Stated Reason:** \`${reason}\``)
            .setTimestamp();

        await interaction.reply({ embeds: [confirmEmbed] });
    },
};