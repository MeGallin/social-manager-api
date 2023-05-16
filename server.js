require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/v1/', require('./routes/UserRoutes'));

const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Close server gracefully
    process.on('SIGTERM', () => {
      console.log('Closing server gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

module.exports = app;
