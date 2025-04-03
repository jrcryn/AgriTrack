import { A_farmer_inputs } from '../models/A_farmerInputs.model.js';
import { B_crop_types } from '../models/B_cropTypes.model.js';
import { C_crop_records_indus } from '../models/C1_cropRecordsIndus.model.js';
import { C_crop_records_others } from '../models/C2_cropRecordsOthers.model.js';
import { D1_crop_indus_new } from '../models/D1_cropIndusNew.model.js';
import { D1_crop_indus_harvest } from '../models/D1_cropIndusHarvest.model.js';
import { D2_bc_other_fct_new } from '../models/D2_bc-other-fctNew.model.js';
import { D2_bc_other_fct_harvest } from '../models/D2_bc-other-fctHarvest.model.js';

import { getUnifiedFarmerRecordModel } from '../models/unifiedFarmerResponse.model.js';

import { FarmerAccount } from '../models/farmerAccount.model.js';
import { Counter } from '../models/counter.model.js';


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





// Update farmer input and all referenced documents
export const updateFarmerInputAndReferences = async (req, res) => {
  try {
    const { farmerId, updateData } = req.body;

    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    // 1. Find the farmer input and check if it's unvalidated
    const farmerInput = await A_farmer_inputs.findById(farmerId);
    
    if (!farmerInput) {
      return res.status(404).json({ message: 'Farmer input not found' });
    }
    
    // Only unvalidated farmer inputs can be updated
    if (farmerInput.isValidated) {
      return res.status(400).json({ message: 'Cannot update already validated farmer input' });
    }

    // 2. Update the farmer input data if provided
    if (updateData.farmerInput) {
      const { surname, first_name, middle_name, suffix, farm_location } = updateData.farmerInput;
      
      if (surname) farmerInput.surname = surname;
      if (first_name) farmerInput.first_name = first_name;
      if (middle_name !== undefined) farmerInput.middle_name = middle_name;
      if (suffix !== undefined) farmerInput.suffix = suffix;
      if (farm_location) farmerInput.farm_location = farm_location;
    }

    // 3. Set the validation status to true
    farmerInput.isValidated = true;
    await farmerInput.save();

    // 4. Find and update the crop type
    const cropType = await B_crop_types.findOne({ farmer_input_id: farmerId });
    
    if (cropType && updateData.cropType) {
      cropType.crop_type = updateData.cropType;
      await cropType.save();
    }

    // 5. Find and update the appropriate crop record based on crop type
    let cropRecord;
    if (cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await C_crop_records_indus.findOne({ farmer_input_id: farmerId });
      
      if (cropRecord && updateData.cropRecord) {
        const { crop_type, crop_variety, crop_stage } = updateData.cropRecord;
        if (crop_type) cropRecord.crop_type = crop_type;
        if (crop_variety !== undefined) cropRecord.crop_variety = crop_variety;
        if (crop_stage) cropRecord.crop_stage = crop_stage;
        
        await cropRecord.save();
      }
    } else if (cropType) {
      cropRecord = await C_crop_records_others.findOne({ farmer_input_id: farmerId });
      
      if (cropRecord && updateData.cropRecord) {
        const { crop_variety, crop_stage } = updateData.cropRecord;
        if (crop_variety) cropRecord.crop_variety = crop_variety;
        if (crop_stage) cropRecord.crop_stage = crop_stage;
        
        await cropRecord.save();
      }
    }

    // 6. Find and update crop details based on crop type and stage
    if (cropRecord) {
      let cropDetails;
      
      if (cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await D1_crop_indus_new.findOne({ record_id: cropRecord._id });
          
          if (cropDetails && updateData.cropDetails) {
            const { plantation_start_date, plantation_end_date, harvest_month_year, total_area_planted } = updateData.cropDetails;
            
            if (plantation_start_date) cropDetails.plantation_start_date = plantation_start_date;
            if (plantation_end_date) cropDetails.plantation_end_date = plantation_end_date;
            if (harvest_month_year) cropDetails.harvest_month_year = harvest_month_year;
            if (total_area_planted) cropDetails.total_area_planted = total_area_planted;
            
            await cropDetails.save();
          }
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await D1_crop_indus_harvest.findOne({ record_id: cropRecord._id });
          
          if (cropDetails && updateData.cropDetails) {
            const { harvest_start_date, harvest_end_date, total_area_harvested, 
                   total_weight, destination, mode_of_payment, mode_of_delivery } = updateData.cropDetails;
            
            if (harvest_start_date) cropDetails.harvest_start_date = harvest_start_date;
            if (harvest_end_date) cropDetails.harvest_end_date = harvest_end_date;
            if (total_area_harvested) cropDetails.total_area_harvested = total_area_harvested;
            if (total_weight) cropDetails.total_weight = total_weight;
            if (destination) cropDetails.destination = destination;
            if (mode_of_payment) cropDetails.mode_of_payment = mode_of_payment;
            if (mode_of_delivery) cropDetails.mode_of_delivery = mode_of_delivery;
            
            await cropDetails.save();
          }
        }
      } else {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await D2_bc_other_fct_new.findOne({ record_id: cropRecord._id });
          
          if (cropDetails && updateData.cropDetails) {
            const { plantation_start_date, plantation_end_date, harvest_month_year, total_trees } = updateData.cropDetails;
            
            if (plantation_start_date) cropDetails.plantation_start_date = plantation_start_date;
            if (plantation_end_date) cropDetails.plantation_end_date = plantation_end_date;
            if (harvest_month_year) cropDetails.harvest_month_year = harvest_month_year;
            if (total_trees) cropDetails.total_trees = total_trees;
            
            await cropDetails.save();
          }
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id });
          
          if (cropDetails && updateData.cropDetails) {
            const { harvest_start_date, harvest_end_date, trees_harvested, 
                   total_weight, destination, mode_of_payment, mode_of_delivery } = updateData.cropDetails;
            
            if (harvest_start_date) cropDetails.harvest_start_date = harvest_start_date;
            if (harvest_end_date) cropDetails.harvest_end_date = harvest_end_date;
            if (trees_harvested) cropDetails.trees_harvested = trees_harvested;
            if (total_weight) cropDetails.total_weight = total_weight;
            if (destination) cropDetails.destination = destination;
            if (mode_of_payment) cropDetails.mode_of_payment = mode_of_payment;
            if (mode_of_delivery) cropDetails.mode_of_delivery = mode_of_delivery;
            
            await cropDetails.save();
          }
        }
      }
    }

    // 7. Return the updated data
    const updatedData = await getCompleteRecordById(farmerId);
    res.json({ 
      message: 'Farmer input and references updated successfully',
      data: updatedData
    });
    
  } catch (error) {
    console.error('Error updating farmer input:', error);
    res.status(500).json({ 
      message: 'Error updating farmer input and references', 
      error: error.message 
    });
  }
};





// Helper function to get complete record by farmer input ID
const getCompleteRecordById = async (farmerId) => {
  const farmerInput = await A_farmer_inputs.findById(farmerId).lean();
  if (!farmerInput) return null;
  
  const cropType = await B_crop_types.findOne({ farmer_input_id: farmerId }).lean();
  if (!cropType) return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
  
  let cropRecord, cropDetails;
  
  if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
    cropRecord = await C_crop_records_indus.findOne({ farmer_input_id: farmerId }).lean();
    if (!cropRecord) return { farmerInput, cropType, cropRecord: null, cropDetails: null };
    
    if (cropRecord.crop_stage === 'NEWLY PLANTED') {
      cropDetails = await D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
    } else if (cropRecord.crop_stage === 'HARVESTING') {
      cropDetails = await D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
    }
  } else {
    cropRecord = await C_crop_records_others.findOne({ farmer_input_id: farmerId }).lean();
    if (!cropRecord) return { farmerInput, cropType, cropRecord: null, cropDetails: null };
    
    if (cropRecord.crop_stage === 'NEWLY PLANTED') {
      cropDetails = await D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
    } else if (cropRecord.crop_stage === 'HARVESTING') {
      cropDetails = await D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
    }
  }

  return { farmerInput, cropType, cropRecord, cropDetails };
};


const getNextSequence = async (key) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// Create a new farmer account
export const createFarmerAccount = async (req, res) => {
  const { surname, first_name, middle_name, suffix, farm_location, mobile_number, facebook } = req.body;
  if (!surname || !first_name || !farm_location) {
    return res.status(400).json({ message: 'Please provide all the required fields.' });
  }

  // Check if farmer already exists
  if (first_name || mobile_number) {
    const farmerAlreadyExists = await FarmerAccount.findOne({ first_name }, { mobile_number });
    if (farmerAlreadyExists) {
      return res.status(400).json({ message: 'Farmer already exists in the system.' });
    }
  };

  try {
    const newNumber = await getNextSequence('farmer_account');
    const middleInitial = middle_name ? middle_name.charAt(0) : '';
    const firstInitials = first_name.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
    const initials = `${firstInitials}${middleInitial}${surname.charAt(0)}`;
    const formattedNumber = String(newNumber).padStart(4, '0');
    const farmerId = `F-${initials}-${formattedNumber}`;

    const newFarmerAccount = await FarmerAccount.create({
      farmerId,
      surname,
      first_name,
      middle_name,
      suffix,
      farm_location,
      mobile_number,
      facebook,
    });
    return res.status(201).json({
      message: 'Farmer account created successfully',
      data: newFarmerAccount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating farmer account', error });
  }
};


// Get all farmer accounts
export const getFarmerAccounts = async (req, res) => {
  try {
    const farmerAccounts = await FarmerAccount.find().lean();
    res.json(farmerAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farmer accounts', error: error.message });
  }
};


// Create unified farmer response
export const createUnifiedFarmerResponse = async (req, res) => {
  const { 
    surname, first_name, middle_name, suffix, farm_location,
    crop_type, crop_variety, crop_stage,
    plantation_start_date, plantation_end_date, harvest_month_year,
    total_area_planted, total_area_trees_planted,
    harvest_start_date, harvest_end_date, total_weight,
    crop_purpose, destination, mode_of_payment, mode_of_delivery,
    total_area_harvested, total_area_trees_harvested,
    original_farmer_input_id
  } = req.body;

  if (!surname || !first_name || !farm_location || !crop_type || !crop_stage || !original_farmer_input_id) {
    return res.status(400).json({ message: `Required data aren't provided.` });
  }

  try {
    // Determine the year based on available dates
    let year;
    if (crop_stage === 'NEWLY PLANTED') {
      // For newly planted, use plantation start date year lang 
      if (plantation_start_date) {
        year = new Date(plantation_start_date).getFullYear();
      } else {
        year = new Date().getFullYear();
      }
    } else {
      // For harvesting, use harvest date same sa taas
      if (harvest_start_date) {
        year = new Date(harvest_start_date).getFullYear();
      } else {
        year = new Date().getFullYear();
      }
    }
    
    // Get the appropriate model for this year
    const UnifiedFarmerRecordModel = getUnifiedFarmerRecordModel(year);
    
    const newUnifiedRecord = await UnifiedFarmerRecordModel.create({
      surname, first_name, middle_name, suffix, farm_location,
      crop_type, crop_variety, crop_stage,
      plantation_start_date, plantation_end_date, harvest_month_year,
      total_area_planted, total_area_trees_planted,
      harvest_start_date, harvest_end_date, total_weight,
      crop_purpose, destination, mode_of_payment, mode_of_delivery,
      total_area_harvested, total_area_trees_harvested
    });

    if (original_farmer_input_id) {
      // Delete all related documents
      await deleteRelatedDocuments(original_farmer_input_id);
    }

    return res.status(201).json({
      message: `Record successfully added to ${year} collection and original documents deleted`,
      data: newUnifiedRecord
    });

  } catch (error) {
    res.status(500).json({ message: 'Error pushing to the main records.', error: error.message });
  }
};




// helper controller for deleting initial farmer response and its related documents
const deleteRelatedDocuments = async (farmerId) => {
  // Find crop type to determine which documents to delete
  const cropType = await B_crop_types.findOne({ farmer_input_id: farmerId });
  
  if (cropType) {
    const isIndustrialCrop = cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    
    if (isIndustrialCrop) {
      // Get crop record to determine if newly planted or harvesting
      const cropRecord = await C_crop_records_indus.findOne({ farmer_input_id: farmerId });
      
      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await D1_crop_indus_new.deleteOne({ record_id: cropRecord._id });
        } else {
          await D1_crop_indus_harvest.deleteOne({ record_id: cropRecord._id });
        }
        await C_crop_records_indus.deleteOne({ _id: cropRecord._id });
      }
    } else {
      // Similar process for non-industrial crops
      const cropRecord = await C_crop_records_others.findOne({ farmer_input_id: farmerId });
      
      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await D2_bc_other_fct_new.deleteOne({ record_id: cropRecord._id });
        } else {
          await D2_bc_other_fct_harvest.deleteOne({ record_id: cropRecord._id });
        }
        await C_crop_records_others.deleteOne({ _id: cropRecord._id });
      }
    }
    
    // Delete crop type
    await B_crop_types.deleteOne({ _id: cropType._id });
  }
  
  // Finally delete the farmer input document
  await A_farmer_inputs.deleteOne({ _id: farmerId });
};






