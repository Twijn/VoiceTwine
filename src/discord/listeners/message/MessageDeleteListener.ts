import {Events, Message, PartialMessage} from "discord.js";

import Listener from "../../../lib/interfaces/Listener";
import PanelManager from "../../../lib/managers/PanelManager";

export default class MessageDeleteListener implements Listener<Events.MessageDelete> {

    event = Events.MessageDelete;

    async execute(message: Message|PartialMessage): Promise<void> {
        await PanelManager.deletePanel(message.id);
    }

}
