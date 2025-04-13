import express from 'express';

import { 
    getUnvalidatedFarmerInputs, 
    getValidatedFarmerInputs, 
    createFarmerAccount, 
    getFarmerAccounts,
    getFarmerAccountById,
    updateFarmerAccount,
    createUnifiedFarmerResponse,
    getAvailableMetricsYears,
    getAvailableMonthsForYear,
    getMetricsForYearMonth
 } from '../controller/high-value-crops/adminDashboard.controller.js'; 

import { 
    getAvailableDateRanges, 
    generateExcelReport 
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


const router = express.Router();


//________________________________ DASHBOARD (NEW REPONSES) PAGE ____________________________________


router.get('/get-unvalidated-inputs', getUnvalidatedFarmerInputs);
router.get('/get-validated-inputs', getValidatedFarmerInputs);


//________________________________ DASHBOARD (FARMERS) PAGE ____________________________________


router.post('/create-farmer-account', createFarmerAccount);
router.get('/get-farmer-accounts', getFarmerAccounts);
router.post('/get-farmer-account', getFarmerAccountById);
router.post('/create-unified-farmer-response', createUnifiedFarmerResponse);
router.put('/farmer-accounts/update', updateFarmerAccount);


//________________________________ DASHBOARD (METRICS) PAGE ____________________________________


router.get('/metrics/available-years', getAvailableMetricsYears);
router.get('/metrics/available-months/:year', getAvailableMonthsForYear);
router.get('/metrics/data/:year/:month', getMetricsForYearMonth);


//________________________________ DASHBOARD (GENERATE REPORTS) PAGE ____________________________________


router.get('/report-date-ranges/:year/:month', getAvailableDateRanges);
router.post('/generate-excel-report', generateExcelReport);


//________________________________ FARMER FORM PAGES ____________________________________


router.post('/farmerForm-a', formA_fi);
router.post('/farmerForm-b', formB_ct);
router.post('/farmerForm-c1-cri', formC1_cri);
router.post('/farmerForm-c2-cro', formC2_cro);
router.post('/farmerForm-d1-cih', formD1_cih);
router.post('/farmerForm-d1-cin', formD1_cin);
router.post('/farmerForm-d2-bc-ofh', formD2_bc_ofh);
router.post('/farmerForm-d2-bc-ofn', formD2_bc_ofn);


export default router;