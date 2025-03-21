import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import {ChatInputCommandInteraction, GuildMember, MessageFlags, SlashCommandSubcommandBuilder} from "discord.js";
import ReplyManager, {createBaseEmbed} from "../../../lib/managers/ReplyManager";
import {getChannelFromMember} from "../../../lib/utils";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import PanelManager from "../../../lib/managers/PanelManager";

export default class TransferOwnershipSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName("transfer-ownership")
        .setDescription("Transfers ownership to a different user")
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("The user to transfer ownership to")
            .setRequired(true)
        );

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromMember(<GuildMember>interaction.member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        const user = interaction.options.getUser("user", true);
        await channel.setOwner(user);

        await replyManager.success(`Successfully transferred ownership of ${channel.discord.url} to <@${user.id}>!`);
    }

}
