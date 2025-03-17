import {Events, VoiceState} from "discord.js";

import Listener from "../../../lib/interfaces/Listener";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";
import {DiscordChannelType} from "../../../lib/sequelize/models/discordchannel.model";

export default class VoiceListener implements Listener<Events.VoiceStateUpdate> {

    event = Events.VoiceStateUpdate;

    async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        const newChannel = TwineChannelManager.getChannel(newState.channelId);

        if (newChannel && newChannel.database.type === DiscordChannelType.MASTER_CHANNEL) {
            const childChannel = await TwineChannelManager.createChild(newChannel, newState.member);

            await newState.setChannel(childChannel.discord.id);
        }

        const oldChannel = TwineChannelManager.getChannel(oldState.channelId);

        if (oldChannel && oldChannel.database.type === DiscordChannelType.CHILD_CHANNEL &&
            oldChannel.discord.members.size <= 1) {
            await TwineChannelManager.deleteChannel(oldChannel.database.id);
        }
    }

}
