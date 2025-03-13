import sequelize from "../database";
import logger from "../../../logger";

import {DiscordUser} from "./discorduser.model";

export const initModels = async () => {
    try {
        logger.info(`Attempting to connect to MariaDB @ ${sequelize.config.host}...`);
        await sequelize.authenticate();
        logger.info("Connected to MariaDB! Synchronizing...");
        await sequelize.sync({alter: process.env.NODE_ENV === "development"});
        logger.info("Databases synchronized!");
    } catch(err) {
        logger.error("Error initializing models: " + err);
    }
}
