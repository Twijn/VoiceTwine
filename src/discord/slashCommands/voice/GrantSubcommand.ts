import {
    ChatInputCommandInteraction,
    GuildMember,
    Locale,
    MessageFlags,
    SlashCommandSubcommandBuilder
} from "discord.js";

import {getChannelFromMember} from "../../../lib/utils";

import {DiscordChannelStatus} from "../../../lib/sequelize/models/discordchannel.model";

import ReplyManager, {createBaseEmbed, ReplyType} from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import localeManager from "../../../lib/managers/LocaleManager";

export default class GrantSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.voice.grant.name"))
        .setNameLocalizations(localeManager.tall("command.voice.grant.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.voice.grant.description"))
        .setDescriptionLocalizations(localeManager.tall("command.voice.grant.description"));

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        const member: GuildMember = interaction.member as GuildMember;

        let channel: ManagedChannel;

        try {
            channel = getChannelFromMember(member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        if (channel.status === DiscordChannelStatus.PUBLIC) {
            await replyManager.tm(
                ReplyType.ERROR,
                "command.voice.grant.error.public-channel"
            );
            return;
        }

        await interaction.reply({
            embeds: [
                createBaseEmbed(interaction.guild)
                    .setTitle(
                        await localeManager.tm(
                            member,
                            "command.voice.grant.success.title"
                        )
                    )
                    .setDescription(
                        await localeManager.tm(
                            member,
                            "command.voice.grant.success.description",
                            channel.url
                        )
                    )
            ],
            components: [
                channel.constructGrantComponent(),
            ],
            flags: MessageFlags.Ephemeral,
        }).catch(() => {});
    }

}
