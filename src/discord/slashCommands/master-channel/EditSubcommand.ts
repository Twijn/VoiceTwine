import {ChatInputCommandInteraction, SlashCommandSubcommandBuilder} from "discord.js";

import ReplyManager from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import twineChannelManager from "../../../lib/managers/TwineChannelManager";

export default class EditSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName("edit")
        .setDescription("Edit an existing master channel")
        .addStringOption(option => option
            .setName("master-channel")
            .setDescription("The master channel to edit")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("channel-name")
            .setDescription("Channel Name")
            .setMinLength(3)
            .setMaxLength(30)
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName("naming-scheme")
            .setDescription("Naming scheme for child channels. Use %N for channel number and %M for owner name")
            .setMinLength(3)
            .setMaxLength(100)
            .setRequired(false)
        );

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        const masterChannelId = interaction.options.getString("master-channel", true);
        const channelName = interaction.options.getString("channel-name", false);
        const namingScheme = interaction.options.getString("naming-scheme", false);

        if (!channelName && !namingScheme) {
            await replyManager.error(`You must specify either a new channel name or a new naming scheme!`);
            return;
        }

        const masterChannel = twineChannelManager.getChannel(masterChannelId);
        if (!masterChannel) {
            await replyManager.error(`Could not find master channel with ID ${masterChannelId}`);
            return;
        }

        let result = [`**Successfully updated master channel <#${masterChannel.id}>!**`,""];

        if (channelName) {
            await masterChannel.discord.edit({
                name: channelName,
            });
            result.push(`- Channel name was updated to \`${channelName}\``);
        }

        if (namingScheme) {
            masterChannel.database.namingScheme = namingScheme;
            await masterChannel.database.save();
            result.push(`- Naming scheme was updated to \`${namingScheme}\``);
        }

        await replyManager.success(result.join("\n"));
    }

}