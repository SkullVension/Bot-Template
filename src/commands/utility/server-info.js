import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Compiles total infrastructure database details and system metrics for this guild.'),

    async execute(interaction, client) {
        const guild = interaction.guild;
        
        // Fetch fresh member statistics counts from API gateway cache
        const totalMembers = guild.memberCount;
        const totalChannels = guild.channels.cache.size;
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categoryCount = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        const serverEmbed = new EmbedBuilder()
            .setTitle(`🏰 Infrastructure Metrics: ${guild.name}`)
            .setColor(0x2b2d31)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields([
                { name: '🆔 Guild Network ID', value: `\`${guild.id}\``, inline: true },
                { name: '👑 Master Instance Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Creation Operational Date', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                { name: '👥 Connected User Population', value: `\`${totalMembers}\` Active Profiles`, inline: true },
                { name: '💎 Premium Matrix Level', value: `Tier \`${guild.premiumTier}\` (${guild.premiumSubscriptionCount} Boosts)`, inline: true },
                { 
                    name: '📁 Allocated Channel Routing Categories', 
                    value: `Total: \`${totalChannels}\` Channels\n💬 Text: \`${textChannels}\` | 🔊 Voice: \`${voiceChannels}\` | 📂 Categories: \`${categoryCount}\``, 
                    inline: false 
                }
            ])
            .setTimestamp()
            .setFooter({ text: 'Guild Infrastructure Sweep Complete' });

        await interaction.reply({ embeds: [serverEmbed] });
    },
};