import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk deletes a specified block of messages from the current channel workspace.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('The number of messages to clear (1-100).')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    async execute(interaction, client) {
        const amount = interaction.options.getInteger('amount');
        const channel = interaction.channel;

        // Defer interaction instantly so the API processing doesn't lag out the user interface
        await interaction.deferReply({ ephemeral: true });

        try {
            // Bulk delete messages using native API execution
            const purgedMessages = await channel.bulkDelete(amount, true);

            const successEmbed = new EmbedBuilder()
                .setTitle('🧹 Channel Sweep Executed')
                .setColor(0x2b2d31) // Minimal dark theme visual hex
                .setDescription(`Successfully scrubbed \`${purgedMessages.size}\` message entries from this channel timeline.`);

            await interaction.editReply({ embeds: [successEmbed] });

            // If some target messages were missed because they are older than 14 days, append a brief note
            if (purgedMessages.size < amount) {
                await interaction.followUp({
                    content: '⚠️ *Note: Some message entries older than 14 days could not be cleared due to native Discord core architecture restrictions.*',
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('❌ Channel clear procedure encountered bulk execution failure:', error);
            await interaction.editReply({
                content: '⚠️ Failed to execute bulk clear routine. Ensure the application possesses full Manage Messages authorization levels.'
            });
        }
    },
};