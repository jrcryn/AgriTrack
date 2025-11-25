import { Router } from 'express';
import { 
  submitCompleteFarmerForm, 
  submitMultipleFarmerForms 
} from '../controller/high-value-crops/farmerForm.controller.js';

const router = Router();

// Single form submission endpoint
router.post('/farmer-form', submitCompleteFarmerForm);

// Bulk submission endpoint
router.post('/farmer-forms-bulk-submission', submitMultipleFarmerForms);

export default router;