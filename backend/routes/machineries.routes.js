import express from 'express';

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
    declineTicketRequest,
    getPlannedWeeklySchedules,
    updateWeeklySchedule,
    getInProgressWeeklySchedules
} from '../controller/machineries/adminDashboard.controller.js';

import { generateMachineryExcelReport } from '../controller/machineries/genReports.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

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
router.post('/decline-ticket-requests', declineTicketRequest); //working frontend
router.post('/create-weekly-schedule', createWeeklySchedule); //working frontend
router.post('/remove-from-schedule/:ticketRequestId', removeTicketRequestFromSchedule); //working frontend
router.post('/move-to-schedule', moveTicketRequestToASchedule);  // working frontend
router.post('/update-weekly-schedule', updateWeeklySchedule); // for review


// Public API routes
router.get('/get-available-machinery-types', formGetAvailableMachineryTypes); //working
router.post('/submit-ticket-request', createTicketRequestForm); //working
export default router;