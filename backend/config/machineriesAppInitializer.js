import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import { initializeMachineriesModels } from '../models/machineries/machineriesModelFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const initializeApp = async () => {

    try {

        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is not defined. Make sure your .env file exists and is properly formatted.");
        }

        await connectDB();
        const machineriesModels = initializeMachineriesModels();

        global.machineriesModels = machineriesModels;

        console.log('Machineries models initialized');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

initializeApp();