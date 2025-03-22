import {ButtonInteraction} from "discord.js";

import logger from "../../../logger";
import {getChannelFromPanel} from "../../../lib/utils";

import {DiscordChannelStatus} from "../../../lib/sequelize/models/discordchannel.model";

import ReplyManager from "../../../lib/managers/ReplyManager";
import InteractionListener from "../../../lib/interfaces/InteractionListener";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

export default class PanelStatusUpdate implements InteractionListener<ButtonInteraction> {

    matches(interaction: ButtonInteraction): boolean {
        return interaction.customId.startsWith("status-");
    }

    async execute(interaction: ButtonInteraction, replyManager: ReplyManager<ButtonInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromPanel(interaction.message.id, interaction.user.id);
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
            await channel.setStatus(newStatus);

            await replyManager.success(`Successfully updated status to \`${newStatus}\` for channel ${channel.url}!`);
        } catch(e) {
            logger.error(e);
            await replyManager.error(`Failed to update channel ${channel.url}!`);
        }
    }

}
