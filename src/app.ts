import * as dotenv from "dotenv";
dotenv.config();

import logger from "./logger";

import {initModels} from "./lib/sequelize/models";

const startApp = async () => {
    // Initialize database models first
    await initModels();

    // Only import and start Discord bot if database initialization was successful
    await import("./discord");
}

startApp().then(() => {
    logger.info("App started successfully!");
}, error => {
    logger.error("Application failed to start due to an error:");
    logger.error(error);

    // Exit immediately with error code
    process.exit(1);
})
