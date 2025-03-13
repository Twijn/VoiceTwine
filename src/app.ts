import * as dotenv from "dotenv";
dotenv.config();

import logger from "./logger";

import {initModels} from "./lib/sequelize/models";

const startApp = async () => {
    await initModels();
    import("./discord");
}

startApp().then(() => {
    logger.info("App started!");
}, error => {
    logger.error(error);
    process.exitCode = 1;
})
