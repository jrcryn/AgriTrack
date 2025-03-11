import { A_farmer_inputs } from '../models/A_farmerInputs.model.js';
import { B_crop_types } from '../models/B_cropTypes.model.js';
import { C_crop_records_indus } from '../models/C1_cropRecordsIndus.model.js';
import { C_crop_records_others } from '../models/C2_cropRecordsOthers.model.js';
import { D1_crop_indus_new } from '../models/D1_cropIndusNew.model.js';
import { D1_crop_indus_harvest } from '../models/D1_cropIndusHarvest.model.js';
import { D2_bc_other_fct_new } from '../models/D2_bc-other-fctNew.model.js';
import { D2_bc_other_fct_harvest } from '../models/D2_bc-other-fctHarvest.model.js';

// Fetch all farmer inputs with their referenced documents
export const getAllFarmerInputs = async (req, res) => {
  try {
    const farmerInputs = await A_farmer_inputs.find().lean();
    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      let cropRecord, cropDetails;

      if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        cropRecord = await C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      } else {
        cropRecord = await C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
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
    res.status(500).json({ message: 'Error fetching farmer inputs', error });
  }
};

// Update farmer input and its referenced documents
export const updateFarmerInput = async (req, res) => {
  const { farmerInputId, farmerInputData, cropTypeData, cropRecordData, cropDetailsData } = req.body;

  try {
    const farmerInput = await A_farmer_inputs.findByIdAndUpdate(farmerInputId, farmerInputData, { new: true });
    const cropType = await B_crop_types.findOneAndUpdate({ farmer_input_id: farmerInputId }, cropTypeData, { new: true });

    let cropRecord, cropDetails;
    if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await C_crop_records_indus.findOneAndUpdate({ farmer_input_id: farmerInputId }, cropRecordData, { new: true });
      if (cropRecord.crop_stage === 'NEWLY PLANTED') {
        cropDetails = await D1_crop_indus_new.findOneAndUpdate({ record_id: cropRecord._id }, cropDetailsData, { new: true });
      } else if (cropRecord.crop_stage === 'HARVESTING') {
        cropDetails = await D1_crop_indus_harvest.findOneAndUpdate({ record_id: cropRecord._id }, cropDetailsData, { new: true });
      }
    } else {
      cropRecord = await C_crop_records_others.findOneAndUpdate({ farmer_input_id: farmerInputId }, cropRecordData, { new: true });
      if (cropRecord.crop_stage === 'NEWLY PLANTED') {
        cropDetails = await D2_bc_other_fct_new.findOneAndUpdate({ record_id: cropRecord._id }, cropDetailsData, { new: true });
      } else if (cropRecord.crop_stage === 'HARVESTING') {
        cropDetails = await D2_bc_other_fct_harvest.findOneAndUpdate({ record_id: cropRecord._id }, cropDetailsData, { new: true });
      }
    }

    res.json({ farmerInput, cropType, cropRecord, cropDetails });
  } catch (error) {
    res.status(500).json({ message: 'Error updating farmer input', error });
  }
};
