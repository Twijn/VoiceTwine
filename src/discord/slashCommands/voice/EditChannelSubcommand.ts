import {ChatInputCommandInteraction, GuildMember, Locale, SlashCommandSubcommandBuilder} from "discord.js";

import {getChannelFromMember} from "../../../lib/utils";

import ReplyManager from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import localeManager from "../../../lib/managers/LocaleManager";

export default class EditChannelSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.voice.edit-channel.name"))
        .setNameLocalizations(localeManager.tall("command.voice.edit-channel.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.voice.edit-channel.description"))
        .setDescriptionLocalizations(localeManager.tall("command.voice.edit-channel.description"));

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
