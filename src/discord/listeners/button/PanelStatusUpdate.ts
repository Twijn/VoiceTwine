import InteractionListener from "../../../lib/interfaces/InteractionListener";
import {ButtonInteraction} from "discord.js";
import ReplyManager from "../../../lib/managers/ReplyManager";
import {DiscordChannelStatus} from "../../../lib/sequelize/models/discordchannel.model";
import logger from "../../../logger";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import {getChannelFromPanel} from "../../../lib/utils";

export default class PanelStatusUpdate implements InteractionListener<ButtonInteraction> {

    matches(interaction: ButtonInteraction): boolean {
        return interaction.customId.startsWith("status-");
    }

    async execute(interaction: ButtonInteraction, replyManager: ReplyManager<ButtonInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromPanel(interaction.channelId, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
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
