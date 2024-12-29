const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes'); 
const stateRoutes = require('./routes/stateRoutes');
const dateRoutes = require('./routes/dateRoutes');
const pool = require('./models/db'); // Import the database connection

const app = express();

// CORS Configuration to allow all origins
const corsOptions = {
    origin: '*', // Allow requests from any origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to send cookies or credentials
    optionsSuccessStatus: 204, // For older browsers
};

// Use CORS with the specified options
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(bodyParser.json());

// Define routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/states',stateRoutes);
app.use('/api/dates', dateRoutes);  

const PORT = process.env.PORT || 3003;

// Check database connection on server start
pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL database successfully.');
        console.log('Connection details:', pool.options);

        // Set search path to tkg schema
        return client.query("SET search_path TO tkg;")
            .then(() => {
                console.log('Search path set to tkg schema.');
                client.release(); // Release the client back to the pool
                app.listen(PORT, '0.0.0.0', () => {
                    console.log(`Server is running on port ${PORT}`);
                });
            });
    })
    .catch(err => {
        console.error('Database connection error:', err.stack);
    });
