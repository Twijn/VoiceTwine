import {ButtonInteraction} from "discord.js";

import {getChannelFromPanel} from "../../../lib/utils";

import ReplyManager, {ReplyType} from "../../../lib/managers/ReplyManager";
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
            await replyManager.error((e as Error).message);
            return;
        }

        if (channel.ownerPresent) {
            await replyManager.tm(ReplyType.ERROR, "button.claim.error.owner-in-channel");
            return;
        }

        try {
            await channel.setOwner(interaction.user);
            await replyManager.tm(ReplyType.SUCCESS, "button.claim.success", channel.url);
        } catch (e) {
            await replyManager.error((e as Error).message);
        }
    }

}
