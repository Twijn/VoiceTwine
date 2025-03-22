import {Events, Guild} from "discord.js";

import logger from "../../../logger";

import {DiscordGuild} from "../../../lib/sequelize/models/discordguild.model";

import Listener from "../../../lib/interfaces/Listener";

export default class GuildDeleteListener implements Listener<Events.GuildDelete> {

    event = Events.GuildDelete;

    async execute(guild: Guild): Promise<void> {
        const discordGuild = await DiscordGuild.findByPk(guild.id);

        if (discordGuild) {
            await discordGuild.destroy();
        }

        logger.debug(`Deleted guild '${guild.name}'`);
    }

}
