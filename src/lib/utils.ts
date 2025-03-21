import ManagedChannel from "./objects/ManagedChannel";
import PanelManager from "./managers/PanelManager";
import {GuildMember} from "discord.js";
import TwineChannelManager from "./managers/TwineChannelManager";
import {DiscordChannelType} from "./sequelize/models/discordchannel.model";

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
        throw new Error(`Only the owner can edit the channel \`${channel?.name ?? "unknown channel"}\`!`);
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
        throw new Error(`Only the owner can edit the channel \`${channel?.name}\`!`);
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
        return getChannelFromMember(member, executorId);
    }
}
