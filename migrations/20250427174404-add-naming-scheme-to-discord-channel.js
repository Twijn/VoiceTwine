'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const allColumns = await queryInterface.describeTable("discord_channel");
    if (allColumns.namingScheme) return;

    await queryInterface.addColumn("discord_channel", "namingScheme", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // We are using raw SQL here because Sequelize has issues with dropping columns with the MariaDB dialect
    // This will need to be changed if we start supporting other databases
    await queryInterface.sequelize.query(
        'ALTER TABLE discord_channel DROP COLUMN namingScheme'
    );
  }
};
