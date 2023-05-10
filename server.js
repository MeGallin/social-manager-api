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

// Connect DB
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
