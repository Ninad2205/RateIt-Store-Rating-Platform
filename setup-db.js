const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('Setting up MySQL database...\n');

  try {
    const password = process.env.DB_PASSWORD || 'password';
    console.log(`Attempting to connect with password: ${password}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: password,
      multipleStatements: true, // allow executing full SQL file at once
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS store_rating_system');
    console.log('Database created/verified');

    // Use the database
    await connection.query('USE store_rating_system');

    // Path to init-db.sql
    const sqlFile = path.join(__dirname, 'server', 'config', 'init-db.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL file not found: ${sqlFile}`);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('\nRunning SQL from init-db.sql...');

    // Instead of splitting, just run full file content
    await connection.query(sqlContent);

    console.log('Database tables created successfully');
    console.log('Default admin user created');
    console.log('\nDefault admin credentials:');
    console.log('   Email: admin@store-rating.com');
    console.log('   Password: Admin@123');

    await connection.end();
    console.log('\nDatabase setup completed!');

  } catch (error) {
    console.error('Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check your MySQL root password');
    console.log('   3. Verify your init-db.sql file exists and has valid SQL');
    console.log('   4. Update the DB_PASSWORD in your .env file');
  }
}

setupDatabase();
