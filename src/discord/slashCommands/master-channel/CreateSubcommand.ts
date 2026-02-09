import {ChannelType, ChatInputCommandInteraction, GuildMember, Locale, SlashCommandSubcommandBuilder} from "discord.js";

import ReplyManager, {ReplyType} from "../../../lib/managers/ReplyManager";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import localeManager from "../../../lib/managers/LocaleManager";

export default class CreateSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.master-channel.create.name"))
        .setNameLocalizations(localeManager.tall("command.master-channel.create.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.master-channel.create.description"))
        .setDescriptionLocalizations(localeManager.tall("command.master-channel.create.description"))
        .addStringOption(option => option
            .setName(localeManager.t(Locale.EnglishUS, "command.master-channel.option.channel-name.name"))
            .setNameLocalizations(localeManager.tall("command.master-channel.option.channel-name.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.master-channel.option.channel-name.description"))
            .setDescriptionLocalizations(localeManager.tall("command.master-channel.option.channel-name.description"))
            .setMinLength(3)
            .setMaxLength(30)
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName(localeManager.t(Locale.EnglishUS, "command.master-channel.option.naming-scheme.name"))
            .setNameLocalizations(localeManager.tall("command.master-channel.option.naming-scheme.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.master-channel.option.naming-scheme.description"))
            .setDescriptionLocalizations(localeManager.tall("command.master-channel.option.naming-scheme.description"))
            .setMinLength(3)
            .setMaxLength(100)
            .setRequired(false)
        )
        .addChannelOption(option => option
            .setName(localeManager.t(Locale.EnglishUS, "command.master-channel.option.category.name"))
            .setNameLocalizations(localeManager.tall("command.master-channel.option.category.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.master-channel.option.category.description"))
            .setDescriptionLocalizations(localeManager.tall("command.master-channel.option.category.description"))
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)
        );

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        let channelName = interaction.options.getString("channel-name", false);
        let namingScheme = interaction.options.getString("naming-scheme", false);
        let category = interaction.options.getChannel("category", false, [ChannelType.GuildCategory]);

        try {
            const {channel} = await TwineChannelManager.createMaster(interaction.member as GuildMember, channelName, category, namingScheme);
            await replyManager.tm(
                ReplyType.SUCCESS,
                "command.master-channel.create.success",
                channel.url
            );
        } catch (error) {
            await replyManager.error(error);
        }
    }

}