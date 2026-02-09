import {ChatInputCommandInteraction, GuildMember, Locale, SlashCommandSubcommandBuilder} from "discord.js";

import {getChannelFromMember} from "../../../lib/utils";

import {DiscordChannelStatus} from "../../../lib/sequelize/models/discordchannel.model";

import ReplyManager, {ReplyType} from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import localeManager from "../../../lib/managers/LocaleManager";

export default class SetStatusSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.voice.set-status.name"))
        .setNameLocalizations(localeManager.tall("command.voice.set-status.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.voice.set-status.description"))
        .setDescriptionLocalizations(localeManager.tall("command.voice.set-status.description"))
        .addStringOption(opt => opt
            .setName(localeManager.t(Locale.EnglishUS, "command.voice.set-status.option.status.name"))
            .setNameLocalizations(localeManager.tall("command.voice.set-status.option.status.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.voice.set-status.option.status.description"))
            .setDescriptionLocalizations(localeManager.tall("command.voice.set-status.option.status.description"))
            .setChoices( // TODO: Add localization for choices, if possible?
                {
                    name: "Public",
                    value: "public",
                },
                {
                    name: "Private",
                    value: "private",
                },
                {
                    name: "Hidden",
                    value: "hidden",
                }
            )
            .setRequired(true)
        );

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        const member: GuildMember = interaction.member as GuildMember;
        let channel: ManagedChannel;

        try {
            channel = getChannelFromMember(member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        const stringStatus = interaction.options.getString("status", true);
        let status: DiscordChannelStatus;
        switch (stringStatus) {
            case "public":
                status = DiscordChannelStatus.PUBLIC;
                break;
            case "private":
                status = DiscordChannelStatus.PRIVATE;
                break;
            case "hidden":
                status = DiscordChannelStatus.HIDDEN;
                break;
            default:
                await replyManager.tm(
                    ReplyType.ERROR,
                    "command.voice.set-status.error.invalid-status",
                    stringStatus
                );
                return;
        }

        await replyManager.defer(true);
        await channel.setStatus(status);
        await replyManager.tm(
            ReplyType.SUCCESS,
            "command.voice.set-status.success",
            channel.url,
            channel.status
        );
    }

}
