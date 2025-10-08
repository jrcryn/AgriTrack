import { FarmerAccountSchema } from './schemas/farmerAccount.schema.js';
import { EmployeeAccountSchema } from './schemas/employeeAccount.schema.js';

import { getGlobalDB } from '../../config/dbAccessHelper.js';

// Create and export models with the global database
export const initializeGlobalModels = () => {
  const db = getGlobalDB();

  return {
    FarmerAccount: db.model('Farmer_Account', FarmerAccountSchema),
    EmployeeAccount: db.model('Employee_Account', EmployeeAccountSchema),
  };
};