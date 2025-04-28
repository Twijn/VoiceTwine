import { DiscordChannel, DiscordChannelType } from "../sequelize/models/discordchannel.model";
import ManagedChannel from "../objects/ManagedChannel";
import { GuildMember } from "discord.js";

/**
 * Formats a channel name based on the naming scheme and channel count
 * @param masterChannel The master channel that contains the naming scheme
 * @param member The guild member creating the channel
 * @returns The formatted channel name
 */
export async function formatChannelName(masterChannel: ManagedChannel, member: GuildMember): Promise<string> {
    // Default channel name if no naming scheme is provided
    let channelName = masterChannel.database.namingScheme ?? `%M's Channel`;

    // If the scheme includes %N, replace it with the channel count + 1
    if (channelName.includes('%N')) {
        // Get channel count for this master channel
        const childCount = await DiscordChannel.count({
            where: {
                masterChannelId: masterChannel.id,
                type: DiscordChannelType.CHILD_CHANNEL
            }
        });

        // Replace %N with the channel count + 1
        channelName = channelName.replace('%N', (childCount + 1).toString());
    }

    // If the scheme includes %M, replace it with the guild member's display name'
    if (channelName.includes('%M')) {
        channelName = channelName.replace('%M', member.displayName);
    }
    
    // Discord has a 100 character limit for channel names, but we'll use 30 to be safe
    return channelName.substring(0, 30);
}
