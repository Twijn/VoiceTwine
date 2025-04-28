require("dotenv").config();

module.exports = {
  "development": {
    "username": process.env.MARIADB_USER,
    "password": process.env.MARIADB_PASS,
    "database": process.env.MARIADB_DB,
    "host": process.env.MARIADB_HOST,
    "dialect": "mariadb"
  },
  "test": {
    "username": process.env.MARIADB_USER,
    "password": process.env.MARIADB_PASS,
    "database": process.env.MARIADB_DB,
    "host": process.env.MARIADB_HOST,
    "dialect": "mariadb"
  },
  "production": {
    "username": process.env.MARIADB_USER,
    "password": process.env.MARIADB_PASS,
    "database": process.env.MARIADB_DB,
    "host": process.env.MARIADB_HOST,
    "dialect": "mariadb"
  }
}
