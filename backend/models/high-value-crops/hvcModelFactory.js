import { getHighValueCropsDB } from '../../config/dbAccessHelper.js';

// Import all schemas
import { AFarmerInputsSchema } from './schemas/A_farmerInputs.schema.js';
import { BCropTypesSchema } from './schemas/B_cropTypes.schema.js';
import { C1CropRecordsIndusSchema } from './schemas/C1_cropRecordsIndus.schema.js';
import { C2CropRecordsOthersSchema } from './schemas/C2_cropRecordsOthers.schema.js';
import { D1CropIndusNewSchema } from './schemas/D1_cropIndusNew.schema.js';
import { D1CropIndusHarvestSchema } from './schemas/D1_cropIndusHarvest.schema.js';
import { D2BcOtherFctNewSchema } from './schemas/D2_bc-other-fctNew.schema.js';
import { D2BcOtherFctHarvestSchema } from './schemas/D2_bc-other-fctHarvest.schema.js';

import { FormStatus } from './schemas/formStatus.js';

import { FarmerAccountSchema } from '../global/schemas/farmerAccount.schema.js';
import { HVCManagerSchema } from './schemas/hvcManagerAccount.schema.js';
import { HVCStaffSchema } from './schemas/hvcStaffAccount.schema.js';

import { CounterSchema } from './schemas/counter.schema.js';

import { UnifiedFarmerRecordSchema } from './schemas/unifiedFarmerResponse.schema.js';

// Create and export models with the high-value-crops database
export const initializeHighValueCropsModels = () => {
  const db = getHighValueCropsDB();
  
  return {
    A_farmer_inputs: db.model('A_farmer_inputs', AFarmerInputsSchema),
    B_crop_types: db.model('B_crop_types', BCropTypesSchema),
    C_crop_records_indus: db.model('C1_crop_records_indus', C1CropRecordsIndusSchema),
    C_crop_records_others: db.model('C2_crop_records_others', C2CropRecordsOthersSchema),
    D1_crop_indus_new: db.model('D1_crop_indus_new', D1CropIndusNewSchema),
    D1_crop_indus_harvest: db.model('D1_crop_indus_harvest', D1CropIndusHarvestSchema),
    D2_bc_other_fct_new: db.model('D2_bc_other_fct_new', D2BcOtherFctNewSchema),
    D2_bc_other_fct_harvest: db.model('D2_bc_other_fct_harvest', D2BcOtherFctHarvestSchema),
    FormStatus: db.model('FormStatus', FormStatus),

    FarmerAccount: db.model('Farmer_Account', FarmerAccountSchema),
    ManagerAccount: db.model('Manager_Account', HVCManagerSchema),
    StaffAccount: db.model('Staff_Account', HVCStaffSchema),
    Counter: db.model('Counter', CounterSchema)
  };
};

// Factory function for unified farmer records with year-based collections
export const getUnifiedFarmerRecordModel = (year) => {
  if (!year) {
    year = new Date().getFullYear();
  }
  
  const db = getHighValueCropsDB();
  const collectionName = `UnifiedFarmerRecord_${year}`;
  
  // Check if model already exists to prevent recompiling
  return db.models[collectionName] || 
         db.model(collectionName, UnifiedFarmerRecordSchema, `unified_farmer_records_${year}`);
};