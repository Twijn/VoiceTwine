import {ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from "discord.js";
import ReplyManager from "../../lib/ReplyManager";

export default interface TwineCommand {
    data: SlashCommandBuilder|SlashCommandSubcommandsOnlyBuilder,
    execute: (interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>) => Promise<void>;
}
