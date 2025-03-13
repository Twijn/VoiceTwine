import Listener, {ListenerType} from "./Listener";
import {Client, Events} from "discord.js";
import logger from "../../logger";

export default class ReadyListener implements Listener<Events.ClientReady> {
    type = ListenerType.ONCE;

    event = Events.ClientReady;

    async execute(client: Client): Promise<void> {
        logger.info(`Discord client logged in as '${client.user.tag}'`);
    }

}
