import express from 'express';
import { 
    getUnvalidatedFarmerInputs, 
    getValidatedFarmerInputs, 
    createFarmerAccount, 
    getFarmerAccounts,
    getFarmerAccountById,
    createUnifiedFarmerResponse,
    getAvailableMetricsYears,
    getAvailableMonthsForYear,
    getMetricsForYearMonth
 } from '../controller/adminDashboard.controller.js'; 

const router = express.Router();


//________________________________ FARMERS NEW RESPONSES PAGE ____________________________________


router.get('/get-unvalidated-inputs', getUnvalidatedFarmerInputs);
router.get('/get-validated-inputs', getValidatedFarmerInputs);


//________________________________ FARMERS ACCOUNT MANAGEMENT PAGE ____________________________________


router.post('/create-farmer-account', createFarmerAccount);
router.get('/get-farmer-accounts', getFarmerAccounts);
router.post('/get-farmer-account', getFarmerAccountById);
router.post('/create-unified-farmer-response', createUnifiedFarmerResponse);


//________________________________ DASHBOARD (METRICS) PAGE ____________________________________


router.get('/metrics/available-years', getAvailableMetricsYears);
router.get('/metrics/available-months/:year', getAvailableMonthsForYear);
router.get('/metrics/data/:year/:month', getMetricsForYearMonth);



export default router;