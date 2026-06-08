import { Events, AuditLogEvent, EmbedBuilder } from 'discord.js';

export default {
    name: Events.GuildAuditLogEntryCreate,
    async execute(auditLogEntry, guild, client) {
        const { action, executorId, targetId, reason } = auditLogEntry;
        const logChannelId = process.env.MOD_LOG_CHANNEL_ID;
        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        // Skip bot self-actions to prevent duplicated logging statements
        if (executorId === client.user.id) return;

        let actionTitle = '';
        let actionColor = 0x2b2d31; // Default dark theme hex
        let actionDetails = '';

        // Safely fetch target and executor user objects from memory or API cache
        const executor = await client.users.fetch(executorId).catch(() => null);
        const target = await client.users.fetch(targetId).catch(() => null);

        // Filter and capture administrative events
        switch (action) {
            case AuditLogEvent.MemberBanAdd:
                actionTitle = '🚫 Native Server Ban Appended';
                actionColor = 0xff4f4f; // Vivid Neon Red
                actionDetails = `**Target Member:** ${target ? `${target.tag} (\`${target.id}\`)` : `\`${targetId}\``}\n**Executor Admin:** ${executor ? `<@${executor.id}>` : `\`${executorId}\``}`;
                break;

            case AuditLogEvent.MemberKick:
                actionTitle = '👢 Native Server Member Kicked';
                actionColor = 0xffa500; // Warning Amber Orange
                actionDetails = `**Target Member:** ${target ? `${target.tag} (\`${target.id}\`)` : `\`${targetId}\``}\n**Executor Admin:** ${executor ? `<@${executor.id}>` : `\`${executorId}\``}`;
                break;

            case AuditLogEvent.MemberUpdate:
                // Isolate timed-out attributes inside general structural member edits
                const timeoutChange = auditLogEntry.changes.find(c => c.key === 'communication_disabled_until');
                if (!timeoutChange) return; // Exit early if it wasn't a timeout adjustment

                if (timeoutChange.new) {
                    actionTitle = '⏳ Native Server Timeout Applied';
                    actionColor = 0x5dade2; // Neon Light Ice Blue
                    const expirationDate = new Date(timeoutChange.new);
                    actionDetails = `**Target Member:** ${target ? `${target.tag} (\`${target.id}\`)` : `\`${targetId}\``}\n**Executor Admin:** ${executor ? `<@${executor.id}>` : `\`${executorId}\``}\n**Duration Expiration:** <t:${Math.floor(expirationDate.getTime() / 1000)}:F>`;
                } else {
                    actionTitle = '🔊 Native Server Timeout Revoked';
                    actionColor = 0x2ecc71; // Systems Normal Emerald Green
                    actionDetails = `**Target Member:** ${target ? `${target.tag} (\`${target.id}\`)` : `\`${targetId}\``}\n**Executor Admin:** ${executor ? `<@${executor.id}>` : `\`${executorId}\``}`;
                }
                break;

            default:
                return; // Ignore all other non-moderation related audit data entries
        }

        // Construct high-end system embed reporting payload
        const logEmbed = new EmbedBuilder()
            .setTitle(actionTitle)
            .setColor(actionColor)
            .setDescription(`${actionDetails}\n**Stated Reason:** ${reason || '`No reason declared via native UI interface.`'}`)
            .setTimestamp()
            .setFooter({ text: 'System UI Audit Intercept Engine' });

        await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
    },
};