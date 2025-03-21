import {SlashCommandBuilder, InteractionContextType, PermissionFlagsBits} from "discord.js";

import TwineCommandWithSubcommands from "../../../lib/interfaces/commands/TwineCommandWithSubcommands";

import CreateSubcommand from "./CreateSubcommand";

export default class MasterChannelCommand extends TwineCommandWithSubcommands {

    constructor() {
        super(new SlashCommandBuilder()
            .setName("master-channel")
            .setDescription("Manager for master channel creation, deletion, and editing")
            .setContexts(InteractionContextType.Guild)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), [
                new CreateSubcommand(),
        ]);
    }

}
