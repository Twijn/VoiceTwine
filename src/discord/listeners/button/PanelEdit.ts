import InteractionListener from "../../../lib/interfaces/InteractionListener";
import {ButtonInteraction} from "discord.js";
import PanelManager from "../../../lib/managers/PanelManager";
import ReplyManager from "../../../lib/managers/ReplyManager";

export default class PanelEdit implements InteractionListener<ButtonInteraction> {

    matches(interaction: ButtonInteraction): boolean {
        return interaction.customId === "edit";
    }

    async execute(interaction: ButtonInteraction, replyManager: ReplyManager<ButtonInteraction>): Promise<void> {
        const panel = PanelManager.getPanel(interaction.message.id);

        if (!panel) {
            await replyManager.error("Unable to get voice channel from this panel!");
            return;
        }

        const channel = panel.getOperatingChannel();

        if (!channel || channel.database.ownerId !== interaction.user.id) {
            await replyManager.error(`Only the owner can edit the channel '${channel.discord.name}'!`);
            return;
        }

        await interaction.showModal(channel.editModal());
    }

}