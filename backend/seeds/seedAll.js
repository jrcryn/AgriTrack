import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { connectDB } from '../config/db.js';
import { initializeGlobalModels } from '../models/global/globalModelFactory.js';
import { initializeSystemAdminModels } from '../models/system admin/systemAdminModelFactory.js';
import { initializeHighValueCropsModels } from '../models/high-value-crops/hvcModelFactory.js';
import { initializeMachineriesModels } from '../models/machineries/machineriesModelFactory.js';
import { initializeDocTrackModels } from '../models/doc-track/doc-trackModelFactory.js';

import { seedSystemAdmin } from './seedSystemAdmin.js';
import { seedGlobal } from './seedGlobal.js';
import { seedHVC } from './seedHVC.js';
import { seedMachineries } from './seedMachineries.js';
import { seedDocTrack } from './seedDocTrack.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const runAllSeeds = async () => {
  console.log('==================================================');
  console.log(' Starting AgriTrack Mock Data Generation Seeder ');
  console.log('==================================================\n');

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in backend/.env file!');
    }

    const isClearOption = process.argv.includes('--clear');

    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connection established successfully.\n');

    // Initialize all model factories
    const systemAdminModels = initializeSystemAdminModels();
    const globalModels = initializeGlobalModels();
    const hvcModels = initializeHighValueCropsModels();
    const machineriesModels = initializeMachineriesModels();
    const docTrackModels = initializeDocTrackModels();

    // Set globals (consistent with backend application setup)
    global.systemAdminModels = systemAdminModels;
    global.globalModels = globalModels;
    global.hvcModels = hvcModels;
    global.machineriesModels = machineriesModels;
    global.docTrackModels = docTrackModels;

    const options = { clear: isClearOption };

    // 1. Seed System Admin DB
    await seedSystemAdmin(systemAdminModels, options);

    // 2. Seed Global DB (Farmers, Employees, Counters, Logs)
    const { employees, farmers } = await seedGlobal(globalModels, options);

    // 3. Seed High Value Crops DB
    await seedHVC(hvcModels, farmers, employees, options);

    // 4. Seed Machineries DB
    await seedMachineries(machineriesModels, farmers, employees, options);

    // 5. Seed Document Tracking DB
    await seedDocTrack(docTrackModels, employees, options);

    console.log('\n==================================================');
    console.log(' Mock Data Generation Completed Successfully!');
    console.log('==================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n Error seeding databases:', error);
    process.exit(1);
  }
};

runAllSeeds();
