import {Client, Collection, Events, GatewayIntentBits} from "discord.js";

import logger from "../logger";

import ReplyManager from "../lib/managers/ReplyManager";
import TwineCommand from "../lib/interfaces/commands/TwineCommand";

import rawSlashCommands from "./slashCommands";
import registerCommands from "./registerCommands";

import listeners from "./listeners";
import buttonListener from "./listeners/button";
import modalListener from "./listeners/modal";
import selectMenuListener from "./listeners/selectMenu";

const slashCommands = new Collection<string, TwineCommand>();
for (const slashCommand of rawSlashCommands) {
    slashCommands.set(slashCommand.data.name, slashCommand);
}

const discordToken = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

logger.info(`Registering ${listeners.length} listener(s) and ${slashCommands.size} command(s)`)
for (const listener of listeners) {
    client[listener.type ?? "on"](listener.event, (...args) => listener.execute(...args));
}

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, new ReplyManager(interaction));
        } catch (error) {
            logger.error(error);
            await interaction.reply({
                content: "An unexpected error occurred while executing this command! Try again later.",
                ephemeral: true,
            });
        }
    } else if (interaction.isButton()) {
        await buttonListener.execute(interaction);
    } else if (interaction.isModalSubmit()) {
        await modalListener.execute(interaction);
    } else if (interaction.isAnySelectMenu()) {
        await selectMenuListener.execute(interaction);
    }
});

client.login(discordToken).catch(e => logger.error(e));

registerCommands(slashCommands).catch(e => logger.error(e));

export default client;
