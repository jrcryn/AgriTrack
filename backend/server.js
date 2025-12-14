import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // trust first proxy (Render)
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'https://agritrack.online', //production
    'https://www.agritrack.online', //production
    'https://staging-frontend-5tcj.onrender.com', //staging
    'http://localhost:5173',  
    process.env.CLIENT_URL,
];

app.use(cors({
    origin: allowedOrigins,
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

async function startServer() {
    // Wait for all initializers to finish
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

    // Start daily cron updater
    startScheduleStatusCron();

    // Now that globals are set, add routes
    app.use("/api/hvc", highValueCropsRoutes);
    app.use("/api/machineries", machineriesRoutes);
    app.use("/api/doc-track", docTrackRoutes);
    app.use("/api/auth",authRoutes);
    app.use("/api/global", globalRoutes);
    app.use("/api/user-settings", userSettingsRoutes);
    app.use("/api/system-admin", systemAdminRoutes);

    app.use("/api/google", googleDriveRoutes);

    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}

startServer();