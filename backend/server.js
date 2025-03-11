import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './config/db.js';
import farmerForm from './routes/farmerForm.route.js';
import adminDashboard from './routes/adminDashboard.route.js';

const app = express();
dotenv.config();
dotenv.config({ path: './backend/.env' });

app.use(express.json());


const allowedOrigins = [
    process.env.CLIENT_URL,
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use('/', farmerForm);
app.use('/', adminDashboard);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log('Server is running on port ' + process.env.PORT);
});


