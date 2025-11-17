import express from 'express';
import multer from 'multer';

import { 
    createTicketRequestForm,
    createMachineriesType,
    updateMachineryType,
    addMachineryUnit,
    updateMachineryUnit,
    createWeeklySchedule,
    removeTicketRequestFromSchedule,
    moveTicketRequestToASchedule,
    formGetAvailableMachineryTypes,
    getMachineryTypes,
    getPendingTicketRequests,
    getMachineryUnits,
    getOngoingTicketRequests,
    getScheduledTicketRequests,
    getDeclinedTicketRequests,
    getOperatorsList,
    getMachineryUnitsForDropDown,
    archiveTicketRequest,
    //declineTicketRequest,
    getPlannedWeeklySchedules,
    updateWeeklySchedule,
    getInProgressWeeklySchedules,
    //undeclineTicketRequest, // added
    setRequestTicketToComplete,

    getPendingExtensionRequestsCount,
    approveExtensionRequest,
    declineExtensionRequest,

    deleteScheduleAndTickets
} from '../controller/machineries/adminDashboard.controller.js';

import { generateMachineryExcelReport } from '../controller/machineries/genReports.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/generate-machinery-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), generateMachineryExcelReport);



router.post('/create-machinery-type', createMachineriesType); //working
router.put('/update-machinery-type', updateMachineryType);
router.get('/get-machinery-types', getMachineryTypes);

router.post('/create-machinery-unit', addMachineryUnit); //working
router.post('/update-machinery-unit', updateMachineryUnit);
router.post('/get-machinery-unit', getMachineryUnits);

router.get('/get-pending-ticket-requests', getPendingTicketRequests); //working frontend
router.get('/get-ongoing-ticket-requests', getOngoingTicketRequests);
router.get('/get-scheduled-ticket-requests', getScheduledTicketRequests);
router.get('/get-declined-ticket-requests', getDeclinedTicketRequests); 
router.get('/get-operators-list', getOperatorsList); //working frontend
router.get('/get-machinery-units-for-dropdown', getMachineryUnitsForDropDown); //working frontend
router.get('/get-planned-weekly-schedules', getPlannedWeeklySchedules); //working frontend
router.get('/get-in-progress-weekly-schedules', getInProgressWeeklySchedules);

router.post('/archive-ticket-request', archiveTicketRequest);
//router.post('/decline-ticket-requests', declineTicketRequest); //working frontend
router.post('/create-weekly-schedule', createWeeklySchedule); //working frontend
router.post('/remove-from-schedule/:ticketRequestId', removeTicketRequestFromSchedule); //working frontend
router.post('/move-to-schedule', moveTicketRequestToASchedule);  // working frontend
router.post('/update-weekly-schedule', updateWeeklySchedule); // for review
//router.post('/undecline-ticket-request', undeclineTicketRequest); // new route
router.post('/ticket-request-complete', 
  upload.fields([
    { name: 'proofImage', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  setRequestTicketToComplete
); // being tested


// Public API routes
router.get('/get-available-machinery-types', formGetAvailableMachineryTypes); //working
router.post('/submit-ticket-request', createTicketRequestForm); //working

router.get('/pending-extension-count', getPendingExtensionRequestsCount);
router.post('/approve-extension-request', approveExtensionRequest);
router.post('/decline-extension-request', declineExtensionRequest);

router.post('/delete-schedule-and-tickets/:scheduleId', deleteScheduleAndTickets);
export default router;