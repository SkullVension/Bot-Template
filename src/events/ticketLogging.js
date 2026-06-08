import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

/**
 * Sweeps a channel's entire history, compiles a raw markdown/text transcript,
 * and flashes an archival log patch directly into the configured ticket logging system.
 * * @param {TextChannel} channel - The active ticket channel being audited.
 * @param {User} closer - The staff member executing the closure command sequence.
 * @param {string} reason - The validated reason given for archiving this instance.
 */
export async function archiveTicketTranscript(channel, closer, reason) {
    const logChannelId = process.env.TICKET_LOG_CHANNEL_ID;
    const logChannel = channel.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.log(`[WARNING] Ticket archive event aborted: Target log channel ID "${logChannelId}" not resolved inside server cache.`);
        return;
    }

    try {
        let allMessages = [];
        let lastId;

        // Dynamic scraping loop: Fetch all messages from the channel (handles limits above 100)
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;

            const fetched = await channel.messages.fetch(options);
            if (fetched.size === 0) break;

            allMessages.push(...fetched.values());
            lastId = fetched.lastKey();

            // Safety breaker to prevent infinite API hanging loops on unusually massive channels
            if (allMessages.length >= 1000) break;
        }

        // Chronologically reverse messages so logs read from oldest (top) to newest (bottom)
        allMessages.reverse();

        // Parse through ticket channel attributes to find the original ticket owner
        // (Typically stored in channel topic or matched via the user who opened the channel)
        const ticketOwnerId = channel.topic ? channel.topic.match(/\d{17,19}/)?.[0] : null;
        const ownerMention = ticketOwnerId ? `<@${ticketOwnerId}>` : '`Unknown Owner / User Left Server`';

        // 📝 Construct the raw transcript text document content
        let transcriptContent = `===========================================================================\n`;
        transcriptContent += `OFFICIAL TICKET SYSTEM SYSTEM ARCHIVE TRANSCRIPT\n`;
        transcriptContent += `===========================================================================\n`;
        transcriptContent += `Channel Label  : #${channel.name}\n`;
        transcriptContent += `Channel ID     : ${channel.id}\n`;
        transcriptContent += `Ticket Owner   : ${ticketOwnerId || 'Unknown'}\n`;
        transcriptContent += `Archived By    : ${closer.tag} (${closer.id})\n`;
        transcriptContent += `Closure Reason : ${reason}\n`;
        transcriptContent += `Timestamp Code : ${new Date().toISOString()}\n`;
        transcriptContent += `===========================================================================\n\n`;

        for (const msg of allMessages) {
            const timestamp = msg.createdAt.toISOString().replace('T', ' ').substring(0, 19);
            const authorTag = msg.author.tag;
            const authorId = msg.author.id;
            
            // Clean message body string blocks
            let content = msg.content || '[No Text Payload Content (Embed/File Asset Component)]';
            
            // Append attachment reference indicators inside text timeline if present
            if (msg.attachments.size > 0) {
                const urls = msg.attachments.map(a => a.url).join(', ');
                content += ` [SYSTEM ATTACHMENT REFERENCE: ${urls}]`;
            }

            transcriptContent += `[${timestamp}] [${authorId}] <${authorTag}>: ${content}\n`;
        }

        transcriptContent += `\n========================= END OF SYSTEM TRANSCRIPT =========================`;

        // Convert string buffer into an attachable file payload data buffer
        const buffer = Buffer.from(transcriptContent, 'utf-8');
        const fileAttachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.txt` });

        // Construct high-end cyber-modern archival analytics interface reporting embed
        const logEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Instance Archived & Logged')
            .setColor(0x2b2d31) // Deep slate gray aesthetic hex
            .setFields([
                { name: '🏷️ Ticket Identity', value: `\`#${channel.name}\`\nID: \`${channel.id}\``, inline: true },
                { name: '👤 Target Owner', value: ownerMention, inline: true },
                { name: '💼 Authorized Closer', value: `<@${closer.id}>\n\`${closer.tag}\``, inline: true },
                { name: '💬 Closure Reason', value: `\`\`\`text\n${reason}\n\`\`\`` }
            ])
            .setTimestamp()
            .setFooter({ text: 'System Ticket Logger Core Engine' });

        // Fire complete log payload to designated data logs channel channel
        await logChannel.send({ embeds: [logEmbed], files: [fileAttachment] });

    } catch (error) {
        console.error('❌ Critical system failure inside Ticket Transcript Archiver Engine:', error);
    }
}

// Default export wrapper to keep your event module framework parsing loop clean
export default {
    name: 'ticketLogging',
    execute() {
        // Internal placeholder initialization hook if tracking ongoing events is needed
    }
};