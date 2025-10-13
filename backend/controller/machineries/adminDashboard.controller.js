export const createMachineriesUnit = async (req, res) => {
    const { unit_name, remarks, barangay_allocations } = req.body;

    if (!unit_name  || !barangay_allocations) {
        return res.status(400).json({ message: "Please provide all the required fields." });
    };


    const existingUnit = await global.machineriesModels.MachineriesUnit.findOne({ unit_name });
    if (existingUnit) {
        return res.status(400).json({ message: "Machinery unit already exists." });
    };


    try {
        const newMachineriesUnit = await global.machineriesModels.MachineriesUnit.create({
            unit_name,
            remarks,
            barangay_allocations
        });
        return res.status(200).json({ 
            message: "Machinery unit added successfully.",
            data: newMachineriesUnit
         });
    } catch (error) {
        console.error("Error adding machinery unit:", error);
        return res.status(500).json({ message: "Error adding machinery unit." });
    }
};

export const addMachineryUnits = async (req, res) => { //solely for adding units to barangay
    const { machineryId, barangay, functionalUnits = 0, nonFunctionalUnits = 0 } = req.body;

    // Validate required fields
    if (!machineryId || !barangay) {
        return res.status(400).json({ message: "Machinery ID and barangay are required." });
    }

    // Validate unit counts
    if (isNaN(functionalUnits) || functionalUnits < 0 || isNaN(nonFunctionalUnits) || nonFunctionalUnits < 0) {
        return res.status(400).json({ message: "Unit counts must be non-negative numbers." });
    }

    // Ensure at least one type of unit is being added
    if (functionalUnits === 0 && nonFunctionalUnits === 0) {
        return res.status(400).json({ message: "At least one functional or non-functional unit must be added." });
    }

    try {
        // Find the machinery unit by ID
        const machinery = await global.machineriesModels.MachineriesUnit.findById(machineryId);
        
        if (!machinery) {
            return res.status(404).json({ message: "Machinery unit not found." });
        }

        // Check if barangay already exists in allocations
        const existingAllocationIndex = machinery.barangay_allocations.findIndex(
            allocation => allocation.barangay === barangay
        );
        
        if (existingAllocationIndex !== -1) {
            // Update existing allocation
            machinery.barangay_allocations[existingAllocationIndex].functional_units += functionalUnits;
            machinery.barangay_allocations[existingAllocationIndex].non_functional_units += nonFunctionalUnits;
        } else {
            // Create new allocation
            machinery.barangay_allocations.push({
                barangay,
                functional_units: functionalUnits,
                non_functional_units: nonFunctionalUnits
            });
        }

        // Save the updated machinery
        await machinery.save();

        return res.status(200).json({
            message: `Successfully added ${functionalUnits} functional and ${nonFunctionalUnits} non-functional units to ${barangay}.`,
            data: machinery
        });
    } catch (error) {
        console.error("Error adding machinery units:", error);
        return res.status(500).json({
            message: "Error adding machinery units.", 
            error: error.message
        });
    }
};

export const deleteMachinery = async (req, res) => { //pang delete ng machine talaga
    const { machineryId } = req.body;
    if (!machineryId) {
        return res.status(400).json({ message: "Machinery ID is required." });
    }
    try {
        const deletedMachinery = await global.machineriesModels.MachineriesUnit.findByIdAndDelete(machineryId);
        if (!deletedMachinery) {
            return res.status(404).json({ message: "Machinery unit not found." });
        }
        return res.status(200).json({
            message: "Machinery has been permanently deleted.",
            data: deletedMachinery
        });
    } catch (error) {
        console.error("Error deleting machinery unit:", error);
        return res.status(500).json({ message: "Error deleting machinery unit." });
    }
};

export const updateMachineryUnit = async (req, res) => { //update for name and remarks lang
    const { machineryId, unit_name, remarks } = req.body;

    if (!machineryId) {
        return res.status(400).json({ message: "Please provide all the required fields." });
    }
    
    const findMachinery = await global.machineriesModels.MachineriesUnit.findById(machineryId);
    if (!findMachinery) {
        return res.status(404).json({ message: "Machinery unit not found." });
    }

    try {
        const updatedMachinery = await global.machineriesModels.MachineriesUnit.findByIdAndUpdate(
            machineryId,
            { unit_name, remarks },
            { new: true } // Return the updated document
        );
        return res.status(200).json({
            message: "Machinery unit updated successfully.",
            data: updatedMachinery
        });
    } catch (error) {
        console.error("Error updating machinery unit:", error);
        return res.status(500).json({ message: "Error updating machinery unit." });
    }
};

export const deleteMachineryUnits = async (req, res) => {
    const { machineryId, barangay, unitType, unitCount } = req.body;

    // Validate required fields
    if (!machineryId || !barangay || !unitType || !unitCount) {
        return res.status(400).json({ message: "Please provide all required fields: machineryId, barangay, unitType, and unitCount." });
    }

    // Validate unit type
    if (unitType !== 'functional_units' && unitType !== 'non_functional_units') {
        return res.status(400).json({ message: "Unit type must be either 'functional_units' or 'non_functional_units'." });
    }

    // Validate unit count
    if (isNaN(unitCount) || unitCount <= 0) {
        return res.status(400).json({ message: "Unit count must be a positive number." });
    }

    try {
        // Find the machinery unit by ID
        const machinery = await global.machineriesModels.MachineriesUnit.findById(machineryId);
        
        if (!machinery) {
            return res.status(404).json({ message: "Machinery unit not found." });
        }

        // Find the barangay allocation
        const allocationIndex = machinery.barangay_allocations.findIndex(
            allocation => allocation.barangay === barangay
        );
        
        if (allocationIndex === -1) {
            return res.status(404).json({ message: `Barangay '${barangay}' not found in machinery allocations.` });
        }

        // Check if there are enough units to delete
        const allocation = machinery.barangay_allocations[allocationIndex];
        if (!allocation[unitType] || allocation[unitType] < unitCount) {
            return res.status(400).json({ 
                message: `Not enough ${unitType === 'functional_units' ? 'functional' : 'non-functional'} units to delete in ${barangay}.` 
            });
        }

        // Update the allocation by subtracting the units
        machinery.barangay_allocations[allocationIndex][unitType] -= unitCount;
        
        // If both functional and non-functional units become zero, remove the entire allocation
        const updatedAllocation = machinery.barangay_allocations[allocationIndex];
        if ((updatedAllocation.functional_units || 0) <= 0 && (updatedAllocation.non_functional_units || 0) <= 0) {
            machinery.barangay_allocations.splice(allocationIndex, 1);
        }

        // Save the updated machinery
        await machinery.save();

        return res.status(200).json({
            message: `Successfully deleted ${unitCount} ${unitType === 'functional_units' ? 'functional' : 'non-functional'} units from ${barangay}.`,
            data: machinery
        });
    } catch (error) {
        console.error("Error deleting machinery units:", error);
        return res.status(500).json({
            message: "Error deleting machinery units.", 
            error: error.message
        });
    }
};

export const getMachineriesUnits = async (req, res) => {
    try {
        const machineryUnits = await global.machineriesModels.MachineriesUnit.find().lean();
        res.json(machineryUnits);
    } catch (error) {
        console.error("Error fetching machinery units:", error);
        res.status(500).json({ message: "Error fetching machinery units.", error: error.message });
    }
};


export const transferMachineriesUnit = async (req, res) => {
    const {machineryId, transferFrom, transferTo, unitCount, unitType} = req.body;

    if (!machineryId || !transferFrom || !transferTo || !unitCount || !unitType) {
        return res.status(400).json({message: "Please provide all the required data."});
    };

    const findMachinery = await global.machineriesModels.MachineriesUnit.findById(machineryId);
    if (!findMachinery) {
        return res.status(404).json({message: "Machinery unit not found."});
    }
    
    // Validate unitType
    if (unitType !== 'functional_units' && unitType !== 'non_functional_units') {
        return res.status(400).json({message: "Unit type must be a functional unit or non functional unit'."});
    }

    // Validate unitCount
    if (isNaN(unitCount) || unitCount <= 0) {
        return res.status(400).json({message: "Unit count must be a positive number."});
    }

    try {
        // Find the machinery unit by ID
        const machinery = await global.machineriesModels.MachineriesUnit.findById(machineryId);
        
        if (!machinery) {
            return res.status(404).json({message: "Machinery unit not found."});
        }

        // Find source barangay in allocations
        const sourceIndex = machinery.barangay_allocations.findIndex(
            allocation => allocation.barangay === transferFrom
        );
        
        if (sourceIndex === -1) {
            return res.status(404).json({message: `Source barangay '${transferFrom}' not found in machinery allocations.`});
        }

        // Check if source has enough units to transfer
        if (machinery.barangay_allocations[sourceIndex][unitType] < unitCount) {
            return res.status(400).json({
                message: `Not enough ${unitType === 'functional_units' ? 'functional' : 'non-functional'} units available in ${transferFrom}.`
            });
        }

        // Find destination barangay in allocations
        let destIndex = machinery.barangay_allocations.findIndex(
            allocation => allocation.barangay === transferTo
        );
        
        // If destination barangay doesn't exist, add it
        if (destIndex === -1) {
            machinery.barangay_allocations.push({
                barangay: transferTo,
                total_units: 0,
                functional_units: 0,
                non_functional_units: 0
            });
            destIndex = machinery.barangay_allocations.length - 1;
        }

        // Update source barangay allocation
        machinery.barangay_allocations[sourceIndex][unitType] -= unitCount;
        machinery.barangay_allocations[sourceIndex].total_units -= unitCount;

        // Update destination barangay allocation
        machinery.barangay_allocations[destIndex][unitType] += unitCount;
        machinery.barangay_allocations[destIndex].total_units += unitCount;

        // Save the updated machinery
        await machinery.save();

        return res.status(200).json({
            message: `Successfully transferred ${unitCount} ${unitType === 'functional_units' ? 'functional' : 'non-functional'} units from ${transferFrom} to ${transferTo}.`,
            data: machinery
        });
    } catch (error) {
        console.error("Error transferring machinery units:", error);
        return res.status(500).json({
            message: "Error transferring machinery units.", 
            error: error.message
        });
    }
};






export const ticketRequestForm = async (req, res) => {
    const {
        requestorFarmer,
        requestedMachineType,
        barangay,
        estimatedArea
    } = req.body;

    if (!requestorFarmer || !requestedMachineType || !barangay || !estimatedArea) {
        return res.status(400).json({ 
            message: "Please provide all required fields: requestorFarmer, requestedMachineType, barangay, and estimatedArea." 
        });
    }

    try {
        const farmerExists = await global.globalModels.FarmerAccount.findById(requestorFarmer);
        if (!farmerExists) {
            return res.status(404).json({ success: false, message: "Farmer not found." });
        }

        const machineTypeExists = await global.machineriesModels.MachineriesType.findById(requestedMachineType);
        if (!machineTypeExists) {
            return res.status(404).json({ success: false, message: "Machine type not found." });
        }

        // Create new ticket request
        const newTicketRequest = await global.machineriesModels.TicketRequest.create({
            requestorFarmer,
            requestedMachineType,
            barangay,
            estimatedArea,
            dateRequested: new Date(),
            status: 'Pending'
        });

        return res.status(201).json({
            success: true,
            message: "Ticket request submitted successfully.",
            data: newTicketRequest
        });
    } catch (error) {
        console.error("Error submitting ticket request:", error);
        return res.status(500).json({ success: false, message: "Error submitting ticket request.", error: error.message });
    }
};

export const createMachineriesType = async (req, res) => {
    const { ownerName, ownerType, equipmentType, ratedCapacity } = req.body;

    // Validate required fields
    if (!ownerName || !ownerType || !equipmentType || !ratedCapacity) {
        return res.status(400).json({ success: false, message: "Please provide all required fields: ownerName, ownerType, equipmentType, and ratedCapacity." });
    }

    try {
        // Check if a machine type with the same details already exists
        const existingMachineType = await global.machineriesModels.MachineriesType.findOne({
            ownerName,
            equipmentType
        });

        if (existingMachineType) {
            return res.status(400).json({ success: false, message: "A machinery type with this owner and equipment type already exists." });
        }

        // Create new machinery type
        const newMachineType = await global.machineriesModels.MachineriesType.create({
            ownerName,
            ownerType,
            equipmentType,
            ratedCapacity
        });

        return res.status(201).json({
            success: true, 
            message: "Machinery type created successfully.",
            data: newMachineType
        });
    } catch (error) {
        console.error("Error creating machinery type:", error);
        return res.status(500).json({ success: false, message: "Error creating machinery type.", error: error.message });
    }
};

export const addMachineryUnit = async (req, res) => {
    const { 
        machineryTypeId, 
        plateNumber, 
        engineBrand, 
        engineHorsepower, 
        modeOfAcquisition, 
        costOfAcquisition, 
        yearAcquired, 
        condition, 
        location, 
        remarks, 
        status 
    } = req.body;

    if (!machineryTypeId || !plateNumber || !engineBrand || !engineHorsepower || 
        !modeOfAcquisition || !costOfAcquisition || !yearAcquired || !condition || 
        !location || !status) {
        return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    try {
        const machineType = await global.machineriesModels.MachineriesType.findById(machineryTypeId);
        if (!machineType) {
            return res.status(404).json({ success: false, message: "Machinery type not found." });
        }

        const existingUnit = await global.machineriesModels.MachineriesUnit.findOne({ plateNumber });
        if (existingUnit) {
            return res.status(400).json({ success: false, message: "A machinery unit with this plate number already exists." });
        }

        const newMachineryUnit = await global.machineriesModels.MachineriesUnit.create({
            machineryTypeId,
            plateNumber,
            engineBrand,
            engineHorsepower,
            modeOfAcquisition,
            costOfAcquisition,
            yearAcquired: new Date(yearAcquired),
            condition,
            location,
            remarks,
            status
        });

        return res.status(201).json({
            success: true, 
            message: "Machinery unit created successfully.",
            data: newMachineryUnit
        });
    } catch (error) {
        console.error("Error creating machinery unit:", error);
        return res.status(500).json({ success: false, message: "Error creating machinery unit.", error: error.message });
    }
};

export const weeklySchedule = async (req, res) => {
    const { weekStart, weekEnd, tickets } = req.body;

    try {
        
    } catch (error) {
        console.error("Error creating a weekly schedule:", error);
        return res.status(500).json({ success: false, message: "Error creating a weekly schedule.", error: error.message })
    }
};
