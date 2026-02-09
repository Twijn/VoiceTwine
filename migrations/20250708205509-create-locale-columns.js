'use strict';

const { Locale } = require("discord-api-types/v10");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("discord_guild", "locale", {
      type: Sequelize.ENUM,
      values: Object.values(Locale),
      allowNull: true,
    });

    await queryInterface.addColumn("discord_user", "locale", {
      type: Sequelize.ENUM,
      values: Object.values(Locale),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("discord_user", "locale");
    await queryInterface.removeColumn("discord_guild", "locale");
  }
};
