import {ChatInputCommandInteraction, GuildMember, SlashCommandSubcommandBuilder} from "discord.js";

import {getChannelFromMember} from "../../../lib/utils";

import ReplyManager from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

export default class EditChannelSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName("edit-channel")
        .setDescription("Edits the voice channel you're currently in");

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromMember(<GuildMember>interaction.member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        await interaction.showModal(channel.getEditModal());
    }

}
