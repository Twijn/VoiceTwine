require("dotenv").config();

let dialect = process.env.DIALECT ?? "mariadb";
let storage;
let username;
let password;
let database;
let host;

console.log(`Using dialect ${dialect}.`)

if (dialect === "mariadb") { // Migrations fail for unknown reasons when using mariadb dialect here
    dialect = "mysql";
}

if (dialect === "sqlite") {
    storage = process.env.SQLITE_STORAGE ?? "./database.sqlite";
} else {
    username = process.env.MARIADB_USER;
    password = process.env.MARIADB_PASS;
    database = process.env.MARIADB_DB;
    host = process.env.MARIADB_HOST;
}

module.exports = {
    "development": {
        "username": username,
        "password": password,
        "database": database,
        "host": host,
        "dialect": dialect,
        "storage": storage
    },
    "test": {
        "username": username,
        "password": password,
        "database": database,
        "host": host,
        "dialect": dialect,
        "storage": storage
    },
    "production": {
        "username": username,
        "password": password,
        "database": database,
        "host": host,
        "dialect": dialect,
        "storage": storage
    }
}