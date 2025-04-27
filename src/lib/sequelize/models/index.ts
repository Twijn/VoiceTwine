import sequelize from "../database";
import logger from "../../../logger";

import {DiscordUser} from "./discorduser.model";

import {DiscordGuild} from "./discordguild.model";
import {DiscordChannel} from "./discordchannel.model";
import {DiscordMessage} from "./discordmessage.model";

DiscordUser.hasMany(DiscordGuild, {foreignKey: "ownerId"});
DiscordGuild.belongsTo(DiscordUser, {foreignKey: "ownerId"});

DiscordUser.hasMany(DiscordChannel, {foreignKey: "ownerId"});
DiscordChannel.belongsTo(DiscordUser, {foreignKey: "ownerId"});

DiscordGuild.hasMany(DiscordChannel, {foreignKey: "guildId"});
DiscordChannel.belongsTo(DiscordGuild, {foreignKey: "guildId"});

DiscordChannel.hasMany(DiscordChannel, {foreignKey: "masterChannelId", as: "children"});
DiscordChannel.belongsTo(DiscordChannel, {foreignKey: "masterChannelId", as: "parent"});

DiscordChannel.hasMany(DiscordMessage, {foreignKey: "panelChannelId"});
DiscordMessage.belongsTo(DiscordChannel, {foreignKey: "panelChannelId"});

export const initModels = async () => {
    try {
        logger.info(`Attempting to connect to MariaDB @ ${sequelize.config.host}...`);
        await sequelize.authenticate();
        logger.info("Connected to MariaDB! Synchronizing...");
        await sequelize.sync({alter: process.env.NODE_ENV === "development"});
        logger.info("Databases synchronized!");
    } catch(err) {
        logger.error("Error initializing models: " + err);
        throw new Error(`Failed to connect to database: ${err}`);
    }
}
