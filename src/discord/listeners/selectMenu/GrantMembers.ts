import InteractionListener from "../../../lib/interfaces/InteractionListener";
import {MentionableSelectMenuInteraction} from "discord.js";
import PanelManager from "../../../lib/managers/PanelManager";
import ReplyManager from "../../../lib/managers/ReplyManager";
import logger from "../../../logger";

export default class GrantMembers implements InteractionListener<MentionableSelectMenuInteraction> {

    matches(interaction: MentionableSelectMenuInteraction): boolean {
        return interaction.customId === "grant" && interaction.isMentionableSelectMenu();
    }

    async execute(interaction: MentionableSelectMenuInteraction, replyManager: ReplyManager<MentionableSelectMenuInteraction>): Promise<void> {
        const panel = PanelManager.getPanel(interaction.message.id);

        if (!panel) {
            await replyManager.error("Unable to get voice channel from this panel!").catch(e => logger.error(e));
            return;
        }

        const channel = panel.getOperatingChannel();

        if (!channel || channel.database.ownerId !== interaction.user.id) {
            await replyManager.error(`Only the owner can edit the channel \`${channel.name}\`!`).catch(e => logger.error(e));
            return;
        }

        await replyManager.defer();
        try {
            await channel.editAllowedMembers(interaction.values);
            await replyManager.success(`Successfully edited granted members for channel \`${channel.name}\`!`);
        } catch(error) {
            logger.error(error);
            await replyManager.error("Failed to update granted members!");
        }
    }

}
