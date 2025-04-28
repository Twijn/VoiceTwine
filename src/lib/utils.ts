import ManagedChannel from "./objects/ManagedChannel";
import PanelManager from "./managers/PanelManager";
import {GuildMember, VideoQualityMode} from "discord.js";
import TwineChannelManager from "./managers/TwineChannelManager";
import {DiscordChannelStatus, DiscordChannelType} from "./sequelize/models/discordchannel.model";
import logger from "../logger";

export const BLANK_FIELD =
    {
        name: " ",
        value: " ",
        inline: true,
    };

export const getChannelFromPanel = (messageId: string, executorId: string = null): ManagedChannel => {
    const panel = PanelManager.getPanel(messageId);

    if (!panel) {
        throw new Error("Unable to get voice channel from this panel!");
    }

    const channel = panel.getOperatingChannel();

    if (!channel || (
            executorId &&
            channel.database.ownerId !== executorId
        )) {
        throw new Error(`Only the owner can edit the channel ${channel?.url ?? "unknown channel"}!`);
    }

    return channel;
}

export const getChannelFromMember = (member: GuildMember, executorId: string = null): ManagedChannel => {
    if (!member?.voice?.channelId) {
        throw new Error("You aren't in a voice channel!");
    }

    const channel = TwineChannelManager.getChannel(member.voice.channelId);

    if (!channel || channel.type !== DiscordChannelType.CHILD_CHANNEL) {
        throw new Error("The channel you're in isn't a VoiceTwine managed child channel!");
    }

    if (executorId && channel.database.ownerId !== executorId) {
        throw new Error(`Only the owner can edit the channel ${channel.url}!`);
    }

    return channel;
}

export const getChannelFromPanelOrMember = (messageId: string, member: GuildMember, executorId?: string): ManagedChannel => {
    if (!executorId) {
        console.log(member);
        executorId = member.id;
    }
    try {
        return getChannelFromPanel(messageId, executorId);
    } catch (error) {
        logger.debug(`Error retrieving channel from panel or member: ${error}`);
        return getChannelFromMember(member, executorId);
    }
}

export const formatVideoQuality = (quality: VideoQualityMode): string => {
    switch (quality) {
        case VideoQualityMode.Full:
            return "720p";
        default:
            return "Auto";
    }
}

export const getMaxBitrate = (premiumTier: number): number => {
    switch (premiumTier) {
        case 3: // Level 3 (14+ boosts)
            return 384;
        case 2: // Level 2 (7+ boosts)
            return 256;
        case 1: // Level 1 (2+ boosts)
            return 128;
        default: // Level 0 (no boosts)
            return 96;
    }
}

export const formatStatus = (status: DiscordChannelStatus): string => {
    switch (status) {
        case DiscordChannelStatus.PUBLIC:
            return "🌐 Public";
        case DiscordChannelStatus.PRIVATE:
            return "🔒 Private";
        case DiscordChannelStatus.HIDDEN:
            return "👥 Hidden";
    }
}
