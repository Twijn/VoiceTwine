import {Client, Events, GatewayIntentBits} from "discord.js";
import logger from "../logger";

const discordToken = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ],
});

client.on("ready", readyClient => {
    logger.info(`Logged in to Discord as ${readyClient.user.tag}!`);
});

client.login(discordToken).catch(e => logger.error(e));

export default client;
