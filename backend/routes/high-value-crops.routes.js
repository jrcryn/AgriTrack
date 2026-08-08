import express from 'express';
import multer from 'multer';

import { 
    getUnvalidatedFarmerInputs, 
    createFarmerAccount, //manipulate data
    archiveFarmerAccount,
    unarchiveFarmerAccount,
    getFarmerAccounts,
    getArchivedFarmerAccounts,

    getFarmerAccountByNameUser, 
    updateFarmerAccount, //manipulate data
    createUnifiedFarmerResponse, //manipulate data
    flagResponseForReview,
    unflagResponseForReview,
    getAvailableMetricsYears,
    getAvailableMonthsForYear,
    getMetricsForYearMonth,

    //deleteFarmerResponse,
    formStatusEnable,
    formStatusDisable,
    checkFormStatus,
    getUnvalidatedArchivedFarmerInputs,
    archiveResponse,
    unarchiveResponse,

    requestEdit,
    getRequestEditDetailsForFarmerView,
    handleConsentForEditRequest,
    updateFarmerResponseFields,

    createValidationScheduleVisit,
    setValidationVisitCompleted,
    approveValidationVisitDetails,
    rejectValidationVisitDetails,
 } from '../controller/high-value-crops/adminDashboard.controller.js'; 

import { 
    getAvailableDateRanges, 
    generateHVCSaMPR, //manipulate data
    getAvailableBarangays,
    generateHVCPR
} from '../controller/high-value-crops/genReports.controller.js';

import {
    submitMultipleFarmerForms
} from '../controller/high-value-crops/farmerForm.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';
import { ensureHvcFormOpen } from '../middleware/verifyHVCFormStatus.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();


//________________________________ DASHBOARD (NEW REPONSES) PAGE ____________________________________


router.get('/get-unvalidated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getUnvalidatedFarmerInputs);
//router.get('/get-validated-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getValidatedFarmerInputs);
router.post('/flag-response-for-review/:farmerId', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/unflag-response-for-review/:farmerId', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/form-status-enable', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/form-status-disable', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.post('/archive-response', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/unarchive-response', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.get('/get-unvalidated-archived-inputs', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getUnvalidatedArchivedFarmerInputs);

router.post('/request-edit', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.get('/get-edit-request-details-for-farmer-view/:id', getRequestEditDetailsForFarmerView);
router.post('/handle-consent-for-edit-request', (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/update-farmer-response-fields/:farmerId', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})); //sa new responses page dapat ito

router.post('/create-validation-schedule-visit', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.post(
  '/set-validation-visit-completed', 
  verifyAuthToken, 
  verifyRole(['HVCM', 'HVCS']), 
  upload.fields([
    { name: 'proofImage', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})
);

router.post('/approve-validation-visit-details', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/reject-validation-visit-details', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));


//________________________________ DASHBOARD (FARMERS) PAGE ____________________________________


router.post('/create-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.post('/archive-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/unarchive-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.get('/get-farmer-accounts', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccounts);
router.get('/get-archived-farmer-accounts', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getArchivedFarmerAccounts);

router.post('/get-farmer-account-by-name-user', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccountByNameUser);
//router.post('/get-farmer-account', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getFarmerAccountById);
router.post('/create-unified-farmer-response', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.put('/farmer-accounts/update', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));


//________________________________ DASHBOARD (METRICS) PAGE ____________________________________


router.get('/metrics/available-years', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getAvailableMetricsYears);
router.get('/metrics/available-months/:year', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getAvailableMonthsForYear);
router.get('/metrics/data/:year/:month', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getMetricsForYearMonth);


//________________________________ DASHBOARD (GENERATE REPORTS) PAGE ____________________________________


router.get('/report-date-ranges/:year/:month', verifyAuthToken, verifyRole(['HVCM']), getAvailableDateRanges);
router.get('/available-barangays/:year/:month', verifyAuthToken, verifyRole(['HVCM', 'HVCS']), getAvailableBarangays);
router.post('/generate-hvc-sampr', verifyAuthToken, verifyRole(['HVCM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/generate-hvc-pr', verifyAuthToken, (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));


//________________________________ FARMER FORM PAGES ____________________________________


//router.post('/farmer-form-submission', ensureHvcFormOpen, submitCompleteFarmerForm); // need ng way para ma-verify muna kung nahanap ba talaga (JWT probably again?) yung farmer bago magsubmit ng form, otherwise, reject ung submission. create middleware.
router.post('/farmer-forms-bulk-submission', ensureHvcFormOpen, submitMultipleFarmerForms);
router.get('/check-form-status', checkFormStatus);



export default router;