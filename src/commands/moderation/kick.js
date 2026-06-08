import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a target member out of the server network.')
        .addUserOption(option => option.setName('target').setDescription('The user to kick.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the kick execution.').setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No formal reason provided.';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return await interaction.reply({ content: '⚠️ Target profile could not be resolved within active server cache matrices.', ephemeral: true });
        }

        if (targetUser.id === interaction.user.id) {
            return await interaction.reply({ content: '⚠️ You cannot execute an administrative kick action against your own profile.', ephemeral: true });
        }

        if (!member.kickable) {
            return await interaction.reply({ content: '⚠️ Action aborted: Target profile possesses superior hierarchy clearance levels.', ephemeral: true });
        }

        // Direct API Execution
        await member.kick(`Executed by ${interaction.user.tag}: ${reason}`);

        const confirmEmbed = new EmbedBuilder()
            .setTitle('👢 Server Member Kicked')
            .setColor(0xffa500)
            .setDescription(`**Target:** ${targetUser.tag} (\`${targetUser.id}\`)\n**Authorized Administrator:** ${interaction.user}\n**Stated Reason:** \`${reason}\``)
            .setTimestamp();

        await interaction.reply({ embeds: [confirmEmbed] });
    },
};