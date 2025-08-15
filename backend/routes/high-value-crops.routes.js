import express from 'express';

import { 
    getUnvalidatedFarmerInputs, 
    //getValidatedFarmerInputs, // not in use
    createFarmerAccount, //manipulate data
    deleteFarmerAccount,
    getFarmerAccounts,
    getFarmerAccountByNameUser, 
    //getFarmerAccountById, // not in use
    updateFarmerAccount, //manipulate data
    createUnifiedFarmerResponse, //manipulate data
    flagResponseForReview,
    unflagResponseForReview,
    getAvailableMetricsYears,
    getAvailableMonthsForYear,
    getMetricsForYearMonth,
    updateFarmerResponseFields,
    deleteFarmerResponse,
    formStatusEnable,
    formStatusDisable,
    checkFormStatus
 } from '../controller/high-value-crops/adminDashboard.controller.js'; 

import { 
    getAvailableDateRanges, 
    generateHVCSaMPR, //manipulate data
    getAvailableBarangays
} from '../controller/high-value-crops/genReports.controller.js';

import {
    submitCompleteFarmerForm,
    getFarmerAccountByName
} from '../controller/high-value-crops/farmerForm.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';
import { ensureHvcFormOpen } from '../middleware/verifyHVCFormStatus.js';


const router = express.Router();


//________________________________ DASHBOARD (NEW REPONSES) PAGE ____________________________________


router.get('/get-unvalidated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getUnvalidatedFarmerInputs);
//router.get('/get-validated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getValidatedFarmerInputs);
router.post('/flag-response-for-review/:farmerId', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), flagResponseForReview);
router.post('/unflag-response-for-review/:farmerId', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), unflagResponseForReview);
router.post('/form-status-enable', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), formStatusEnable);
router.post('/form-status-disable', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), formStatusDisable);


//________________________________ DASHBOARD (FARMERS) PAGE ____________________________________


router.post('/create-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), createFarmerAccount);
router.post('/delete-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), deleteFarmerAccount);
router.get('/get-farmer-accounts', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccounts);
router.post('/get-farmer-account-by-name-user', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccountByNameUser);
//router.post('/get-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccountById);
router.post('/create-unified-farmer-response', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), createUnifiedFarmerResponse);
router.put('/farmer-accounts/update', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), updateFarmerAccount);
router.post('/update-farmer-response-fields', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), updateFarmerResponseFields);
router.post('/delete-farmer-response', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), deleteFarmerResponse);


//________________________________ DASHBOARD (METRICS) PAGE ____________________________________


router.get('/metrics/available-years', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getAvailableMetricsYears);
router.get('/metrics/available-months/:year', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getAvailableMonthsForYear);
router.get('/metrics/data/:year/:month', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getMetricsForYearMonth);


//________________________________ DASHBOARD (GENERATE REPORTS) PAGE ____________________________________


router.get('/report-date-ranges/:year/:month', verifyAuthToken, verifyRole(['HVCM']), getAvailableDateRanges);
router.get('/available-barangays/:year/:month', verifyAuthToken, verifyRole(['HVCM']), getAvailableBarangays);
router.post('/generate-hvc-sampr', verifyAuthToken, verifyRole(['HVCM']), generateHVCSaMPR);


//________________________________ FARMER FORM PAGES ____________________________________


router.post('/farmer-form-submission', ensureHvcFormOpen, submitCompleteFarmerForm);
router.post('/get-farmer-account-by-name', ensureHvcFormOpen, getFarmerAccountByName);
router.get('/check-form-status', checkFormStatus);


export default router;