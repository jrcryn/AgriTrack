import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import { initializeGlobalModels } from '../models/global/globalModelFactory.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize database connections and models
const initGlobal = async () => {
  try {

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined. Make sure your .env file exists and is properly formatted.");
    }

    await connectDB();
    
    const globalModels = initializeGlobalModels();
    
    global.globalModels = globalModels;
    
    console.log('Global models initialized');
    

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

export default initGlobal;