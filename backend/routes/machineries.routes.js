import express from 'express';
import multer from 'multer';

import { 
    createTicketRequestForm,
    createMachineriesType,
    updateMachineryType,
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
    updateMachineryUnitStatus,
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
    
    deleteScheduleAndTickets
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



router.post('/create-machinery-type', verifyAuthToken, verifyRole(['MIM']), createMachineriesType); //working
router.put('/update-machinery-type', verifyAuthToken, verifyRole(['MIM']), updateMachineryType);
router.post('/create-machinery-unit', verifyAuthToken, verifyRole(['MIM']), addMachineryUnit); //working

router.get('/get-pending-ticket-requests', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPendingTicketRequests); //working frontend
router.get('/get-operators-list', verifyAuthToken, verifyRole(['MIM', 'MIS']), getOperatorsList); //working frontend
router.get('/get-machinery-units-for-dropdown', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineryUnitsForDropDown); //working frontend
router.get('/get-planned-weekly-schedules', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPlannedWeeklySchedules); //working frontend
router.get('/get-in-progress-weekly-schedules', verifyAuthToken, verifyRole(['MIM', 'MIS']), getInProgressWeeklySchedules);

router.post('/create-weekly-schedule', verifyAuthToken, verifyRole(['MIM']), createWeeklySchedule); //working frontend
router.post('/remove-from-schedule/:ticketRequestId', verifyAuthToken, verifyRole(['MIM']), removeTicketRequestFromSchedule); //working frontend
router.post('/move-to-schedule', verifyAuthToken, verifyRole(['MIM']), moveTicketRequestToASchedule);  // working frontend
router.post('/update-weekly-schedule', verifyAuthToken, verifyRole(['MIM']), updateWeeklySchedule); // for review
router.post('/ticket-request-complete', 
  verifyAuthToken, 
  verifyRole(['MIM', 'MIS']),
  upload.fields([
    { name: 'proofImage', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  setRequestTicketToComplete
); // being tested


// Public API routes
router.get('/get-available-machinery-types', availableMachineryTypes); //working
router.post('/submit-ticket-request', createTicketRequestForm); //working

router.get('/pending-extension-count', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPendingExtensionRequestsCount);
router.get('/pending-incident-reports-count', verifyAuthToken, verifyRole(['MIM', 'MIS']), getPendingIncidentReportsCount);
router.post('/approve-extension-request', verifyAuthToken, verifyRole(['MIM', 'MIS']), approveExtensionRequest);
router.post('/decline-extension-request', verifyAuthToken, verifyRole(['MIM', 'MIS']), declineExtensionRequest);
router.post('/extension-ticket-complete', 
  verifyAuthToken, 
  verifyRole(['MIM', 'MIS']),
  upload.fields([
    { name: 'proofImage', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  setExtenstionTicketToComplete
);
router.post('/get-occupied-dates-for-scheduling', verifyAuthToken, verifyRole(['MIM']), getOccupiedDatesForScheduling);
router.get('/get-machine-units', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineUnits);
router.get('/get-machine-overview', verifyAuthToken, verifyRole(['MIM','MIS' ]), getMachineOverview);
router.post('/update-machinery-unit-status', verifyAuthToken, verifyRole(['MIM', 'MIS']), updateMachineryUnitStatus);
router.get('/get-machine-types-for-adding-units', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineTypesForAddingUnits);
router.get('/get-machine-type-unit-counts', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineTypeUnitCounts);

router.get('/get-ticket-status-counts', verifyAuthToken, verifyRole(['MIM']), getTicketStatusCounts);
router.get('/get-upcoming-and-ongoing-schedules', verifyAuthToken, verifyRole(['MIM']), getUpcomingAndOngoingSchedules);

router.post('/disable-operator', verifyAuthToken, verifyRole(['MIM']), disableOperator);
router.post('/enable-operator', verifyAuthToken, verifyRole(['MIM']), enableOperator);
router.get('/get-all-operators', getAllOperators);
router.get('/get-operators-assigned-numbers', verifyAuthToken, verifyRole(['MIM']), getOperatorAssignedNumbers);
router.post('/add-operator-license', verifyAuthToken, verifyRole(['MIM']), addOperatorLicense);
router.put('/update-operator-license', verifyAuthToken, verifyRole(['MIM']), updateOperatorLicense);
router.post('/remove-operator-license', verifyAuthToken, verifyRole(['MIM']), removeOperatorLicense);
router.post('/set-employee-leave-status', verifyAuthToken, verifyRole(['MIM']), setEmployeeLeaveStatus);

router.post('/decline-incident-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), declineIncidentReport);
router.post('/resolve-incident-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), resolveIncidentReport);
router.post('/confirm-incident-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), confirmIncidentReport);

router.get('/get-machine-incident-reports', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineIncidentReports);
router.get('/get-machine-units-for-physical-counting', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineunitsForPhysicalCounting);
router.get('/get-physical-counting-records', getPhysicalCountingRecords);
router.post('/perform-machine-count-check', verifyAuthToken, verifyRole(['MIM', 'MIS']), performMachineCountCheck);
router.post('/resolve-discrepancy-in-physical-count', verifyAuthToken, verifyRole(['MIM', 'MIS']), resolveDiscrepancyInPhysicalCount);

router.post('/delete-schedule-and-tickets/:scheduleId', deleteScheduleAndTickets); //FOR DEBUGGING AND TESTING PURPOSES ONLY
export default router;