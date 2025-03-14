import {DMChannel, Events, NonThreadGuildBasedChannel} from "discord.js";

import Listener from "../Listener";
import logger from "../../../logger";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";

export default class ChannelDeleteListener implements Listener<Events.ChannelDelete> {

    event = Events.ChannelDelete;

    async execute(discordChannel: DMChannel | NonThreadGuildBasedChannel): Promise<void> {
        if (discordChannel.isDMBased()) return;

        TwineChannelManager.deleteChannel(discordChannel.id).then(channel => {
            if (channel) {
                logger.info(`Channel '${channel.discord.name}' of type '${channel.database.type}' was deleted`);
            }
        }, error => {
            logger.error(`Error deleting channel ${discordChannel.name}: ${error}`);
        });
    }

}
