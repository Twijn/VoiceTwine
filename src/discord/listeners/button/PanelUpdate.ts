import InteractionListener from "../../../lib/interfaces/InteractionListener";
import {ButtonInteraction} from "discord.js";
import ReplyManager from "../../../lib/managers/ReplyManager";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import {getChannelFromPanel} from "../../../lib/utils";

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