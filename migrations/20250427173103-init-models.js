'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes("discord_user")) {
      await queryInterface.createTable("discord_user", {
        id: {
          type: Sequelize.STRING(20),
          primaryKey: true,
        },
        username: {
          type: Sequelize.STRING(32),
          allowNull: false,
        },
        discriminator: {
          type: Sequelize.STRING(4),
          allowNull: true,
        },
        global_name: {
          type: Sequelize.STRING(32),
          allowNull: true,
        },
        avatar: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        }
      });
    }

    if (!tables.includes("discord_guild")) {
      await queryInterface.createTable("discord_guild", {
        id: {
          type: Sequelize.STRING(20),
          primaryKey: true,
        },
        ownerId: {
          type: Sequelize.STRING(20),
          allowNull: false,
          references: {
            model: "discord_user",
            key: "id",
          }
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        nameAcronym: {
          type: Sequelize.STRING(5),
          allowNull: true,
        },
        description: {
          type: Sequelize.STRING(120),
          allowNull: true,
        },
        icon: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        }
      });
    }

    if (!tables.includes("discord_channel")) {
      await queryInterface.createTable('discord_channel', {
        id: {
          type: Sequelize.STRING(20),
          primaryKey: true,
        },
        type: {
          type: Sequelize.ENUM,
          values: ['master_category', 'master_channel', 'child_channel'],
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM,
          values: ['public', 'private', 'hidden'],
          defaultValue: 'public',
          allowNull: false,
        },
        members: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        masterChannelId: {
          type: Sequelize.STRING(20),
          references: {
            model: "discord_channel",
            key: "id",
            onDelete: "CASCADE",
            allowNull: true,
          },
        },
        guildId: {
          type: Sequelize.STRING(20),
          references: {
            model: "discord_guild",
            key: "id",
          },
          onDelete: "CASCADE",
          allowNull: false,
        },
        ownerId: {
          type: Sequelize.STRING(20),
          references: {
            model: "discord_user",
            key: "id",
          },
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        }
      });
    }

    if (!tables.includes("discord_message")) {
      await queryInterface.createTable('discord_message', {
        id: {
          type: Sequelize.STRING(20),
          primaryKey: true,
        },
        channelId: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        panelChannelId: {
          type: Sequelize.STRING(20),
          references: {
            model: "discord_channel",
            key: "id",
          },
          onDelete: "CASCADE",
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        }
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('discord_message');
    await queryInterface.dropTable('discord_channel');
    await queryInterface.dropTable('discord_guild');
    await queryInterface.dropTable('discord_user');
  }
};
