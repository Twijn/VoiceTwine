import InteractionListener from "../interfaces/InteractionListener";

import ReplyManager, {TwineInteraction} from "../managers/ReplyManager";

import logger from "../../logger";

export default class InteractionHandler<T extends TwineInteraction> {

    private readonly listeners: InteractionListener<T>[] = [];

    constructor(listeners: InteractionListener<T>[]) {
        this.listeners = listeners;
    }

    async execute(interaction: T) {
        const replyManager = new ReplyManager<T>(interaction);
        for (const listener of this.listeners) {
            try {
                if (listener.matches(interaction)) {
                    await listener.execute(interaction, replyManager);
                }
            } catch(e) {
                logger.error(e);
                await replyManager.error("An error occurred while handling this interaction!").catch(e => logger.error(e));
            }
        }
    }

}