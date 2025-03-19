import InteractionListener from "../../../lib/interfaces/InteractionListener";
import {ButtonInteraction} from "discord.js";
import PanelManager from "../../../lib/managers/PanelManager";
import ReplyManager from "../../../lib/managers/ReplyManager";
import {DiscordChannelStatus} from "../../../lib/sequelize/models/discordchannel.model";
import logger from "../../../logger";

export default class PanelStatusUpdate implements InteractionListener<ButtonInteraction> {

    matches(interaction: ButtonInteraction): boolean {
        return interaction.customId.startsWith("status-");
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

        const [,statusName] = interaction.customId.toLowerCase().split("-");

        let newStatus: DiscordChannelStatus;

        switch (statusName) {
            case "public":
                newStatus = DiscordChannelStatus.PUBLIC;
                break;
            case "private":
                newStatus = DiscordChannelStatus.PRIVATE;
                break;
            case "hidden":
                newStatus = DiscordChannelStatus.HIDDEN;
                break;
            default:
                await replyManager.error(`Invalid status provided: '${statusName}'!`);
                return;
        }

        try {
            await channel.updateStatus(newStatus);

            await replyManager.success(`Successfully updated status to \`${newStatus}\` for channel \`${channel.discord.name}\`!`);
        } catch(e) {
            logger.error(e);
            await replyManager.error(`Failed to update channel \`${channel.discord.name}\`!`);
        }
    }

}
