import {DMChannel, Events, NonThreadGuildBasedChannel} from "discord.js";

import Listener from "../../../lib/interfaces/Listener";
import logger from "../../../logger";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";
import PanelManager from "../../../lib/managers/PanelManager";

export default class ChannelDeleteListener implements Listener<Events.ChannelDelete> {

    event = Events.ChannelDelete;

    async execute(discordChannel: DMChannel | NonThreadGuildBasedChannel): Promise<void> {
        if (discordChannel.isDMBased()) return;

        const panels = PanelManager.getPanelsForChannel(discordChannel.id);
        for (const [,panel] of panels) {
            await panel.delete().catch(e => logger.error(e));
        }

        TwineChannelManager.deleteChannel(discordChannel.id).then(channel => {
            if (channel) {
                logger.info(`Channel '${channel.name}' of type '${channel.database.type}' was deleted`);
            }
        }, error => {
            logger.error(`Error deleting channel ${discordChannel.name}: ${error}`);
        });
    }

}
