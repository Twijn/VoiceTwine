import {ChatInputCommandInteraction, GuildMember, LabelBuilder, Locale, ModalBuilder, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

import ReplyManager, {ReplyType} from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import twineChannelManager from "../../../lib/managers/TwineChannelManager";
import localeManager from "../../../lib/managers/LocaleManager";
import { DEFAULT_NAMING_SCHEME } from "../../../lib/utils/channelNaming";

export default class EditSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.master-channel.edit.name"))
        .setNameLocalizations(localeManager.tall("command.master-channel.edit.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.master-channel.edit.description"))
        .setDescriptionLocalizations(localeManager.tall("command.master-channel.edit.description"))
        .addStringOption(option => option
            .setName(localeManager.t(Locale.EnglishUS, "command.master-channel.option.master-channel.name"))
            .setNameLocalizations(localeManager.tall("command.master-channel.option.master-channel.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.master-channel.option.master-channel.description"))
            .setDescriptionLocalizations(localeManager.tall("command.master-channel.option.master-channel.description"))
            .setAutocomplete(true)
            .setRequired(true)
        )
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
        );

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        const member: GuildMember = interaction.member as GuildMember;
        const masterChannelId = interaction.options.getString("master-channel", true);
        const channelName = interaction.options.getString("channel-name", false);
        const namingScheme = interaction.options.getString("naming-scheme", false);

        const masterChannel = twineChannelManager.getChannel(masterChannelId);
        if (!masterChannel) {
            await replyManager.tm(
                ReplyType.ERROR,
                "command.master-channel.edit.error.master-channel-missing",
                masterChannelId
            );
            return;
        }

        if (!channelName && !namingScheme) {
            const modal = new ModalBuilder()
                .setCustomId(`master-edit-${masterChannelId}`)
                .setTitle(await localeManager.tm(member, "modal.master-channel.edit.title"));

            const initialNamingScheme = masterChannel.database.namingScheme || DEFAULT_NAMING_SCHEME;

            let channelNameInput = new TextInputBuilder()
                .setValue(masterChannel.name)
                .setStyle(TextInputStyle.Short)
                .setCustomId("channel-name")
                .setMinLength(1)
                .setMaxLength(30)
                .setRequired(true);

            const channelNameLabel = new LabelBuilder()
                .setLabel(await localeManager.tm(member, "modal.master-channel.edit.channel-name-label"))
                .setDescription(await localeManager.tm(member, "modal.master-channel.edit.channel-name-description"))
                .setTextInputComponent(channelNameInput);

            modal.addLabelComponents(channelNameLabel);

            let namingSchemeInput = new TextInputBuilder()
                .setValue(initialNamingScheme)
                .setStyle(TextInputStyle.Short)
                .setCustomId("naming-scheme")
                .setMinLength(3)
                .setMaxLength(100)
                .setRequired(true);

            const namingSchemeLabel = new LabelBuilder()
                .setLabel(await localeManager.tm(member, "modal.master-channel.edit.naming-scheme-label"))
                .setDescription(await localeManager.tm(member, "modal.master-channel.edit.naming-scheme-description"))
                .setTextInputComponent(namingSchemeInput);

            modal.addLabelComponents(namingSchemeLabel);

            await interaction.showModal(modal);
            return;
        }

        let result = [
            await localeManager.tm(
                member,
                "command.master-channel.edit.success.message",
                masterChannel.discord.id
            ),
            ""
        ];

        if (channelName) {
            await masterChannel.discord.edit({
                name: channelName,
            });
            result.push(
                await localeManager.tm(
                    member,
                    "command.master-channel.edit.success.channel-name-updated",
                    channelName
                )
            );
        }

        if (namingScheme) {
            masterChannel.database.namingScheme = namingScheme;
            await masterChannel.database.save();
            result.push(
                await localeManager.tm(
                    member,
                    "command.master-channel.edit.success.naming-scheme-updated",
                    namingScheme
                )
            );
        }

        await replyManager.success(result.join("\n"));
    }

}