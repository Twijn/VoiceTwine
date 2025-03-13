import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";

export default interface TwineCommand {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
