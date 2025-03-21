import TwineCommand from "../../lib/interfaces/commands/TwineCommand";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import ReplyManager from "../../lib/managers/ReplyManager";

export default class PingCommand implements TwineCommand {

    data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pong!");

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        let message = `Latency: \`${interaction.client.ws.ping} ms\``;
        const startTime = Date.now();
        await replyManager.info(message, "Pong!");
        message += `\nRound trip latency: \`${Date.now() - startTime} ms\``;
        await replyManager.edit(message, "Pong!");
    }

}
