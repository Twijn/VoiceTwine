import TwineCommand from "./TwineCommand";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";

export default class PingCommand implements TwineCommand {

    data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pong!");

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply("Pong!");
    }

}
