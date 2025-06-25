import { Sequelize } from "sequelize";
import logger from "../../logger";

const sequelize = new Sequelize({
    dialect: "mariadb",
    host: process.env.MARIADB_HOST ?? "localhost",
    port: Number(process.env.MARIADB_PORT) ?? 3306,
    username: process.env.MARIADB_USER ?? "twine",
    password: process.env.MARIADB_PASS ?? "",
    database: process.env.MARIADB_DB ?? "voicetwine",
    define: {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
    },
    logging: msg => logger.debug(msg),
});

export default sequelize;
