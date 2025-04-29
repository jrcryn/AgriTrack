import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import { initializeDocTrackModels } from '../models/doc-track/doc-trackModelFactory.js';

//dati wala, pero kac hindi na mabasa yung MONGO_URL varaiable sa environment kaya minano-mano yung import gamit path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize database connections and models
const initializeApp = async () => {
  try {

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined. Make sure your .env file exists and is properly formatted.");
    }

    // Connect to MongoDB and initialize databases
    await connectDB();
    
    // Initialize high-value-crops models
    const docTrackModels = initializeDocTrackModels();
    
    // Make models available globally
    global.docTrackModels = docTrackModels;
    
    console.log('Doc-Track models initialized');
    
    // Start server and other initialization
    // ...
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();