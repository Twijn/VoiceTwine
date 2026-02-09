import {ChatInputCommandInteraction, GuildMember, Locale, SlashCommandSubcommandBuilder} from "discord.js";

import {getChannelFromMember} from "../../../lib/utils";

import ReplyManager, {ReplyType} from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import localeManager from "../../../lib/managers/LocaleManager";

export default class TransferOwnershipSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.voice.transfer-ownership.name"))
        .setNameLocalizations(localeManager.tall("command.voice.transfer-ownership.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.voice.transfer-ownership.description"))
        .setDescriptionLocalizations(localeManager.tall("command.voice.transfer-ownership.description"))
        .addUserOption(opt => opt
            .setName(localeManager.t(Locale.EnglishUS, "command.voice.transfer-ownership.option.user.name"))
            .setNameLocalizations(localeManager.tall("command.voice.transfer-ownership.option.user.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.voice.transfer-ownership.option.user.description"))
            .setDescriptionLocalizations(localeManager.tall("command.voice.transfer-ownership.option.user.description"))
            .setRequired(true)
        );

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        const member: GuildMember = interaction.member as GuildMember;
        let channel: ManagedChannel;

        try {
            channel = getChannelFromMember(<GuildMember>interaction.member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        const user = interaction.options.getUser("user", true);
        try {
            await channel.setOwner(user);
            await replyManager.tm(
                ReplyType.SUCCESS,
                "command.voice.transfer-ownership.success",
                channel.url,
                user.id
            );
        } catch(e) {
            await replyManager.error(e.message);
        }
    }

}
