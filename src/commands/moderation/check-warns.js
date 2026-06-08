import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('check-warns')
        .setDescription('Queries and displays active server infraction entries registered to a profile.')
        .addUserOption(option => option.setName('target').setDescription('The profile to audit.').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('target');
        
        const noRecordsEmbed = new EmbedBuilder()
            .setTitle(`📋 Infraction Log: ${targetUser.username}`)
            .setColor(0x2b2d31)
            .setDescription(`✅ Clean Status: No active infraction warnings match this profile ID inside local memory.`);

        if (!client.infractionDatabase || !client.infractionDatabase.has(targetUser.id)) {
            return await interaction.reply({ embeds: [noRecordsEmbed] });
        }

        const warnings = client.infractionDatabase.get(targetUser.id);
        if (warnings.length === 0) {
            return await interaction.reply({ embeds: [noRecordsEmbed] });
        }

        const logEmbed = new EmbedBuilder()
            .setTitle(`📋 Active Infraction Profile: ${targetUser.username}`)
            .setColor(0xffa500)
            .setFooter({ text: `Total Tracked Active Incidents: ${warnings.length}` });

        let logContent = '';
        for (const warn of warnings) {
            logContent += `**ID:** \`${warn.id}\` | **Mod:** <@${warn.moderatorId}>\n**Reason:** ${warn.reason} — <t:${warn.timestamp}:R>\n\n`;
        }

        logEmbed.setDescription(logContent);
        await interaction.reply({ embeds: [logEmbed] });
    },
};