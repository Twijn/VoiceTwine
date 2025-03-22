import {GuildMember, MentionableSelectMenuInteraction} from "discord.js";

import logger from "../../../logger";
import {getChannelFromPanelOrMember} from "../../../lib/utils";

import ReplyManager from "../../../lib/managers/ReplyManager";
import InteractionListener from "../../../lib/interfaces/InteractionListener";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

export default class GrantMembers implements InteractionListener<MentionableSelectMenuInteraction> {

    matches(interaction: MentionableSelectMenuInteraction): boolean {
        return interaction.customId === "grant" && interaction.isMentionableSelectMenu();
    }

    async execute(interaction: MentionableSelectMenuInteraction, replyManager: ReplyManager<MentionableSelectMenuInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromPanelOrMember(interaction.message.id, <GuildMember>interaction.member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        await replyManager.defer();
        try {
            await channel.setAllowedMembers(interaction.values);
            await replyManager.success(`Successfully edited granted members for channel ${channel.url}!`);
        } catch(error) {
            logger.error(error);
            await replyManager.error("Failed to update granted members!");
        }
    }

}
