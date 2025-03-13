import {Events, Guild} from "discord.js";

import Listener from "../Listener";
import logger from "../../../logger";

import {DiscordGuild} from "../../../lib/sequelize/models/discordguild.model";
import {DiscordUser} from "../../../lib/sequelize/models/discorduser.model";

export default class GuildCreateListener implements Listener<Events.GuildCreate> {

    event = Events.GuildCreate;

    async execute(guild: Guild): Promise<void> {
        const [owner] = await DiscordUser.upsert((await guild.fetchOwner()).user);

        const [discordGuild] = await DiscordGuild.upsert(guild);

        logger.info(`Bot added to discord guild '${discordGuild.name}' owned by '${owner.username}'`);
    }

}

