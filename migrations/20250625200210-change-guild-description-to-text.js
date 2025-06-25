'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(
        "discord_guild",
        "description",
        {
      type: Sequelize.TEXT,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(
    "discord_guild",
    "description",
    {
      type: Sequelize.STRING(120),
    });
  }
};
