import {ChatInputCommandInteraction, GuildMember, Locale, SlashCommandBuilder} from "discord.js";

import ReplyManager from "../../lib/managers/ReplyManager";
import TwineCommand from "../../lib/interfaces/commands/TwineCommand";
import localeManager from "../../lib/managers/LocaleManager";

export default class PingCommand implements TwineCommand {

    data = new SlashCommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.ping.name"))
        .setNameLocalizations(localeManager.tall("command.ping.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.ping.description"))
        .setDescriptionLocalizations(localeManager.tall("command.ping.description"));

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        const member = interaction.member as GuildMember;

        const title = await localeManager.tm(
            member,
            "command.ping.description"
        );

        let message = await localeManager.tm(
            member,
            "command.ping.success.latency",
            interaction.client.ws.ping
        );

        const startTime = Date.now();
        await replyManager.info(message, title);

        message += "\n";
        message += await localeManager.tm(
            member,
            "command.ping.success.round-trip-latency",
            Date.now() - startTime
        );

        await replyManager.edit(message, title);
    }

}
