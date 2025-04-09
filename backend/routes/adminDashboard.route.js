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

import { getAvailableDateRanges, generateExcelReport } from '../controller/genReports.controller.js';


const router = express.Router();


//________________________________ DASHBOARD (NEW REPONSES) PAGE ____________________________________


router.get('/get-unvalidated-inputs', getUnvalidatedFarmerInputs);
router.get('/get-validated-inputs', getValidatedFarmerInputs);


//________________________________ DASHBOARD (FARMERS) PAGE ____________________________________


router.post('/create-farmer-account', createFarmerAccount);
router.get('/get-farmer-accounts', getFarmerAccounts);
router.post('/get-farmer-account', getFarmerAccountById);
router.post('/create-unified-farmer-response', createUnifiedFarmerResponse);


//________________________________ DASHBOARD (METRICS) PAGE ____________________________________


router.get('/metrics/available-years', getAvailableMetricsYears);
router.get('/metrics/available-months/:year', getAvailableMonthsForYear);
router.get('/metrics/data/:year/:month', getMetricsForYearMonth);


//________________________________ DASHBOARD (GENERATE REPORTS) PAGE ____________________________________


router.get('/report-date-ranges/:year/:month', getAvailableDateRanges);
router.post('/generate-excel-report', generateExcelReport);



export default router;