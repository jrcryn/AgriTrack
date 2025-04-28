import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import './config/hvcAppInitializer.js';
import './config/machineriesAppInitializer.js';
import './config/doc-trackAppInitializer.js';
import highValueCropsRoutes from './routes/high-value-crops.routes.js';
import machineriesRoutes from './routes/machineries.routes.js';

const app = express();

app.use(express.json());

const allowedOrigins = [
    'https://agritrack-5zw3.onrender.com',
    'http://localhost:5173',  
    process.env.CLIENT_URL,
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(highValueCropsRoutes);
app.use(machineriesRoutes);

app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
});