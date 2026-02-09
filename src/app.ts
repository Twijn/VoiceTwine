import * as dotenv from "dotenv";
dotenv.config();

import logger from "./logger";

import {initModels} from "./lib/sequelize/models";
import localeManager from "./lib/managers/LocaleManager";

const startApp = async () => {
    // Initialize database models first
    await initModels();

    // Load locale manager before the rest of the application
    await localeManager.updateLanguages();

    // Only import and start Discord bot if database initialization was successful
    await import("./discord");
    // Run version check
    await import("./versionCheck");
}

startApp().then(() => {
    logger.info("App started successfully!");
}, error => {
    logger.error("Application failed to start due to an error:");
    logger.error(error);

    // Exit immediately with error code
    process.exit(1);
})
