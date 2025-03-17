import {Events, Guild} from "discord.js";

import Listener from "../../../lib/interfaces/Listener";
import logger from "../../../logger";

import {DiscordGuild} from "../../../lib/sequelize/models/discordguild.model";
import {DiscordUser} from "../../../lib/sequelize/models/discorduser.model";

export default class GuildUpdateListener implements Listener<Events.GuildUpdate> {

    event = Events.GuildUpdate;

    async execute(oldGuild: Guild, newGuild: Guild): Promise<void> {
        const [owner] = await DiscordUser.upsert((await newGuild.fetchOwner()).user);

        const [discordGuild] = await DiscordGuild.upsert(newGuild);

        logger.debug(`Updated guild '${discordGuild.name}' owned by '${owner.username}'`);
    }

}

