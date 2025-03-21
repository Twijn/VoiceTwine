import {ChatInputCommandInteraction, SlashCommandSubcommandBuilder} from "discord.js";

import ReplyManager from "../../managers/ReplyManager";

export default interface TwineSubcommand {
    data: SlashCommandSubcommandBuilder;
    execute: (interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>) => Promise<void>;
}