import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { connectDB, getConnections } from '../config/db.js';
import { initializeGlobalModels } from '../models/global/globalModelFactory.js';
import { initializeHighValueCropsModels, getUnifiedFarmerRecordModel } from '../models/high-value-crops/hvcModelFactory.js';

// --- DATA SOURCES ---
const barangays = [
    "BAGONG KALSADA", "BANADERO", "BANLIC", "BARANDAL", "BARANGAY 1", "BARANGAY 2", "BARANGAY 3", "BARANGAY 4",
    "BARANGAY 5", "BARANGAY 6", "BARANGAY 7", "BATINO", "BUBUYAN", "BUCAL", "BUNGGO", "BUROL", "CAMALIGAN",
    "CANLUBANG", "HALANG", "HORNALAN", "KAY-ANLOG", "LAMESA", "LAGUERTA", "LAWA", "LECHERIA", "LINGGA",
    "LOOC", "MABATO", "MAJADA OUT", "MAKILING", "MAPAGONG", "MASILI", "MAUNONG", "MAYAPA", "MILAGROSA",
    "PACIANO RIZAL", "PALINGON", "PALO-ALTO", "PANSOL", "PARIAN", "PRINZA", "PUNTA", "PUTING LUPA",
    "REAL", "SAIMSIM", "SAMPIRUHAN", "SAN CRISTOBAL", "SAN JOSE", "SAN JUAN", "SIRANG LUPA", "SUCOL",
    "TURBINA", "ULANGO", "UWISAN"
];

const destinations = ["TANAUAN", "DIVISORIA", "ALABANG", "CALAMBA", "BALINTAWAK", "PASIG", "OTHERS"];

const modeOfDelivery = ["TRICYCLE", "MOTORCYCLE", "JEEP", "VAN", "TRUCK", "OTHERS"];

const indusCrops = [
    "ALUGBATI", "AMPALAYA", "BAGUIO BEANS", "BAWANG", "KALABASA", "KAMATIS", "KAMOTE", "KANGKONG", "LABANOS",
    "LUYA", "MANI", "MUNGGO", "MUSTASA", "OKRA", "PAAYAP", "PAKWAN", "PAMINTA", "PATANI", "PATOLA", "PECHAY",
    "PINYA", "PIPINO", "SALAY", "SALUYOT", "SIGARILYAS", "SILING LABUYO", "SILING PANIGANG", "SILING TINGALA",
    "SITAO", "TALONG", "TUBO", "UBE", "UPO"
];

const otherFCT = [
    "AVOCADO", "BARIBA", "CACAO", "CALAMANSI", "CHICO", "CITRUS", "DALANGHITA", "DRAGON FRUIT", "DURIAN",
    "GYABANO", "JACKFRUIT", "LANZONES", "MANGO", "PAPAYA", "POMELO", "RAMBUTAN", "SANTOL"
];

const cropTypes = [
    'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS',
    'BANANA',
    'COFFEE',
    'OTHER FRUIT CROPS/TREES'
];

const bananaVarieties = ["BUNGULAN", "LACATAN", "LAGKITAN", "LATUNDAN", "SABA", "SENORITA"];
const coffeeVarieties = ["LIBERICA", "ROBUSTA"];
const cropStages = ['NEWLY PLANTED', 'HARVESTING'];
const cropPurposes = ['PANG BENTA', 'PANG SARILI LAMANG'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDecimal = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// --- SCRIPT ENTRY POINT ---
const ITERATIONS = 5000; // Customizable count

const args = process.argv.slice(2);
const isClear = args.includes('--clear');

const clearData = async (hvcModels) => {
    console.log("Removing seeded information...");

    // Delete all records from relational schemas
    await hvcModels.A_farmer_inputs.deleteMany({});
    await hvcModels.B_crop_types.deleteMany({});
    await hvcModels.C_crop_records_indus.deleteMany({});
    await hvcModels.C_crop_records_others.deleteMany({});
    await hvcModels.D1_crop_indus_new.deleteMany({});
    await hvcModels.D1_crop_indus_harvest.deleteMany({});
    await hvcModels.D2_bc_other_fct_new.deleteMany({});
    await hvcModels.D2_bc_other_fct_harvest.deleteMany({});

    // Drop all unified farmer record collections
    const db = hvcModels.A_farmer_inputs.db;
    const collections = await db.db.listCollections().toArray();
    for (const collection of collections) {
        if (collection.name.startsWith('unified_farmer_records_')) {
            await db.db.dropCollection(collection.name);
            console.log(`Dropped collection: ${collection.name}`);
        }
    }

    console.log("All data removed successfully!");
    process.exit(0);
};

const runSeeder = async () => {
    try {
        console.log("Connecting to Database...");
        await connectDB();
        console.log("Initializing Models...");
        const globalModels = initializeGlobalModels();
        const hvcModels = initializeHighValueCropsModels();

        if (isClear) {
            await clearData(hvcModels);
            return;
        }

        console.log("Querying for a Farmer Account...");
        const farmerAccount = await globalModels.FarmerAccount.findOne();
        if (!farmerAccount) {
            console.error("No Farmer Account found in the global database. Please create one first.");
            process.exit(1);
        }

        const farmerId = farmerAccount.farmerId || `FARMER-${getRandomNumber(1000, 9999)}`;
        const farmer_account_id = farmerAccount._id;

        console.log(`Using Farmer Account ID: ${farmer_account_id} (${farmerId})`);
        console.log(`Starting ${ITERATIONS} iterations...`);

        for (let i = 0; i < ITERATIONS; i++) {
            const farm_location = getRandom(barangays);
            const cropTypeStr = getRandom(cropTypes);
            const crop_stage = getRandom(cropStages);

            // Generate A_farmer_inputs
            const newFarmerInput = await hvcModels.A_farmer_inputs.create({
                farmer_account_id,
                farmerId,
                farm_location,
                isValidated: true,
                isForReview: false,
                isArchived: false,
                successfullyUpdated: false
            });
            const farmer_input_id = newFarmerInput._id;

            // Generate B_crop_types
            const newCropType = await hvcModels.B_crop_types.create({
                farmer_input_id,
                farmerId,
                crop_type: cropTypeStr
            });
            const crop_type_id = newCropType._id;

            let record_id;
            let commodity;

            // Unified record payload builder
            const unifiedPayload = {
                farmer_account_id,
                farmerId,
                farm_location,
                crop_type: cropTypeStr,
                crop_stage,
                isValidated: true,
                original_farmer_input_id: farmer_input_id
            };

            // Generate C records
            if (cropTypeStr === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
                commodity = getRandom(indusCrops);
                const c1 = await hvcModels.C_crop_records_indus.create({
                    farmer_input_id,
                    farmerId,
                    crop_type_id,
                    crop_type: commodity,
                    crop_variety: 'SEEDER_VARIETY',
                    crop_stage
                });
                record_id = c1._id;
                unifiedPayload.commodity = commodity;
            } else {
                if (cropTypeStr === 'BANANA') commodity = getRandom(bananaVarieties);
                else if (cropTypeStr === 'COFFEE') commodity = getRandom(coffeeVarieties);
                else commodity = getRandom(otherFCT);

                const c2 = await hvcModels.C_crop_records_others.create({
                    farmer_input_id,
                    farmerId,
                    crop_type_id,
                    crop_variety: commodity,
                    crop_stage
                });
                record_id = c2._id;
                unifiedPayload.commodity = commodity;
            }

            // Generate D records & update unified payload
            const now = new Date();
            const past = new Date(now);
            past.setMonth(now.getMonth() - 120); // Up to 10 years ago (120 months) 

            if (crop_stage === 'NEWLY PLANTED') {
                const plantation_start_date = getRandomDate(past, now);
                const plantation_end_date = getRandomDate(plantation_start_date, now);
                const harvest_month_year = getRandomDate(now, new Date(now.getFullYear(), now.getMonth() + 6, 1));

                unifiedPayload.plantation_start_date = plantation_start_date;
                unifiedPayload.plantation_end_date = plantation_end_date;
                unifiedPayload.harvest_month_year = harvest_month_year;

                if (cropTypeStr === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
                    const total_area_planted = getRandomDecimal(0.5, 3.5);
                    await hvcModels.D1_crop_indus_new.create({
                        record_id,
                        farmerId,
                        plantation_start_date,
                        plantation_end_date,
                        harvest_month_year,
                        total_area_planted
                    });
                    unifiedPayload.total_area_planted = total_area_planted;
                } else {
                    const total_trees = getRandomNumber(10, 30);
                    await hvcModels.D2_bc_other_fct_new.create({
                        record_id,
                        farmerId,
                        plantation_start_date,
                        plantation_end_date,
                        harvest_month_year,
                        total_trees
                    });
                    unifiedPayload.total_area_trees_planted = total_trees;
                }
            } else {
                const harvest_start_date = getRandomDate(past, now);
                const harvest_end_date = getRandomDate(harvest_start_date, now);
                const total_weight = getRandomDecimal(10, 150);
                const crop_purpose = getRandom(cropPurposes);
                const destination = getRandom(destinations);
                const mode_of_payment = getRandom(["CASH", "GCASH", "BANK TRANSFER"]);
                const mode_of_delivery = getRandom(modeOfDelivery);

                unifiedPayload.harvest_start_date = harvest_start_date;
                unifiedPayload.harvest_end_date = harvest_end_date;
                unifiedPayload.total_weight = total_weight;
                unifiedPayload.crop_purpose = crop_purpose;
                unifiedPayload.destination = destination;
                unifiedPayload.mode_of_payment = mode_of_payment;
                unifiedPayload.mode_of_delivery = mode_of_delivery;

                if (cropTypeStr === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
                    const total_area_harvested = getRandomDecimal(0.5, 3.5);
                    await hvcModels.D1_crop_indus_harvest.create({
                        record_id,
                        farmerId,
                        harvest_start_date,
                        harvest_end_date,
                        total_area_harvested,
                        total_weight,
                        crop_purpose,
                        destination,
                        mode_of_payment,
                        mode_of_delivery
                    });
                    unifiedPayload.total_area_harvested = total_area_harvested;
                } else {
                    const trees_harvested = getRandomNumber(5, 40);
                    await hvcModels.D2_bc_other_fct_harvest.create({
                        record_id,
                        farmerId,
                        harvest_start_date,
                        harvest_end_date,
                        trees_harvested,
                        total_weight,
                        crop_purpose,
                        destination,
                        mode_of_payment,
                        mode_of_delivery
                    });
                    unifiedPayload.total_area_trees_harvested = trees_harvested;
                }
            }

            // Create Unified Record
            const year = (unifiedPayload.plantation_start_date || unifiedPayload.harvest_start_date).getFullYear();
            const UnifiedFarmerRecordModel = getUnifiedFarmerRecordModel(year);
            await UnifiedFarmerRecordModel.create(unifiedPayload);

            console.log(`[${i + 1}/${ITERATIONS}] Created dataset for ${commodity} (${crop_stage})`);
        }
        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error running seeder:", error);
        process.exit(1);
    }
};

runSeeder();
