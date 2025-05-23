require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // We will create this next

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// Define a simple root route for testing
app.get('/', (req, res) => {
  res.send('Budget App API is running...');
});

// API Routes
app.use('/api/entries', require('./routes/entryRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));

const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 