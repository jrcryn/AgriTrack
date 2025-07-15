import express from 'express';

import { 
    getUnvalidatedFarmerInputs, 
    getValidatedFarmerInputs, 
    createFarmerAccount, //manipulate data
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
    formA_fi,
    formB_ct,
    formC1_cri,
    formC2_cro,
    formD1_cih,
    formD1_cin,
    formD2_bc_ofh,
    formD2_bc_ofn
} from '../controller/high-value-crops/farmerForm.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';


const router = express.Router();


//________________________________ DASHBOARD (NEW REPONSES) PAGE ____________________________________


router.get('/get-unvalidated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getUnvalidatedFarmerInputs);
router.get('/get-validated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getValidatedFarmerInputs);


//________________________________ DASHBOARD (FARMERS) PAGE ____________________________________


router.post('/create-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), createFarmerAccount);
router.get('/get-farmer-accounts', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccounts);
router.post('/get-farmer-account', getFarmerAccountById, verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccountById); // NEEDS FIXING: REFER TO NOTES KUNG NAKALIMUTAN NA, PAGE 8 STARTING FROM THE FIRST WRITTEN PAGE
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


router.post('/farmerForm-a', formA_fi);
router.post('/farmerForm-b', formB_ct);
router.post('/farmerForm-c1-cri', formC1_cri);
router.post('/farmerForm-c2-cro', formC2_cro);
router.post('/farmerForm-d1-cih', formD1_cih);
router.post('/farmerForm-d1-cin', formD1_cin);
router.post('/farmerForm-d2-bc-ofh', formD2_bc_ofh);
router.post('/farmerForm-d2-bc-ofn', formD2_bc_ofn);
router.post('/get-farmer-account-by-id', getFarmerAccountById, verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccountById);



export default router;