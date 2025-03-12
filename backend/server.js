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
    'https://agri-trackfrontend.vercel.app', // frontend
    'https://agri-track-green.vercel.app', // backend/frontend
    process.env.CLIENT_URL,
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // Allow any origin for development/testing
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use('/', farmerForm);
app.use('/', adminDashboard);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log('Server is running on port ' + process.env.PORT);
});


