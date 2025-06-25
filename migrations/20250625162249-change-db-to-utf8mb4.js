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

/**
 * Generates an SQL statement to add a foreign key constraint to a specified table.
 *
 * @param {string} tableName - The name of the table to which the constraint will be added.
 * @param {Object} constraint - The configuration object for the foreign key constraint.
 * @param {string} constraint.CONSTRAINT_NAME - The name of the foreign key constraint.
 * @param {string} constraint.COLUMN_NAME - The column in the table that will act as the foreign key.
 * @param {string} constraint.REFERENCED_TABLE_NAME - The name of the referenced table.
 * @param {string} constraint.REFERENCED_COLUMN_NAME - The column in the referenced table that the foreign key points to.
 * @return {string} The generated SQL query to add the foreign key constraint.
 */
function generateConstraintSQL(tableName, constraint) {
  return `ALTER TABLE \`${tableName}\`
      ADD CONSTRAINT \`${constraint.CONSTRAINT_NAME}\`
        FOREIGN KEY (\`${constraint.COLUMN_NAME}\`)
          REFERENCES \`${constraint.REFERENCED_TABLE_NAME}\` (\`${constraint.REFERENCED_COLUMN_NAME}\`);`;
}

/**
 * Runs a specified query on all existing tables
 *
 * @param queryInterface {import('sequelize-cli').QueryInterface}
 * @param query {string}
 */
async function runOnAllTables(queryInterface, query) {
  const tables = await queryInterface.showAllTables();
  /**
   * @type {Map<string, {CONSTRAINT_NAME: string, COLUMN_NAME: string, REFERENCED_TABLE_NAME: string, REFERENCED_COLUMN_NAME: string}[]>}
   */
  const constraintsMap = new Map();

  // Store all constraints first
  for (const table of tables) {
    let tableName = normalizeTableName(table);

    if (!tableName) continue;

    const constraints = await getForeignKeyConstraints(queryInterface, tableName);
    if (constraints.length > 0) {
      constraintsMap.set(tableName, constraints);
      // Drop foreign key constraints
      for (const constraint of constraints) {
        await queryInterface.sequelize.query(
            `ALTER TABLE \`${tableName}\`
                DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\`;`
        );
      }
    }
  }

  // Run the query on all tables
  for (const table of tables) {
    let tableName = normalizeTableName(table);

    if (!tableName) continue;

    await queryInterface.sequelize.query(
        query.replace(/-tableName/g, `${tableName}`)
    );
  }

  // Restore foreign key constraints
  for (const [tableName, constraints] of constraintsMap) {
    for (const constraint of constraints) {
      console.log("Adding foreign key constraint " + constraint.CONSTRAINT_NAME + " on table " + tableName + "...")
      await queryInterface.sequelize.query(generateConstraintSQL(tableName, constraint));
    }
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER DATABASE \`${queryInterface.sequelize.config.database}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    await runOnAllTables(queryInterface, `
      ALTER TABLE \`-tableName\`
        CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER DATABASE \`${queryInterface.sequelize.config.database}\`
      CHARACTER SET utf8 COLLATE utf8_general_ci;
    `);

    await runOnAllTables(queryInterface, `
      ALTER TABLE \`-tableName\`
        CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
    `)
  }
};
