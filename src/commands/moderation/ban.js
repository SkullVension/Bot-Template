import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a target member from the server infrastructure.')
        .addUserOption(option => option.setName('target').setDescription('The user to ban.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for the ban execution.').setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No formal reason provided.';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (targetUser.id === interaction.user.id) {
            return await interaction.reply({ content: '⚠️ You cannot execute an administrative ban action against your own profile.', ephemeral: true });
        }

        if (member && !member.bannable) {
            return await interaction.reply({ content: '⚠️ Action aborted: Target profile possesses superior hierarchy clearance levels.', ephemeral: true });
        }

        // Direct API Execution
        await interaction.guild.members.ban(targetUser.id, { reason: `Executed by ${interaction.user.tag}: ${reason}` });

        const confirmEmbed = new EmbedBuilder()
            .setTitle('🚫 Server Ban Imposed')
            .setColor(0xff4f4f)
            .setDescription(`**Target:** ${targetUser.tag} (\`${targetUser.id}\`)\n**Authorized Administrator:** ${interaction.user}\n**Stated Reason:** \`${reason}\``)
            .setTimestamp();

        await interaction.reply({ embeds: [confirmEmbed] });
    },
};