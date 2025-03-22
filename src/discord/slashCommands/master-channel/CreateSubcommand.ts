import {ChannelType, ChatInputCommandInteraction, SlashCommandSubcommandBuilder} from "discord.js";

import ReplyManager from "../../../lib/managers/ReplyManager";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";

export default class CreateSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
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
        );

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
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