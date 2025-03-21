import {SlashCommandBuilder, InteractionContextType, PermissionFlagsBits} from "discord.js";

import TwineCommandWithSubcommands from "../../../lib/interfaces/commands/TwineCommandWithSubcommands";

import EditChannelSubcommand from "./EditChannelSubcommand";
import GrantSubcommand from "./GrantSubcommand";
import SetStatusSubcommand from "./SetStatusSubcommand";
import TransferOwnershipSubcommand from "./TransferOwnershipSubcommand";

export default class VoiceCommand extends TwineCommandWithSubcommands {

    constructor() {
        super(new SlashCommandBuilder()
            .setName("voice")
            .setDescription("Commands to manage voice channels")
            .setContexts(InteractionContextType.Guild)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), [
            new EditChannelSubcommand(),
            new GrantSubcommand(),
            new SetStatusSubcommand(),
            new TransferOwnershipSubcommand(),
        ]);
    }

}
