import {DMChannel, Events, NonThreadGuildBasedChannel} from "discord.js";

import logger from "../../../logger";

import {DiscordChannelType} from "../../../lib/sequelize/models/discordchannel.model";

import TwineChannelManager from "../../../lib/managers/TwineChannelManager";
import PanelManager from "../../../lib/managers/PanelManager";
import Listener from "../../../lib/interfaces/Listener";

export default class ChannelUpdateListener implements Listener<Events.ChannelUpdate> {

    event = Events.ChannelUpdate;

    async execute(oldChannel: DMChannel | NonThreadGuildBasedChannel, newChannel: DMChannel | NonThreadGuildBasedChannel): Promise<void> {
        if (newChannel.isDMBased()) return;

        const managedChannel = TwineChannelManager.getChannel(newChannel.id);
        if (managedChannel && managedChannel.type === DiscordChannelType.CHILD_CHANNEL) {
            const channelPanels = PanelManager.getPanelsForChannel(managedChannel.id);

            for (const [,panel] of channelPanels) {
                await panel.update().catch(e => logger.error(e));
            }
        }
    }

}
