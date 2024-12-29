// models/db.js
require('dotenv').config();
const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'postgres',            // Your database username
//     host: 'tkg-database.c4qqre1sqm6r.us-east-1.rds.amazonaws.com', // RDS endpoint
//     database: 'postgres',        // Your database name
//     password: 'tkg-dashboard',     // Your database password
//     port: 5432,
//     ssl: {
//         rejectUnauthorized: false // Use true in production with valid certificates
//     }
// });

const pool = new Pool({
    user: process.env.DB_USER,       // Local database username
    host: process.env.DATABASE_URL, // Localhost for local setup
    database: process.env.DB_NAME,  // Local database name
    password: process.env.DB_PASSWORD, // Local database password
    port: process.env.DB_PORT,      // Default PostgreSQL port (5432)
    ssl: false                      // No SSL for local setup
});

module.exports = pool;