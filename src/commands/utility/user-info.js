import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Retrieves profile metrics and system metadata for a target user profile.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user profile to analyze.')
                .setRequired(false)),

    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const rolesList = targetMember 
            ? targetMember.roles.cache.filter(role => role.id !== interaction.guild.roles.everyone.id).map(r => r.toString()).join(' ') 
            : '`Not a current member of this server instance.`';

        const infoEmbed = new EmbedBuilder()
            .setTitle(`👤 Identity Report: ${targetUser.username}`)
            .setColor(0x2b2d31)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields([
                { name: '🏷️ Global Username', value: `\`${targetUser.tag}\``, inline: true },
                { name: '🆔 User Fingerprint ID', value: `\`${targetUser.id}\``, inline: true },
                { name: '🤖 Bot Verification State', value: targetUser.bot ? '`Verified Application Account`' : '`Standard Human Profile`', inline: true },
                { name: '📅 Identity Initialization Date', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>)`, inline: false }
            ])
            .setTimestamp()
            .setFooter({ text: 'Profile Analytics Matrix' });

        if (targetMember) {
            infoEmbed.addFields([
                { name: '📥 Server Ingress Date', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:F>\n(<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>)`, inline: false },
                { name: '📊 Hierarchy Roles Managed', value: rolesList || '`No elevated authorization roles assigned.`', inline: false }
            ]);
        }

        await interaction.reply({ embeds: [infoEmbed] });
    },
};