import { Sequelize, Options } from "sequelize";
import logger from "../../logger";

const dialect = process.env.DIALECT ?? "mariadb";

let options: Options;

if (dialect === "sqlite") {
    options = {
        dialect: "sqlite",
        storage: process.env.SQLITE_STORAGE ?? "database.sqlite",
    };
} else if (dialect === "mariadb") {
    options = {
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
    };
} else {
    logger.error(`Invalid database dialect: ${dialect}`);
    process.exit(1);
}

const sequelize = new Sequelize(options);

export default sequelize;
