import Listener, {ListenerType} from "../../lib/interfaces/Listener";
import {Client, Events} from "discord.js";
import logger from "../../logger";
import TwineChannelManager from "../../lib/managers/TwineChannelManager";
import PanelManager from "../../lib/managers/PanelManager";

export default class ReadyListener implements Listener<Events.ClientReady> {
    type = ListenerType.ONCE;

    event = Events.ClientReady;

    async execute(client: Client): Promise<void> {
        logger.info(`Discord client logged in as '${client.user.tag}'`);

        TwineChannelManager.loadChannels(client).catch(e => logger.error(e));
        PanelManager.loadPanels(client).catch(e => logger.error(e));
    }

}
