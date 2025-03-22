import {ButtonInteraction} from "discord.js";

import {getChannelFromPanel} from "../../../lib/utils";

import ReplyManager from "../../../lib/managers/ReplyManager";
import InteractionListener from "../../../lib/interfaces/InteractionListener";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

export default class PanelUpdate implements InteractionListener<ButtonInteraction> {

    matches(interaction: ButtonInteraction): boolean {
        return interaction.customId === "edit";
    }

    async execute(interaction: ButtonInteraction, replyManager: ReplyManager<ButtonInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromPanel(interaction.message.id, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        await interaction.showModal(channel.getEditModal());
    }

}