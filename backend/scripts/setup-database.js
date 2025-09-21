const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function setupDatabase() {
  try {
    console.log('Setting up BitNet database...');

    const sqlFile = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    await pool.query(sql);
    console.log('Database setup completed successfully!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();