'use strict';

/**
 * Gets foreign key constraints provided a query interface and a table name
 * @param queryInterface {import('sequelize-cli').QueryInterface}
 * @param tableName {string}
 * @returns {Promise<{CONSTRAINT_NAME: string, COLUMN_NAME: string, REFERENCED_TABLE_NAME: string, REFERENCED_COLUMN_NAME: string}[]>}
 */
async function getForeignKeyConstraints(queryInterface, tableName) {
  try {
    const raw = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME,
             COLUMN_NAME,
             REFERENCED_TABLE_NAME,
             REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = '${tableName}'
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);

    return raw[0];
  } catch(err) {
    console.error(`Failed to get foreign key constraints for ${tableName}`, err);
    return [];
  }
}

/**
 * Normalizes the table name provided a table object or raw string
 * @param tableObj {unknown}
 * @returns {string|null}
 */
function normalizeTableName(tableObj) {
  if (typeof tableObj === "string") return tableObj;
  if (typeof tableObj === "object" && tableObj.tableName) return tableObj.tableName;
  console.warn("Unknown table object: ", tableObj);
  return null;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    for (const table of tables) {
      let tableName = normalizeTableName(table);
      if (!tableName) continue;

      const constraints = await getForeignKeyConstraints(queryInterface, tableName);
      for (const constraint of constraints) {
        await queryInterface.sequelize.query(
            `ALTER TABLE \`${tableName}\`
              DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\`;`
        );

        await queryInterface.sequelize.query(
            `ALTER TABLE \`${tableName}\`
              ADD CONSTRAINT \`${constraint.CONSTRAINT_NAME}\`
                FOREIGN KEY (\`${constraint.COLUMN_NAME}\`)
                  REFERENCES \`${constraint.REFERENCED_TABLE_NAME}\` (\`${constraint.REFERENCED_COLUMN_NAME}\`)
                  ON DELETE CASCADE;`
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    for (const table of tables) {
      let tableName = normalizeTableName(table);
      if (!tableName) continue;

      const constraints = await getForeignKeyConstraints(queryInterface, tableName);
      for (const constraint of constraints) {
        await queryInterface.sequelize.query(
            `ALTER TABLE \`${tableName}\`
              DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\`;`
        );

        await queryInterface.sequelize.query(
            `ALTER TABLE \`${tableName}\`
              ADD CONSTRAINT \`${constraint.CONSTRAINT_NAME}\`
                FOREIGN KEY (\`${constraint.COLUMN_NAME}\`)
                  REFERENCES \`${constraint.REFERENCED_TABLE_NAME}\` (\`${constraint.REFERENCED_COLUMN_NAME}\`);`
        );
      }
    }
  }
};
