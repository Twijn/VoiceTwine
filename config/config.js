require("dotenv").config();

module.exports = {
  "development": {
    "username": process.env.MARIADB_USER,
    "password": process.env.MARIADB_PASS,
    "database": process.env.MARIADB_DB,
    "host": process.env.MARIADB_HOST,
    "dialect": "mysql" // Migrations fail for unknown reasons when using mariadb dialect here
  },
  "test": {
    "username": process.env.MARIADB_USER,
    "password": process.env.MARIADB_PASS,
    "database": process.env.MARIADB_DB,
    "host": process.env.MARIADB_HOST,
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.MARIADB_USER,
    "password": process.env.MARIADB_PASS,
    "database": process.env.MARIADB_DB,
    "host": process.env.MARIADB_HOST,
    "dialect": "mysql"
  }
}
