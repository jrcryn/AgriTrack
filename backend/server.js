import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // trust first proxy (Render/Vercel)
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'https://agritrack-demo-frontend.vercel.app',
    'http://localhost:5173',  
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// Initialize the app (DB connections, models, etc.)
// This promise is awaited before handling any request on Vercel
let initPromise = null;

async function ensureInitialized() {
    if (!initPromise) {
        initPromise = (async () => {
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
                console.log('Schedule status and machine unit status update completed at startup.');
            } catch (err) {
                console.error('Schedule and machine unit status updater failed at startup:', err);
            }

            // Start daily cron updater (only meaningful for long-running processes)
            startScheduleStatusCron();
        })();
    }
    return initPromise;
}

// Middleware that ensures initialization is complete before handling requests
app.use(async (req, res, next) => {
    try {
        await ensureInitialized();
        next();
    } catch (err) {
        console.error('Initialization failed:', err);
        res.status(500).json({ success: false, message: 'Server initialization failed.' });
    }
});

// Register routes synchronously so they exist when Vercel inspects the app
app.use("/api/hvc", highValueCropsRoutes);
app.use("/api/machineries", machineriesRoutes);
app.use("/api/doc-track", docTrackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/global", globalRoutes);
app.use("/api/user-settings", userSettingsRoutes);
app.use("/api/system-admin", systemAdminRoutes);

app.use("/api/google", googleDriveRoutes);

// For local development: start listening
const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== '1') {
    ensureInitialized().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
}

// Export for Vercel serverless
export default app;