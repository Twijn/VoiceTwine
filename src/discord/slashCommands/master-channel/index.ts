import {InteractionContextType, Locale, PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

import TwineCommandWithSubcommands from "../../../lib/interfaces/commands/TwineCommandWithSubcommands";
import localeManager from "../../../lib/managers/LocaleManager";

import CreateSubcommand from "./CreateSubcommand";
import EditSubcommand from "./EditSubcommand";

export default class MasterChannelCommand extends TwineCommandWithSubcommands {

    constructor() {
        super(new SlashCommandBuilder()
            .setName(localeManager.t(Locale.EnglishUS, "command.master-channel.name"))
            .setNameLocalizations(localeManager.tall("command.master-channel.name"))
            .setDescription(localeManager.t(Locale.EnglishUS, "command.master-channel.description"))
            .setDescriptionLocalizations(localeManager.tall("command.master-channel.description"))
            .setContexts(InteractionContextType.Guild)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), [
                new CreateSubcommand(),
                new EditSubcommand(),
        ]);
    }

}
