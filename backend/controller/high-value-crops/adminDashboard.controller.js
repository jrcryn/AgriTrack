import { getHighValueCropsDB } from '../../config/dbAccessHelper.js'; // import hvc db access
import mongoose from 'mongoose';


//________________________________ FARMERS NEW RESPONSES PAGE ____________________________________


// Get all unvalidated farmer inputs with their referenced documents
export const getUnvalidatedFarmerInputs = async (req, res) => {
  try {
    // Only find farmer inputs where isValidated is false
    const farmerInputs = await global.highValueCropsModels.A_farmer_inputs.find({ isValidated: false }).populate('farmer_account_id').lean();
    
    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
      // Handle case where no crop type exists
      if (!cropType) {
        return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
      }
      
      let cropRecord, cropDetails;

      if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      } else {
        cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
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
    const farmerInputs = await global.highValueCropsModels.A_farmer_inputs.find({ isValidated: true }).lean();
    
    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
      // Handle case where no crop type exists
      if (!cropType) {
        return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
      }
      
      let cropRecord, cropDetails;

      if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      } else {
        cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
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
export const updateFarmerInputAndReferences = async (req, res) => { //not currently in use
  try {
    const { farmerId, updateData } = req.body;

    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    // 1. Find the farmer input and check if it's unvalidated
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId);
    
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
    const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId });
    
    if (cropType && updateData.cropType) {
      cropType.crop_type = updateData.cropType;
      await cropType.save();
    }

    // 5. Find and update the appropriate crop record based on crop type
    let cropRecord;
    if (cropType?.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId });
      
      if (cropRecord && updateData.cropRecord) {
        const { crop_type, crop_variety, crop_stage } = updateData.cropRecord;
        if (crop_type) cropRecord.crop_type = crop_type;
        if (crop_variety !== undefined) cropRecord.crop_variety = crop_variety;
        if (crop_stage) cropRecord.crop_stage = crop_stage;
        
        await cropRecord.save();
      }
    } else if (cropType) {
      cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId });
      
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
          cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id });
          
          if (cropDetails && updateData.cropDetails) {
            const { plantation_start_date, plantation_end_date, harvest_month_year, total_area_planted } = updateData.cropDetails;
            
            if (plantation_start_date) cropDetails.plantation_start_date = plantation_start_date;
            if (plantation_end_date) cropDetails.plantation_end_date = plantation_end_date;
            if (harvest_month_year) cropDetails.harvest_month_year = harvest_month_year;
            if (total_area_planted) cropDetails.total_area_planted = total_area_planted;
            
            await cropDetails.save();
          }
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id });
          
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
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id });
          
          if (cropDetails && updateData.cropDetails) {
            const { plantation_start_date, plantation_end_date, harvest_month_year, total_trees } = updateData.cropDetails;
            
            if (plantation_start_date) cropDetails.plantation_start_date = plantation_start_date;
            if (plantation_end_date) cropDetails.plantation_end_date = plantation_end_date;
            if (harvest_month_year) cropDetails.harvest_month_year = harvest_month_year;
            if (total_trees) cropDetails.total_trees = total_trees;
            
            await cropDetails.save();
          }
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id });
          
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
const getCompleteRecordById = async (farmerId) => { //currently not in use
  const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId).lean();
  if (!farmerInput) return null;
  
  const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId }).lean();
  if (!cropType) return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
  
  let cropRecord, cropDetails;
  
  if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
    cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId }).lean();
    if (!cropRecord) return { farmerInput, cropType, cropRecord: null, cropDetails: null };
    
    if (cropRecord.crop_stage === 'NEWLY PLANTED') {
      cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
    } else if (cropRecord.crop_stage === 'HARVESTING') {
      cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
    }
  } else {
    cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId }).lean();
    if (!cropRecord) return { farmerInput, cropType, cropRecord: null, cropDetails: null };
    
    if (cropRecord.crop_stage === 'NEWLY PLANTED') {
      cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
    } else if (cropRecord.crop_stage === 'HARVESTING') {
      cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
    }
  }

  return { farmerInput, cropType, cropRecord, cropDetails };
};


// Create unified farmer response
export const createUnifiedFarmerResponse = async (req, res) => {
  const { 
    farmer_account_id, farm_location,
    crop_type, commodity, crop_stage,
    plantation_start_date, plantation_end_date, harvest_month_year,
    total_area_planted, total_area_trees_planted,
    harvest_start_date, harvest_end_date, total_weight,
    crop_purpose, destination, mode_of_payment, mode_of_delivery,
    total_area_harvested, total_area_trees_harvested,
    original_farmer_input_id
  } = req.body;

  if (!farmer_account_id || !farm_location || !crop_type || !commodity || !crop_stage || !original_farmer_input_id) {
    return res.status(400).json({ message: `Required data aren't provided.` });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

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
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(year);
    
    const newUnifiedRecord = await UnifiedFarmerRecordModel.create([{
      farmer_account_id, farm_location,
      crop_type, commodity, crop_stage,
      plantation_start_date, plantation_end_date, harvest_month_year,
      total_area_planted, total_area_trees_planted,
      harvest_start_date, harvest_end_date, total_weight,
      crop_purpose, destination, mode_of_payment, mode_of_delivery,
      total_area_harvested, total_area_trees_harvested
    }], {session});

    if (original_farmer_input_id) {
      // Delete all related documents
      await deleteRelatedDocuments(original_farmer_input_id, session);
    }

    await session.commitTransaction();

    return res.status(201).json({
      message: `Successfully pushed to the main records.`,
      data: newUnifiedRecord
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error pushing to the main records.', error: error.message });
  } finally {
    session.endSession();
  }
};


// helper controller for deleting initial farmer response and its related documents
const deleteRelatedDocuments = async (farmerId, session) => {
  // Find crop type to determine which documents to delete
  const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId }, {session});
  if (cropType) {
    const isIndustrialCrop = cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    
    if (isIndustrialCrop) {
      // Get crop record to determine if newly planted or harvesting
      const cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId }).session(session);
      
      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D1_crop_indus_new.deleteOne({ record_id: cropRecord._id }, {session});
        } else {
          await global.highValueCropsModels.D1_crop_indus_harvest.deleteOne({ record_id: cropRecord._id }, {session});
        }
        await global.highValueCropsModels.C_crop_records_indus.deleteOne({ _id: cropRecord._id }, {session})
      }
    } else {
      // Similar process for non-industrial crops
      const cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId }).session(session);
      
      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D2_bc_other_fct_new.deleteOne({ record_id: cropRecord._id }, {session});
        } else {
          await global.highValueCropsModels.D2_bc_other_fct_harvest.deleteOne({ record_id: cropRecord._id }, {session});
        }
        await global.highValueCropsModels.C_crop_records_others.deleteOne({ _id: cropRecord._id }, {session});
      }
    }
    
    // Delete crop type
    await global.highValueCropsModels.B_crop_types.deleteOne({ _id: cropType._id }, {session});
  }
  
  // Finally delete the farmer input document
  await global.highValueCropsModels.A_farmer_inputs.deleteOne({ _id: farmerId }, {session});
};


//________________________________ FARMERS ACCOUNT MANAGEMENT PAGE ____________________________________


const getNextSequence = async (key) => {
  const counter = await global.highValueCropsModels.Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// Create a new farmer account
// Create a new farmer account
export const createFarmerAccount = async (req, res) => {

  const { surname, first_name, middle_name, suffix, farmer_barangay, mobile_number, facebook, birthdate } = req.body;
  if (!surname || !first_name || !farmer_barangay) {
    return res.status(400).json({ message: 'Please provide all the required fields.' });
  }

  try { // updated okay lang may magkatokayo kasi hindi namna maiiwasan, mahalaga they're uniquely identified by farmerId
  

    // Continue with creating new farmer account
    const newNumber = await getNextSequence('farmer_account');
    const middleInitial = middle_name ? middle_name.charAt(0) : '';
    const firstInitials = first_name.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
    const initials = `${firstInitials}${middleInitial}${surname.charAt(0)}`;
    const formattedNumber = String(newNumber).padStart(4, '0');
    const farmerId = `F-${initials}-${formattedNumber}`;

    const newFarmerAccount = await global.highValueCropsModels.FarmerAccount.create({
      farmerId,
      surname,
      first_name,
      middle_name,
      suffix,
      farmer_barangay,
      mobile_number,
      facebook,
      birthdate
    });
    return res.status(201).json({
      message: 'Farmer account created successfully',
      data: newFarmerAccount,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Farmer account already exists with the same farmer ID, try again.' });
    }
    return res.status(500).json({ message: 'Error creating farmer account', error });
  }
};


export const deleteFarmerAccount = async (req, res) => {
  const { farmerId } = req.body;
  if (!farmerId) {
    return res.status(400).json({ message: 'Farmer ID is required.' });
  }
  try {
    const result = await global.highValueCropsModels.FarmerAccount.deleteOne({ farmerId: farmerId });
    if (result.deleteCount === 0) {
      return res.status(404).json({ message: 'Farmer account not found' });
    }
    return res.status(200).json({ message: 'Farmer account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting farmer account.', error: error.message });
  }
};

// Get all farmer accounts
export const getFarmerAccounts = async (req, res) => {
  try {
    const farmerAccounts = await global.highValueCropsModels.FarmerAccount.find().lean();
    res.json(farmerAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farmer accounts', error: error.message });
  }
};


// Get a single farmer account by ID
export const getFarmerAccountById = async (req, res) => {
  const {farmerId} = req.body;
  if (!farmerId) {
    return res.status(400).json({ message: 'Farmer ID is required' });
  }

  try {
    const farmerAccount = await global.highValueCropsModels.FarmerAccount.findOne({ farmerId: farmerId }).lean();
    if (!farmerAccount) {
      return res.status(404).json({ message: 'Farmer account not found' });
    }
    farmerAccount.farmer_address = '';

    res.json(farmerAccount);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farmer account', error: error.message });
  }
};


// Update a farmer account by ID
export const updateFarmerAccount = async (req, res) => {
  const { farmerId, surname, first_name, middle_name, suffix, farmer_barangay, mobile_number, facebook, birthdate } = req.body;
  
  if (!farmerId) {
    return res.status(400).json({ message: 'Farmer ID is required' });
  }

  try {
    // Find the farmer by ID
    const farmerAccount = await global.highValueCropsModels.FarmerAccount.findOne({ farmerId });
    
    if (!farmerAccount) {
      return res.status(404).json({ message: 'Farmer account not found' });
    }

    // Update only the fields that are provided
    if (surname) farmerAccount.surname = surname;
    if (first_name) farmerAccount.first_name = first_name;
    if (middle_name !== undefined) farmerAccount.middle_name = middle_name;
    if (suffix !== undefined) farmerAccount.suffix = suffix;
    if (farmer_barangay) farmerAccount.farmer_barangay = farmer_barangay;
    if (mobile_number !== undefined) farmerAccount.mobile_number = mobile_number;
    if (facebook !== undefined) farmerAccount.facebook = facebook;
    if (birthdate !== undefined) farmerAccount.birthdate = birthdate;

    // Save the updated farmer account
    const updatedFarmer = await farmerAccount.save();
    
    return res.status(200).json({
      message: 'Farmer account updated successfully',
      data: updatedFarmer
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error updating farmer account', 
      error: error.message 
    });
  }
};


//________________________________ DASHBOARD (METRICS) PAGE ____________________________________




// Get available years from unified farmer record collections
export const getAvailableMetricsYears = async (req, res) => {
  try {
    // Get the specific database connection for high-value-crops
    const db = getHighValueCropsDB();

    // Get all collection names from the correct MongoDB database using the native driver's Db object (makikita parin kahit walang laman yung collection)
    const collections = await db.db.listCollections({}, { nameOnly: true }).toArray(); 
    // Define a case-insensitive regex pattern to extract years from collection names
    const yearPattern = /unified_farmer_records_(\d{4})/i;

    // Extract and validate years
    let years = [];
    for (const collection of collections) {
      const match = collection.name.match(yearPattern);
      if (match) {
        const year = parseInt(match[1], 10);
        // Validate it's a reasonable year (between 2000 and 2100)
        if (year >= 2000 && year <= 2100) {
          years.push(year);
        }
      }
    }

    // Sort years descending (newest first)
    years.sort((a, b) => b - a);



    res.json(years);
  } catch (error) {
    console.error('Error fetching available years:', error);
    res.status(500).json({
      message: 'Error fetching available years',
      error: error.message
    });
  }
};


// Get available months for a specific year from unified farmer records
export const getAvailableMonthsForYear = async (req, res) => {
  const { year } = req.params;
  
  if (!year || isNaN(parseInt(year))) {
    return res.status(400).json({ message: 'Valid year parameter is required' });
  }
  
  try {
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(parseInt(year));
    
    // Check if collection exists by trying to count documents
    const recordCount = await UnifiedFarmerRecordModel.countDocuments();
    if (recordCount === 0) {
      return res.json([]);
    }
    
    // Get months from newly planted records (based on plantation_start_date)
    const plantingMonths = await UnifiedFarmerRecordModel.aggregate([
      { 
        $match: { 
          crop_stage: "NEWLY PLANTED",
          plantation_start_date: { $ne: null }
        } 
      },
      {
        $project: {
          month: { $month: "$plantation_start_date" }
        }
      },
      {
        $group: {
          _id: "$month"
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get months from harvesting records (based on harvest_start_date)
    const harvestingMonths = await UnifiedFarmerRecordModel.aggregate([
      { 
        $match: { 
          crop_stage: "HARVESTING",
          harvest_start_date: { $ne: null }
        } 
      },
      {
        $project: {
          month: { $month: "$harvest_start_date" }
        }
      },
      {
        $group: {
          _id: "$month"
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Combine and deduplicate months
    const allMonths = [...plantingMonths, ...harvestingMonths]
      .map(item => item._id)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);
    
    res.json(allMonths);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available months', error: error.message });
  }
};


// Get metrics data for a specific year and month
// Get metrics data for a specific year and month
// ...existing code...
export const getMetricsForYearMonth = async (req, res) => {
  const { year, month } = req.params;
  const { farm_location, commodity } = req.query; // Get filters from query parameters

  // Validate year, month can be 0 for "All Months"
  if (!year || isNaN(parseInt(year)) || month === undefined || month === null || isNaN(parseInt(month))) {
    return res.status(400).json({ message: 'Valid year and month (or 0 for all) parameters are required' });
  }

  try {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month); // monthNum will be 0 for "All Months"

    // Get the appropriate model for this year
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(yearNum);

    // Define month start and end ONLY if a specific month is selected
    let startOfMonth, endOfMonth;
    const isSpecificMonth = monthNum > 0 && monthNum <= 12;

    if (isSpecificMonth) {
      startOfMonth = new Date(yearNum, monthNum - 1, 1);
      endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Last day of the month
    }

    // Base filters that will be applied to both queries
    const baseFilters = {};

    // Add optional filters if provided
    if (farm_location) {
      baseFilters.farm_location = farm_location;
    }

    if (commodity) {
      baseFilters.commodity = commodity;
    }

    // 1. Newly Planted Metrics
    const newlyPlantedFilter = {
      ...baseFilters,
      crop_stage: "NEWLY PLANTED",
    };

    // Add date range filter only if a specific month is selected
    if (isSpecificMonth) {
      newlyPlantedFilter.$or = [
        { plantation_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
        { plantation_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
        {
          plantation_start_date: { $lt: startOfMonth },
          plantation_end_date: { $gt: endOfMonth }
        }
      ];
    } else {
      // For "All Months", ensure plantation dates exist within the year (implicitly handled by model)
      newlyPlantedFilter.plantation_start_date = { $ne: null }; // Or some basic check if needed
    }


    // Get unique farmers count who planted
    const newlyPlantedFarmersResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: newlyPlantedFilter },
      { $group: { _id: "$farmer_account_id" } },
      { $count: "count" }
    ]);

    // Calculate total area planted
    const newlyPlantedAreaResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: newlyPlantedFilter },
      {
        $group: {
          _id: null,
          totalAreaPlanted: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ["$total_area_planted", 0] }, 0] },
                "$total_area_planted",
                { $ifNull: ["$total_area_trees_planted", 0] }
              ]
            }
          }
        }
      }
    ]);

    // 2. Harvesting Metrics
    const harvestingFilter = {
      ...baseFilters,
      crop_stage: "HARVESTING",
    };

    // Add date range filter only if a specific month is selected
    if (isSpecificMonth) {
      harvestingFilter.$or = [
        { harvest_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
        { harvest_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
        {
          harvest_start_date: { $lt: startOfMonth },
          harvest_end_date: { $gt: endOfMonth }
        }
      ];
    } else {
       // For "All Months", ensure harvest dates exist within the year (implicitly handled by model)
      harvestingFilter.harvest_start_date = { $ne: null }; // Or some basic check if needed
    }


    // Get unique farmers count who harvested
    const harvestingFarmersResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: harvestingFilter },
      { $group: { _id: "$farmer_account_id" } },
      { $count: "count" }
    ]);

    // Calculate total area harvested and volume production
    const harvestingMetricsResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: harvestingFilter },
      {
        $group: {
          _id: null,
          totalAreaHarvested: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ["$total_area_harvested", 0] }, 0] },
                "$total_area_harvested",
                { $ifNull: ["$total_area_trees_harvested", 0] }
              ]
            }
          },
          totalVolumeProduction: { $sum: { $ifNull: ["$total_weight", 0] } }
        }
      }
    ]);

    // Extract the values (with fallbacks to 0 if no data)
    const newlyPlantedFarmers = newlyPlantedFarmersResult.length > 0 ? newlyPlantedFarmersResult[0].count : 0;
    const areaPlanted = newlyPlantedAreaResult.length > 0 ? newlyPlantedAreaResult[0].totalAreaPlanted : 0;
    const harvestingFarmers = harvestingFarmersResult.length > 0 ? harvestingFarmersResult[0].count : 0;
    const areaHarvested = harvestingMetricsResult.length > 0 ? harvestingMetricsResult[0].totalAreaHarvested : 0;
    const volumeProduction = harvestingMetricsResult.length > 0 ? harvestingMetricsResult[0].totalVolumeProduction : 0;

    // Prepare the response
    const response = {
      filters: {
        year: yearNum,
        month: isSpecificMonth ? monthNum : null, // Indicate null month for "All Months"
        farm_location: farm_location || null,
        commodity: commodity || null
      },
      newlyPlanted: {
        farmers: newlyPlantedFarmers,
        areaPlanted: areaPlanted
      },
      harvesting: {
        farmers: harvestingFarmers,
        areaHarvested: areaHarvested,
        volumeProduction: volumeProduction
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
};








