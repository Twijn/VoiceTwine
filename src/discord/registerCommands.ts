import {REST, Routes, Collection} from "discord.js";

import logger from "../logger";

import TwineCommand from "../lib/interfaces/commands/TwineCommand";

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

export default async (commands: Collection<string, TwineCommand>) => {
    logger.info(`Started refreshing ${commands.size} application (/) commands`);

    await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
            body: [...commands.values()].map(x => x.data.toJSON()),
        }
    );

    logger.info(`Successfully reloaded application (/) commands!`);
}
