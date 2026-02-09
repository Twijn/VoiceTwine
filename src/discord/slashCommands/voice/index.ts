import {InteractionContextType, Locale, SlashCommandBuilder} from "discord.js";

import TwineCommandWithSubcommands from "../../../lib/interfaces/commands/TwineCommandWithSubcommands";

import EditChannelSubcommand from "./EditChannelSubcommand";
import GrantSubcommand from "./GrantSubcommand";
import SetStatusSubcommand from "./SetStatusSubcommand";
import TransferOwnershipSubcommand from "./TransferOwnershipSubcommand";
import localeManager from "../../../lib/managers/LocaleManager";

export default class VoiceCommand extends TwineCommandWithSubcommands {

    constructor() {
        super(new SlashCommandBuilder()
            .setName(localeManager.t(Locale.EnglishUS, "command.voice.name"))
            .setNameLocalizations(localeManager.tall("command.voice.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.voice.description"))
            .setDescriptionLocalizations(localeManager.tall("command.voice.description"))
            .setContexts(InteractionContextType.Guild), [
            new EditChannelSubcommand(),
            new GrantSubcommand(),
            new SetStatusSubcommand(),
            new TransferOwnershipSubcommand(),
        ]);
    }

}
