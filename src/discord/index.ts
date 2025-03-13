import {Client, Collection, Events, GatewayIntentBits} from "discord.js";
import logger from "../logger";

import TwineCommand from "./slashCommands/TwineCommand";
import listeners from "./listeners";
import rawSlashCommands from "./slashCommands";
import registerCommands from "./registerCommands";

const slashCommands = new Collection<string, TwineCommand>();
for (const slashCommand of rawSlashCommands) {
    slashCommands.set(slashCommand.data.name, slashCommand);
}

const discordToken = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ],
});

logger.info(`Registering ${listeners.length} listener(s) and ${slashCommands.size} command(s)`)
for (const listener of listeners) {
    client[listener.type ?? "on"](listener.event, (...args) => listener.execute(...args));
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(error);
        await interaction.reply({
            content: "An unexpected error occurred while executing this command! Try again later.",
            ephemeral: true,
        });
    }
});

client.login(discordToken).catch(e => logger.error(e));

registerCommands(slashCommands).catch(e => logger.error(e));

export default client;
