import express from 'express';

import { 
    getUnvalidatedFarmerInputs, 
    getValidatedFarmerInputs, 
    createFarmerAccount, //manipulate data
    deleteFarmerAccount,
    getFarmerAccounts,
    getFarmerAccountById,
    updateFarmerAccount, //manipulate data
    createUnifiedFarmerResponse, //manipulate data
    getAvailableMetricsYears,
    getAvailableMonthsForYear,
    getMetricsForYearMonth
 } from '../controller/high-value-crops/adminDashboard.controller.js'; 

import { 
    getAvailableDateRanges, 
    generateExcelReport //manipulate data
} from '../controller/high-value-crops/genReports.controller.js';

import {
    submitCompleteFarmerForm,
    getFarmerAccountByName
} from '../controller/high-value-crops/farmerForm.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';


const router = express.Router();


//________________________________ DASHBOARD (NEW REPONSES) PAGE ____________________________________


router.get('/get-unvalidated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getUnvalidatedFarmerInputs);
router.get('/get-validated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getValidatedFarmerInputs);


//________________________________ DASHBOARD (FARMERS) PAGE ____________________________________


router.post('/create-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), createFarmerAccount);
router.post('/delete-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), deleteFarmerAccount);
router.get('/get-farmer-accounts', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccounts);
router.post('/get-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccountById);
router.post('/create-unified-farmer-response', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), createUnifiedFarmerResponse);
router.put('/farmer-accounts/update', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), updateFarmerAccount);


//________________________________ DASHBOARD (METRICS) PAGE ____________________________________


router.get('/metrics/available-years', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getAvailableMetricsYears);
router.get('/metrics/available-months/:year', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getAvailableMonthsForYear);
router.get('/metrics/data/:year/:month', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getMetricsForYearMonth);


//________________________________ DASHBOARD (GENERATE REPORTS) PAGE ____________________________________


router.get('/report-date-ranges/:year/:month', verifyAuthToken, verifyRole(['HVCM']), getAvailableDateRanges);
router.post('/generate-excel-report', verifyAuthToken, verifyRole(['HVCM']), generateExcelReport);


//________________________________ FARMER FORM PAGES ____________________________________


router.post('/farmer-form-submission', submitCompleteFarmerForm)
router.post('/get-farmer-account-by-name', getFarmerAccountByName);



export default router;