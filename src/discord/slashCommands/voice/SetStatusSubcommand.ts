import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import {ChatInputCommandInteraction, GuildMember, SlashCommandSubcommandBuilder} from "discord.js";
import ReplyManager from "../../../lib/managers/ReplyManager";
import {getChannelFromMember} from "../../../lib/utils";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import {DiscordChannelStatus} from "../../../lib/sequelize/models/discordchannel.model";

export default class SetStatusSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName("set-status")
        .setDescription("Edits the voice channel you're currently in")
        .addStringOption(opt => opt
            .setName("status")
            .setDescription("The new status of the channel")
            .setChoices(
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
        let channel: ManagedChannel;

        try {
            channel = getChannelFromMember(<GuildMember>interaction.member, interaction.user.id);
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
                await replyManager.error(`Unknown channel status provided: ${stringStatus}`);
                return;
        }

        await replyManager.defer(true);
        await channel.setStatus(status);
        await replyManager.success(`Status for ${channel.url} was successfully updated to \`${channel.status}\`!`);
    }

}
