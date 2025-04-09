import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './config/db.js';
import highValueCropsRoutes from './routes/high-value-crops.routes.js';

const app = express();
dotenv.config();
dotenv.config({ path: './backend/.env' });

app.use(express.json());


const allowedOrigins = [
    'https://agritrack-5zw3.onrender.com',
    process.env.CLIENT_URL,
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use('/', highValueCropsRoutes);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log('Server is running on port ' + process.env.PORT);
});


