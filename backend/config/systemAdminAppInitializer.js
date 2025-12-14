import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import { initializeSystemAdminModels } from '../models/system admin/systemAdminModelFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const initSystemAdmin = async () => {

    try {

        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is not defined. Make sure your .env file exists and is properly formatted.");
        }

        await connectDB();

        const systemAdminModels = initializeSystemAdminModels();

        global.systemAdminModels = systemAdminModels;

        console.log('System Admin models initialized');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

export default initSystemAdmin;