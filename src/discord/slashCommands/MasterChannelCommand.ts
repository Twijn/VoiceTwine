import TwineCommand from "./TwineCommand";
import {ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, InteractionContextType, PermissionFlagsBits} from "discord.js";
import TwineChannelManager from "../../lib/managers/TwineChannelManager";
import ReplyManager from "../../lib/managers/ReplyManager";

export default class MasterChannelCommand implements TwineCommand {

    data = new SlashCommandBuilder()
        .setName("master-channel")
        .setDescription("Manager for master channel creation, deletion, and editing")
        .addSubcommand(subcommand => subcommand
            .setName("create")
            .setDescription("Create a new master channel")
            .addStringOption(option => option
                .setName("channel-name")
                .setDescription("Channel Name")
                .setMinLength(3)
                .setMaxLength(30)
                .setRequired(false)
            )
            .addChannelOption(option => option
                .setName("category")
                .setDescription("The category to add the channel to. If unspecified it will create one")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false)
            )
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        const subcommand = interaction.options.getSubcommand(true);

        if (subcommand === "create") {
            let channelName = interaction.options.getString("channel-name", false);
            let category = interaction.options.getChannel("category", false, [ChannelType.GuildCategory]);

            try {
                const {channel} = await TwineChannelManager.createMaster(interaction.guild, channelName, category);
                await replyManager.success(`Successfully created master VoiceTwine channel at ${channel.discord.url}!\nTo use it, simply join the channel.`);
            } catch (error) {
                await replyManager.error(error);
            }
        }
    }

}
