import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Displays system architecture information and core developer credentials.'),

    async execute(interaction, client) {
        // Construct elite, clean system configuration data layout profile
        const aboutEmbed = new EmbedBuilder()
            .setTitle('⚙️ System Identity Core Matrix')
            .setColor(0x2b2d31) // Sleek dark theme slate hex
            .setDescription('An optimized, enterprise-ready modular utility and moderation automation framework built entirely on a zero-dependency vanilla script architecture stack.')
            .addFields([
                { name: '💻 Architecture Code base', value: '`Vanilla JavaScript ES Module Stack`', inline: true },
                { name: '📡 Gateway Wrapper API', value: '`Discord.js v14.18.0 Runtime`', inline: true },
                { name: '🔒 Security Engine', value: '`Node.js Native Watch Handler`', inline: true },
                { name: '🛠️ Builder Attribution', value: 'Framework architecture engineered and authorized by **Vihan Mishra [2026]**.', inline: false },
                { name: '📂 Upstream Repository Source', value: '`https://github.com/skullvension/Bot-Template` \n*(All open-source derivatives must preserve original attribution notices)*', inline: false }
            ])
            .setTimestamp()
            .setFooter({ text: 'System Diagnostics Shell UI v1.0.0' });

        await interaction.reply({ embeds: [aboutEmbed] });
    },
};