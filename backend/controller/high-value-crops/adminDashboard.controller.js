import { getHighValueCropsDB } from '../../config/dbAccessHelper.js'; // import hvc db access
import mongoose from 'mongoose';


//________________________________ FARMERS NEW RESPONSES PAGE ____________________________________


// Get all unvalidated farmer inputs with their referenced documents
export const getUnvalidatedFarmerInputs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Default to 5 per page for each section
    const skip = (page - 1) * limit;
    const cropStage = req.query.crop_stage; // 'NEWLY PLANTED' or 'HARVESTING'

    if (!cropStage) {
      return res.status(400).json({ message: 'crop_stage query parameter is required.' });
    }

    // Base query for unvalidated farmer inputs
    const baseQuery = { isValidated: false };

    // Find all unvalidated farmer inputs and get their IDs
    const unvalidatedInputIds = (await global.highValueCropsModels.A_farmer_inputs.find(baseQuery).select('_id')).map(doc => doc._id);

    // Find related crop records based on the crop stage
    const indusRecords = await global.highValueCropsModels.C_crop_records_indus.find({ farmer_input_id: { $in: unvalidatedInputIds }, crop_stage: cropStage }).select('farmer_input_id');
    const othersRecords = await global.highValueCropsModels.C_crop_records_others.find({ farmer_input_id: { $in: unvalidatedInputIds }, crop_stage: cropStage }).select('farmer_input_id');

    const relevantFarmerInputIds = [
      ...indusRecords.map(r => r.farmer_input_id),
      ...othersRecords.map(r => r.farmer_input_id)
    ];

    const totalCount = relevantFarmerInputIds.length;

    // Fetch the paginated farmer inputs based on the filtered IDs
    const farmerInputs = await global.highValueCropsModels.A_farmer_inputs
      .find({ _id: { $in: relevantFarmerInputIds } })
      .populate('farmer_account_id')
      .lean()
      .skip(skip)
      .limit(limit);

    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
      // This check is now less likely to fail, but good for safety
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

    res.json({
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unvalidated farmer inputs', error: error.message });
  }
};


// Get all validated farmer inputs with their referenced documents
// export const getValidatedFarmerInputs = async (req, res) => {
//   try {
//     // Only find farmer inputs where isValidated is true
//     const farmerInputs = await global.highValueCropsModels.A_farmer_inputs.find({ isValidated: true }).lean();
    
//     const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
//       const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
//       // Handle case where no crop type exists
//       if (!cropType) {
//         return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
//       }
      
//       let cropRecord, cropDetails;

//       if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
//         cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        
//         if (!cropRecord) {
//           return { farmerInput, cropType, cropRecord: null, cropDetails: null };
//         }
        
//         if (cropRecord.crop_stage === 'NEWLY PLANTED') {
//           cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
//         } else if (cropRecord.crop_stage === 'HARVESTING') {
//           cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
//         }
//       } else {
//         cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
        
//         if (!cropRecord) {
//           return { farmerInput, cropType, cropRecord: null, cropDetails: null };
//         }
        
//         if (cropRecord.crop_stage === 'NEWLY PLANTED') {
//           cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
//         } else if (cropRecord.crop_stage === 'HARVESTING') {
//           cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
//         }
//       }

//       return {
//         farmerInput,
//         cropType,
//         cropRecord,
//         cropDetails
//       };
//     }));

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching validated farmer inputs', error: error.message });
//   }
// };


// Update only specific fields for flagged responses
export const updateFarmerResponseFields = async (req, res) => {
  try {
    const { farmerId, crop_stage, updates } = req.body;
    if (!farmerId || !crop_stage || !updates) {
      return res.status(400).json({ message: 'farmerId, crop_stage, and updates are required.' });
    }

    // Check if the response is flagged for review
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId);
    if (!farmerInput) {
      return res.status(404).json({ message: 'Farmer response not found.' });
    }
    if (farmerInput.isForReview !== true) {
      return res.status(400).json({ message: 'Only flagged responses can be updated.' });
    }

    // Find crop type and crop record
    const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId }).lean();
    if (!cropType) {
      return res.status(404).json({ message: 'Crop type not found.' });
    }

    let cropRecord, cropDetails, updateFields = {};

    if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId });
      if (!cropRecord) return res.status(404).json({ message: 'Crop record not found.' });

      if (crop_stage === 'NEWLY PLANTED') {
        cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id });
        // Only allow total_area_planted
        if ('total_area_planted' in updates) updateFields.total_area_planted = updates.total_area_planted;
      } else if (crop_stage === 'HARVESTING') {
        cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id });
        // Only allow total_weight, total_area_harvested
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('total_area_harvested' in updates) updateFields.total_area_harvested = updates.total_area_harvested;
      }
    } else {
      cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId });
      if (!cropRecord) return res.status(404).json({ message: 'Crop record not found.' });

      if (crop_stage === 'NEWLY PLANTED') {
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id });
        // Only allow total_trees
        if ('total_trees' in updates) updateFields.total_trees = updates.total_trees;
      } else if (crop_stage === 'HARVESTING') {
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id });
        // Only allow total_weight, trees_harvested
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('trees_harvested' in updates) updateFields.trees_harvested = updates.trees_harvested;
      }
    }

    if (!cropDetails) {
      return res.status(404).json({ message: 'Crop details not found.' });
    }

    // Update only allowed fields
    Object.assign(cropDetails, updateFields);
    await cropDetails.save();

    // Return updated details
    res.json({
      message: 'Fields updated successfully.',
      updated: updateFields
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating fields.', error: error.message });
  }
};


// Function to delete a complete farmer response and all related records
export const deleteFarmerResponse = async (req, res) => {
  const { farmerId } = req.body;
  
  if (!farmerId) {
    return res.status(400).json({ message: 'Farmer response ID is required.' });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId).session(session);
    if (!farmerInput) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Farmer response not found.' });
    }
    
    const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId }).session(session);
    if (!cropType) {
      await global.highValueCropsModels.A_farmer_inputs.deleteOne({ _id: farmerId }).session(session);
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ 
        message: 'Farmer response deleted successfully (only farmer input was found).' 
      });
    }
    
    // Determine which crop record collection to use based on crop type
    const isIndustrialCrop = cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    
    // Delete process for industrial crops
    if (isIndustrialCrop) {
      const cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId }).session(session);
      if (cropRecord) {
        // Delete appropriate detail record based on crop stage
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D1_crop_indus_new.deleteOne({ record_id: cropRecord._id }).session(session);
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          await global.highValueCropsModels.D1_crop_indus_harvest.deleteOne({ record_id: cropRecord._id }).session(session);
        }
        
        // Delete the crop record
        await global.highValueCropsModels.C_crop_records_indus.deleteOne({ _id: cropRecord._id }).session(session);
      }
    } 
    // Delete process for other crops (trees, fruits, etc.)
    else {
      const cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId }).session(session);
      if (cropRecord) {
        // Delete appropriate detail record based on crop stage
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D2_bc_other_fct_new.deleteOne({ record_id: cropRecord._id }).session(session);
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          await global.highValueCropsModels.D2_bc_other_fct_harvest.deleteOne({ record_id: cropRecord._id }).session(session);
        }
        
        // Delete the crop record
        await global.highValueCropsModels.C_crop_records_others.deleteOne({ _id: cropRecord._id }).session(session);
      }
    }
    
    // Delete the crop type record
    await global.highValueCropsModels.B_crop_types.deleteOne({ _id: cropType._id }).session(session);
    
    // Finally, delete the farmer input document
    await global.highValueCropsModels.A_farmer_inputs.deleteOne({ _id: farmerId }).session(session);
    
    // Commit the transaction
    await session.commitTransaction();
    
    return res.status(200).json({
      message: 'Farmer response deleted successfully with all related records.',
      deletedId: farmerId
    });
    
  } catch (error) {
    // Rollback in case of error
    await session.abortTransaction();
    return res.status(500).json({ 
      message: 'Error deleting farmer response', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};


// Create unified farmer response
export const createUnifiedFarmerResponse = async (req, res) => {
  const { 
    farmer_account_id, farmerId, farm_location,
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

  const checkFlagForReview = await global.highValueCropsModels.A_farmer_inputs.findById({ _id: original_farmer_input_id });

  if (checkFlagForReview.isForReview === true) {
    return res.status(400).json({ success: false, message: "Cannot push responses that are flagged for review." });
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
      farmer_account_id, farmerId, farm_location,
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
  const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId }).session(session);
  if (cropType) {
    const isIndustrialCrop = cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    
    if (isIndustrialCrop) {
      // Get crop record to determine if newly planted or harvesting
      const cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId }).session(session);
      
      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D1_crop_indus_new.deleteOne({ record_id: cropRecord._id }).session(session);
        } else {
          await global.highValueCropsModels.D1_crop_indus_harvest.deleteOne({ record_id: cropRecord._id }).session(session);
        }
        await global.highValueCropsModels.C_crop_records_indus.deleteOne({ _id: cropRecord._id }).session(session);
      }
    } else {
      // Similar process for non-industrial crops
      const cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId }).session(session);
      
      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D2_bc_other_fct_new.deleteOne({ record_id: cropRecord._id }).session(session);
        } else {
          await global.highValueCropsModels.D2_bc_other_fct_harvest.deleteOne({ record_id: cropRecord._id }).session(session);
        }
        await global.highValueCropsModels.C_crop_records_others.deleteOne({ _id: cropRecord._id }).session(session);
      }
    }
    
    // Delete crop type
    await global.highValueCropsModels.B_crop_types.deleteOne({ _id: cropType._id }).session(session);
  }
  
  // Finally delete the farmer input document
  await global.highValueCropsModels.A_farmer_inputs.deleteOne({ _id: farmerId }).session(session);
};


export const flagResponseForReview = async (req, res) => {
  const { farmerId } = req.params;

  try {
    const response = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId);

    if (!response) {
      return res.status(404).json({ message: 'Farmer response not found.' });
    };

    await global.highValueCropsModels.A_farmer_inputs.updateOne(
      { _id: farmerId },
      { $set: { isForReview: true } }
    );

    return res.status(200).json({ message: 'Farmer response flagged for review.' });

  } catch (error) {
    res.status(500).json({ message: 'Error flagging response for review', error: error.message });
  }
};

export const unflagResponseForReview = async (req, res) => {
  const { farmerId } = req.params;

  try {
    const response = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId);

    if (!response) {
      return res.status(404).json({ message: 'Farmer response not found.' });
    };

    await global.highValueCropsModels.A_farmer_inputs.updateOne(
      { _id: farmerId },
      { $set: { isForReview: false } }
    );

    return res.status(200).json({ message: 'Farmer response unflagged for review.' });

  } catch (error) {
    res.status(500).json({ message: 'Error unflagging response for review', error: error.message });
  }
};

export const formStatusEnable = async (req, res) => {
  try {
    await global.highValueCropsModels.FormStatus.findOneAndUpdate(
      {},                                   // filter
      { $set: { formStatus: true } },      // update
      { upsert: true, new: true }           // options
    );
    return res.status(200).json({ message: 'High-Value Crops form enabled successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error enabling High-Value Crops form', error: error.message });
  }
};

export const formStatusDisable = async (req, res) => {
  try {
    await global.highValueCropsModels.FormStatus.findOneAndUpdate(
      {},                                   // filter
      { $set: { formStatus: false } },      // update
      { upsert: true, new: true }           // options
    );
    return res.status(200).json({ message: 'High-Value Crops form disabled successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error disabling High-Value Crops form', error: error.message });
  }
};

export const checkFormStatus = async (req, res) => {
  try {
    const statusDoc = await global.highValueCropsModels.FormStatus.findOne({});
    const isOpen = Boolean(statusDoc?.formStatus);

    if (!isOpen) {
      return res.status(403).json({ success: false, open: false, message: 'High-Value Crops form is currently disabled.' });
    }

    return res.status(200).json({ success: true, open: true, message: 'High-Value Crops form is currently enabled.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error checking form status', error: error.message });
  }
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
  
    const capitalizeWords = (str) => {
      if (!str) return str;
      return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const formattedFirstName = capitalizeWords(first_name);
    const formattedMiddleName = middle_name ? capitalizeWords(middle_name) : '';
    const formattedSurname = capitalizeWords(surname);

    // Continue with creating new farmer account
    const newNumber = await getNextSequence('farmer_account');
    const middleInitial = formattedMiddleName ? formattedMiddleName.split(' ').map(word => word.charAt(0)).join('') : '';
    const firstInitials = formattedFirstName.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
    const initials = `${firstInitials.toUpperCase()}${middleInitial.toUpperCase()}${formattedSurname.charAt(0).toUpperCase()}`;
    const formattedNumber = String(newNumber).padStart(4, '0');
    const farmerId = `F-${initials}-${formattedNumber}`;

    const newFarmerAccount = await global.globalModels.FarmerAccount.create({
      farmerId,
      surname: formattedSurname,
      first_name: formattedFirstName,
      middle_name: formattedMiddleName,
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
    const result = await global.globalModels.FarmerAccount.deleteOne({ farmerId: farmerId });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { farmerName } = req.query;
    let filter = {};

    if (farmerName && farmerName.trim() !== '') {
      // Split the search query into individual words
      const searchWords = farmerName.trim().split(/\s+/);
      
      const fieldsToSearch = [
        'first_name', 
        'middle_name', 
        'surname', 
        'suffix', 
        'farmer_barangay', 
        'mobile_number', 
        'farmerId'
      ];

      // Build an $and query where each word must be found in at least one of the fields
      filter = {
        $and: searchWords.map(word => {
          const orConditions = fieldsToSearch.map(field => ({
            [field]: { $regex: new RegExp(word, 'i') }
          }));
          return { $or: orConditions };
        })
      };
    }

    const totalCount = await global.globalModels.FarmerAccount.countDocuments(filter);
    const farmerAccounts = await global.globalModels.FarmerAccount.aggregate([
          { $match: filter },
          { 
            $addFields: {
              // Extract the numeric part after the last dash
              numericPart: { 
                $toInt: { 
                  $arrayElemAt: [
                    { $split: ["$farmerId", "-"] }, 
                    -1
                  ] 
                } 
              }
            }
          },
          { $sort: { numericPart: 1 } }, // Sort by the extracted numeric value
          { $skip: skip },
          { $limit: limit },
          { $project: { numericPart: 0 } } // Remove the temporary field
        ]);   
         
    res.json({ 
      farmerAccounts, 
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farmer accounts', error: error.message });
  }
};


// Get a single farmer account by ID
// export const getFarmerAccountById = async (req, res) => {
//   const {farmerId} = req.body;
//   if (!farmerId) {
//     return res.status(400).json({ message: 'Farmer ID is required' });
//   }

//   try {
//     const farmerAccount = await global.globalModels.FarmerAccount.findOne({ farmerId: farmerId }).lean();
//     if (!farmerAccount) {
//       return res.status(404).json({ message: 'Farmer account not found' });
//     }
//     farmerAccount.farmer_address = '';

//     res.json(farmerAccount);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching farmer account', error: error.message });
//   }
// };

// get farmer accounts by name or farmer Id



export const getFarmerAccountByNameUser = async (req, res) => {
  const {  surname, first_name, middle_name, suffix, farmer_barangay, farmer_id } = req.body;
  if (!surname || !first_name ) {
    return res.status(400).json({ message: 'Farmer not found.' });
  }
  try {
    const farmerAccount = await global.globalModels.FarmerAccount.find({
      surname: {$regex: `^${surname}$`, $options: 'i'},
      first_name: {$regex: `^${first_name}$`, $options: 'i'},
      middle_name: middle_name ? {$regex: `^${middle_name}$`, $options: 'i'} : '',
      suffix: suffix || '',
      farmer_barangay,
      farmerId: farmer_id
    });

    if (!farmerAccount) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }

    res.status(200).json(farmerAccount);
  } catch (error) {
    console.error('Error fetching farmer account:', error);
    res.status(500).json({ message: 'Error fetching farmer account.', error: error.message });
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
    const farmerAccount = await global.globalModels.FarmerAccount.findOne({ farmerId });
    
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


//________________________________ DASHBOARD (METRICS / HVC SUPPLY AND MARKET PROFILE REPORT / HVC PRODUCTION REPORT) PAGE ____________________________________


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











