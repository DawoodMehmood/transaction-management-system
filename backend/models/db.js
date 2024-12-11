// models/db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',            // Your database username
    host: 'tkg-database.c4qqre1sqm6r.us-east-1.rds.amazonaws.com', // RDS endpoint
    database: 'postgres',        // Your database name
    password: 'tkg-dashboard',     // Your database password
    port: 5432,
    ssl: {
        rejectUnauthorized: false // Use true in production with valid certificates
    }
});

module.exports = pool;