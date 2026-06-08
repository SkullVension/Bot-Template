import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Appends a formal disciplinary infraction warning to a member profile.')
        .addUserOption(option => option.setName('target').setDescription('The user to warn.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The cause or reason for this warning entry.').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        if (targetUser.id === interaction.user.id) {
            return await interaction.reply({ content: '⚠️ Profile Error: You cannot issue an infraction entry to yourself.', ephemeral: true });
        }
        if (targetUser.bot) {
            return await interaction.reply({ content: '⚠️ Action Aborted: Application/Bot profile identities cannot hold warning states.', ephemeral: true });
        }

        // Initialize the in-memory warns collection map if it doesn't exist yet on the engine
        if (!client.infractionDatabase) {
            client.infractionDatabase = new Map();
        }

        // Fetch existing arrays or instantiate a fresh tracking array bucket
        if (!client.infractionDatabase.has(targetUser.id)) {
            client.infractionDatabase.set(targetUser.id, []);
        }

        const userWarnings = client.infractionDatabase.get(targetUser.id);
        const warningId = `W-${Date.now().toString().slice(-6)}`; // Unique quick reference tag code

        const warningPayload = {
            id: warningId,
            moderatorId: interaction.user.id,
            moderatorTag: interaction.user.tag,
            reason: reason,
            timestamp: Math.floor(Date.now() / 1000)
        };

        userWarnings.push(warningPayload);

        const warnEmbed = new EmbedBuilder()
            .setTitle('⚠️ Disciplinary Warning Appended')
            .setColor(0xffa500)
            .setDescription(`**Target Member:** ${targetUser} (\`${targetUser.id}\`)\n**Issuing Operator:** ${interaction.user}\n**Case Reference ID:** \`${warningId}\``)
            .addFields([{ name: '📋 Stated Infraction Reason', value: `\`\`\text\n${reason}\n\`\`\`` }])
            .setTimestamp();

        await interaction.reply({ embeds: [warnEmbed] });
    },
};