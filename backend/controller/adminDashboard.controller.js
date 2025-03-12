import { A_farmer_inputs } from '../models/A_farmerInputs.model.js';
import { B_crop_types } from '../models/B_cropTypes.model.js';
import { C_crop_records_indus } from '../models/C1_cropRecordsIndus.model.js';
import { C_crop_records_others } from '../models/C2_cropRecordsOthers.model.js';
import { D1_crop_indus_new } from '../models/D1_cropIndusNew.model.js';
import { D1_crop_indus_harvest } from '../models/D1_cropIndusHarvest.model.js';
import { D2_bc_other_fct_new } from '../models/D2_bc-other-fctNew.model.js';
import { D2_bc_other_fct_harvest } from '../models/D2_bc-other-fctHarvest.model.js';


// Get all unvalidated farmer inputs with their referenced documents
export const getUnvalidatedFarmerInputs = async (req, res) => {
  try {
    // Only find farmer inputs where isValidated is false
    const farmerInputs = await A_farmer_inputs.find({ isValidated: false }).lean();
    
    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
      // Handle case where no crop type exists
      if (!cropType) {
        return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
      }
      
      let cropRecord, cropDetails;

      if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        cropRecord = await C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      } else {
        cropRecord = await C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      }

      return {
        farmerInput,
        cropType,
        cropRecord,
        cropDetails
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unvalidated farmer inputs', error: error.message });
  }
};





// Get all validated farmer inputs with their referenced documents
export const getValidatedFarmerInputs = async (req, res) => {
  try {
    // Only find farmer inputs where isValidated is true
    const farmerInputs = await A_farmer_inputs.find({ isValidated: true }).lean();
    
    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
      // Handle case where no crop type exists
      if (!cropType) {
        return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
      }
      
      let cropRecord, cropDetails;

      if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        cropRecord = await C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      } else {
        cropRecord = await C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      }

      return {
        farmerInput,
        cropType,
        cropRecord,
        cropDetails
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching validated farmer inputs', error: error.message });
  }
};






