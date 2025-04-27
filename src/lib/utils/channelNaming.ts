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
    let channelName = `${member.displayName}'s Channel`;
    
    // If there's a naming scheme, use it
    if (masterChannel.database.namingScheme) {
        // Get channel count for this master channel
        const childCount = await DiscordChannel.count({
            where: {
                masterChannelId: masterChannel.id,
                type: DiscordChannelType.CHILD_CHANNEL
            }
        });
        
        // Replace %N with the channel count + 1
        channelName = masterChannel.database.namingScheme.replace('%N', (childCount + 1).toString());
    }
    
    // Discord has a 100 character limit for channel names, but we'll use 30 to be safe
    return channelName.substring(0, 30);
}
