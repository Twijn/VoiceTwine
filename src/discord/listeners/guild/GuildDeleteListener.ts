import {Events, Guild} from "discord.js";

import Listener from "../Listener";
import logger from "../../../logger";

import {DiscordGuild} from "../../../lib/sequelize/models/discordguild.model";

export default class GuildDeleteListener implements Listener<Events.GuildUpdate> {

    event = Events.GuildUpdate;

    async execute(guild: Guild): Promise<void> {
        const discordGuild = await DiscordGuild.findByPk(guild.id);

        if (discordGuild) {
            await discordGuild.destroy();
        }

        logger.debug(`Deleted guild '${guild.name}'`);
    }

}
