import express from 'express';
import multer from 'multer';

import { 
    createTicketRequestForm,
    createMachineriesType,
    //updateMachineryType,
    addMachineryUnit,
    createWeeklySchedule,
    removeTicketRequestFromSchedule,
    moveTicketRequestToASchedule,
    availableMachineryTypes,
    getPendingTicketRequests,
    getOperatorsList,
    getMachineryUnitsForDropDown,
    getPlannedWeeklySchedules,
    updateWeeklySchedule,
    getInProgressWeeklySchedules,
    setRequestTicketToComplete,

    getPendingExtensionRequestsCount,
    approveExtensionRequest,
    declineExtensionRequest,
    setExtenstionTicketToComplete,
    getOccupiedDatesForScheduling,
    getMachineUnits,
    getMachineOverview,
    //updateMachineryUnitStatus,
    getMachineTypesForAddingUnits,
    getTicketStatusCounts,
    getUpcomingAndOngoingSchedules,
    disableOperator,
    enableOperator,
    getAllOperators,
    getOperatorAssignedNumbers,
    addOperatorLicense,
    updateOperatorLicense,
    removeOperatorLicense,
    setEmployeeLeaveStatus,
    getMachineTypeUnitCounts,
    declineIncidentReport,
    resolveIncidentReport,
    confirmIncidentReport,
    getPendingIncidentReportsCount,
    getMachineIncidentReports,
    performMachineCountCheck,
    resolveDiscrepancyInPhysicalCount,
    getMachineunitsForPhysicalCounting,
    getPhysicalCountingRecords,

    formStatusEnable,
    formStatusDisable,
    checkFormStatus,
    
    //deleteScheduleAndTickets
} from '../controller/machineries/adminDashboard.controller.js';

import { exportMachineriesUsageReport } from '../controller/machineries/genReports.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/generate-machinery-report', verifyAuthToken, verifyRole(['MIM']), exportMachineriesUsageReport);



router.post('/create-machinery-type', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})); 
//router.put('/update-machinery-type', verifyAuthToken, verifyRole(['MIM']), updateMachineryType);
router.post('/create-machinery-unit', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})); 

router.get('/get-pending-ticket-requests', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPendingTicketRequests); 
router.get('/get-operators-list', verifyAuthToken, verifyRole(['MIM', 'MIS']), getOperatorsList); 
router.get('/get-machinery-units-for-dropdown', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineryUnitsForDropDown); 
router.get('/get-planned-weekly-schedules', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPlannedWeeklySchedules); 
router.get('/get-in-progress-weekly-schedules', verifyAuthToken, verifyRole(['MIM', 'MIS']), getInProgressWeeklySchedules);

router.post('/create-weekly-schedule', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})); 
router.post('/remove-from-schedule/:ticketRequestId', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})); 
router.post('/move-to-schedule', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));  
router.post('/update-weekly-schedule', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})); 
router.post('/ticket-request-complete', 
  verifyAuthToken, 
  verifyRole(['MIM', 'MIS']),
  upload.fields([
    { name: 'proofImage', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})
); // being tested


// Public API routes
router.get('/get-available-machinery-types', availableMachineryTypes); 
router.post('/submit-ticket-request', createTicketRequestForm); 

router.get('/pending-extension-count', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPendingExtensionRequestsCount);
router.get('/pending-incident-reports-count', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPendingIncidentReportsCount);
router.post('/approve-extension-request', verifyAuthToken, verifyRole(['MIM', 'MIS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/decline-extension-request', verifyAuthToken, verifyRole(['MIM', 'MIS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/extension-ticket-complete', 
  verifyAuthToken, 
  verifyRole(['MIM', 'MIS']),
  upload.fields([
    { name: 'proofImage', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."})
);
router.post('/get-occupied-dates-for-scheduling', verifyAuthToken, verifyRole(['MIM']), getOccupiedDatesForScheduling);
router.get('/get-machine-units', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineUnits);
router.get('/get-machine-overview', verifyAuthToken, verifyRole(['MIM','MIS' ]), getMachineOverview);
//router.post('/update-machinery-unit-status', verifyAuthToken, verifyRole(['MIM', 'MIS']), updateMachineryUnitStatus);
router.get('/get-machine-types-for-adding-units', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineTypesForAddingUnits);
router.get('/get-machine-type-unit-counts', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineTypeUnitCounts);

router.get('/get-ticket-status-counts', verifyAuthToken, verifyRole(['MIM']), getTicketStatusCounts);
router.get('/get-upcoming-and-ongoing-schedules', verifyAuthToken, verifyRole(['MIM']), getUpcomingAndOngoingSchedules);

router.post('/disable-operator', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/enable-operator', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.get('/get-all-operators', getAllOperators);
router.get('/get-operators-assigned-numbers', verifyAuthToken, verifyRole(['MIM']), getOperatorAssignedNumbers);
router.post('/add-operator-license', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.put('/update-operator-license', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/remove-operator-license', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/set-employee-leave-status', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.post('/decline-incident-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/resolve-incident-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/confirm-incident-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.get('/get-machine-incident-reports', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineIncidentReports);
router.get('/get-machine-units-for-physical-counting', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineunitsForPhysicalCounting);
router.get('/get-physical-counting-records', getPhysicalCountingRecords);
router.post('/perform-machine-count-check', verifyAuthToken, verifyRole(['MIM', 'MIS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/resolve-discrepancy-in-physical-count', verifyAuthToken, verifyRole(['MIM', 'MIS']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));

router.post('/form-status-enable', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.post('/form-status-disable', verifyAuthToken, verifyRole(['MIM']), (req, res) => res.status(403).json({success:false, message: "Disabled in demo version."}));
router.get('/check-form-status', checkFormStatus);

//router.post('/delete-schedule-and-tickets/:scheduleId', deleteScheduleAndTickets); //FOR DEBUGGING AND TESTING PURPOSES ONLY
export default router;