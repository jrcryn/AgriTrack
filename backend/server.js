import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // trust first proxy

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'https://agritrack-demo-frontend.vercel.app',
    'https://agritrack.online',
    'https://www.agritrack.online',
    'http://localhost:5173',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        // Fallback: allow origin dynamically so CORS header is returned for credentialed requests
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Import initializers as functions
import initHVC from './config/hvcAppInitializer.js';
import initMachineries from './config/machineriesAppInitializer.js';
import initDocTrack from './config/doc-trackAppInitializer.js';
import initGlobal from './config/globalAppInitilizer.js';
import initSystemAdmin from './config/systemAdminAppInitializer.js';

import highValueCropsRoutes from './routes/high-value-crops.routes.js';
import machineriesRoutes from './routes/machineries.routes.js';
import docTrackRoutes from './routes/doc-track.routes.js';
import authRoutes from './routes/auth.routes.js';
import globalRoutes from './routes/global.routes.js';
import userSettingsRoutes from './routes/userSettings.route.js';
import systemAdminRoutes from './routes/systemAdmin.routes.js';

import googleDriveRoutes from './routes/googleDrive.routes.js';

import { updateScheduleStatus, disableEditingForTodayTickets, updateMachineUnitStatusToInUse, updateMachineUnitStatusToAvailable } from './utils/scheduleUpdater.js'; 
import { startScheduleStatusCron } from './utils/cronScheduleUpdater.js';

let initPromise = null;

// Middleware to ensure DB connections & models are initialized before handling requests
const ensureDbConnected = async (req, res, next) => {
    if (!initPromise) {
        initPromise = (async () => {
            console.log('Initializing database connections and models...');
            await Promise.all([
                initHVC(),
                initMachineries(),
                initDocTrack(),
                initGlobal(),
                initSystemAdmin(),
            ]);

            try {
                await updateScheduleStatus();
                await disableEditingForTodayTickets();
                await updateMachineUnitStatusToInUse();
                await updateMachineUnitStatusToAvailable();
                console.log('Schedule and machine unit status update completed.');
            } catch (err) {
                console.error('Schedule and machine unit status updater failed:', err);
            }

            if (!process.env.VERCEL) {
                startScheduleStatusCron();
            }
        })();
    }

    try {
        await initPromise;
        next();
    } catch (error) {
        console.error('Error during database initialization:', error);
        res.status(500).json({ success: false, message: 'Database initialization failed', error: error.message });
    }
};

app.use(ensureDbConnected);

// Mount routes
app.use("/api/hvc", highValueCropsRoutes);
app.use("/api/machineries", machineriesRoutes);
app.use("/api/doc-track", docTrackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/global", globalRoutes);
app.use("/api/user-settings", userSettingsRoutes);
app.use("/api/system-admin", systemAdminRoutes);
app.use("/api/google", googleDriveRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AgriTrack Backend is running' });
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;