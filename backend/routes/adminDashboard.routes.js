import express from 'express';
import {
    createTicketRequestForm,
    declineTicketRequest,
    archiveTicketRequest,
    createMachineriesType,
    updateMachineryType,
    addMachineryUnit,
    updateMachineryUnit,
    createWeeklySchedule,
    updateWeeklySchedule,
    removeTicketRequestFromSchedule,
    moveTicketRequestToASchedule,
    undeclineTicketRequest,
    setRequestTicketToComplete,
    getPendingTicketRequests,
    getOngoingTicketRequests,
    getScheduledTicketRequests,
    getDeclinedTicketRequests,
    getOperatorsList,
    getPlannedWeeklySchedules,
    getInProgressWeeklySchedules
} from '../controller/machineries/adminDashboard.controller.js';

const router = express.Router();
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

//PROCESS
router.post('/ticket-request', createTicketRequestForm);
router.post('/ticket-request/decline', declineTicketRequest);
router.post('/ticket-request/archive', archiveTicketRequest);

router.post('/machinery-type', createMachineriesType);
router.put('/machinery-type', updateMachineryType);

router.post('/machinery-unit', addMachineryUnit);
router.put('/machinery-unit', updateMachineryUnit);

router.post('/weekly-schedule', createWeeklySchedule);
router.put('/weekly-schedule', updateWeeklySchedule);

router.post('/remove-ticket-request-from-schedule/:ticketRequestId', removeTicketRequestFromSchedule);
router.post('/move-ticket-request-to-schedule', moveTicketRequestToASchedule);
router.post('/undecline-ticket-request', undeclineTicketRequest);
router.post('/ticket-request-complete', 
  upload.fields([
    { name: 'proofImage', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  setRequestTicketToComplete
);

//FETCH
router.get('/pending-ticket-requests', getPendingTicketRequests);
router.get('/ongoing-ticket-requests', getOngoingTicketRequests);
router.get('/scheduled-ticket-requests', getScheduledTicketRequests);
router.get('/declined-ticket-requests', getDeclinedTicketRequests);
router.get('/operators-list', getOperatorsList);
router.get('/planned-weekly-schedules', getPlannedWeeklySchedules);
router.get('/in-progress-weekly-schedules', getInProgressWeeklySchedules);

export default router;