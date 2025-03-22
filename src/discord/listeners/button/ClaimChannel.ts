import {ButtonInteraction} from "discord.js";

import {getChannelFromPanel} from "../../../lib/utils";

import ReplyManager from "../../../lib/managers/ReplyManager";
import InteractionListener from "../../../lib/interfaces/InteractionListener";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

export default class ClaimChannel implements InteractionListener<ButtonInteraction> {

    matches(interaction: ButtonInteraction): boolean {
        return interaction.customId === "claim";
    }

    async execute(interaction: ButtonInteraction, replyManager: ReplyManager<ButtonInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromPanel(interaction.message.id, null);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        if (channel.ownerPresent) {
            await replyManager.error("The owner is present in the channel!");
            return;
        }

        try {
            await channel.setOwner(interaction.user);
            await replyManager.success(`You successfully claimed ${channel.url}!`);
        } catch (e) {
            await replyManager.error(e.message);
        }
    }

}
