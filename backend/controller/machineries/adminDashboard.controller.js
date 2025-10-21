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

// export const updateMachineryUnit = async (req, res) => { //update for name and remarks lang
//     const { machineryId, unit_name, remarks } = req.body;

//     if (!machineryId) {
//         return res.status(400).json({ message: "Please provide all the required fields." });
//     }
    
//     const findMachinery = await global.machineriesModels.MachineriesUnit.findById(machineryId);
//     if (!findMachinery) {
//         return res.status(404).json({ message: "Machinery unit not found." });
//     }

//     try {
//         const updatedMachinery = await global.machineriesModels.MachineriesUnit.findByIdAndUpdate(
//             machineryId,
//             { unit_name, remarks },
//             { new: true } // Return the updated document
//         );
//         return res.status(200).json({
//             message: "Machinery unit updated successfully.",
//             data: updatedMachinery
//         });
//     } catch (error) {
//         console.error("Error updating machinery unit:", error);
//         return res.status(500).json({ message: "Error updating machinery unit." });
//     }
// };

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




//process controllers

// Helper: atomic daily counter via Counter collection to generate unique TR-YYYYMMDD-#### refs
const getNextCounterSeq = async (counterId) => {
    const doc = await global.machineriesModels.Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return doc.seq;
};

export const createTicketRequestForm = async (req, res) => {
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
        const farmerDoc = await global.globalModels.FarmerAccount.findById(requestorFarmer).lean();
        if (!farmerDoc) {
            return res.status(404).json({ success:  false, message: "Farmer not found." });
        }

        const machineTypeDoc = await global.machineriesModels.MachineriesType.findById(requestedMachineType).lean();
        if (!machineTypeDoc) {
            return res.status(404).json({ success: false, message: "Machine type not found." });
        }

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const datePart = `${yyyy}${mm}${dd}`;

        // counter id is scoped per day to reset counts daily
        const seq = await getNextCounterSeq(`TR-${datePart}`);
        const refNumber =  `TR-${datePart}-${String(seq).padStart(4, '0')}`;

        // Create new ticket request with denormalized details
        const newTicketRequest = await global.machineriesModels.TicketRequest.create({
            requestorFarmer: {
                requestorFarmerId: farmerDoc._id,
                farmerId: farmerDoc.farmerId,
                surname: farmerDoc.surname,
                first_name: farmerDoc.first_name,
                middle_name: farmerDoc.middle_name,
                suffix: farmerDoc.suffix
            },
            requestedMachineType: {
                requestedMachineTypeId: machineTypeDoc._id,
                ownerName: machineTypeDoc.ownerName,
                ownerType: machineTypeDoc.ownerType,
                equipmentType: machineTypeDoc.equipmentType,
                ratedCapacity: machineTypeDoc.ratedCapacity
            },
            refNumber, 
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

export const updateMachineryType = async (req, res) => {
    const { machineryTypeId, ownerName, ownerType, equipmentType, ratedCapacity } = req.body;

    // Validate required fields
    if (!machineryTypeId) {
        return res.status(400).json({ success: false, message: "Please provide machineryTypeId." });
    }

    try {
        const existingMachineType = await global.machineriesModels.MachineriesType.findById(machineryTypeId);
        
        if (!existingMachineType) {
            return res.status(404).json({ 
                success: false, 
                message: "Machinery type not found." 
            });
        }

        // Prepare update data - only include fields that are provided
        const updateData = {};
        if (ownerName !== undefined) updateData.ownerName = ownerName;
        if (ownerType !== undefined) updateData.ownerType = ownerType;
        if (equipmentType !== undefined) updateData.equipmentType = equipmentType;
        if (ratedCapacity !== undefined) updateData.ratedCapacity = ratedCapacity;

        // If duplicate check is needed when updating
        if (ownerName && equipmentType) {
            const duplicateCheck = await global.machineriesModels.MachineriesType.findOne({
                _id: { $ne: machineryTypeId }, // exclude the current item
                ownerName,
                equipmentType
            });

            if (duplicateCheck) {
                return res.status(400).json({ 
                    success: false, 
                    message: "A machinery type with this owner and equipment type already exists." 
                });
            }
        }

        // Update the machinery type
        const updatedMachineType = await global.machineriesModels.MachineriesType.findByIdAndUpdate(
            machineryTypeId,
            updateData,
            { new: true } // Return the updated document
        );

        return res.status(200).json({
            success: true,
            message: "Machinery type updated successfully.",
            data: updatedMachineType
        });
    } catch (error) {
        console.error("Error updating machinery type:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error updating machinery type.", 
            error: error.message 
        });
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

    if (!machineryTypeId || !plateNumber || !engineHorsepower || 
        !modeOfAcquisition || !yearAcquired || !condition || 
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
            yearAcquired,
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

export const updateMachineryUnit = async (req, res) => {
    const { 
        machineryUnitId,
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
 
    if (!machineryUnitId) {
        return res.status(400).json({ success: false, message: "Please provide the machinery unit ID." });
    }

    try {
        // Check if the machinery unit exists
        const existingUnit = await global.machineriesModels.MachineriesUnit.findById(machineryUnitId);
        
        if (!existingUnit) {
            return res.status(404).json({ 
                success: false, 
                message: "Machinery unit not found." 
            });
        }

        const updateData = {};
        
        if (machineryTypeId !== undefined) {
           const machineTypeExists = await global.machineriesModels.MachineriesType.findById(machineryTypeId);
            if (!machineTypeExists) {
                return res.status(404).json({ success: false, message: "Machinery type not found." });
            }
            updateData.machineryTypeId = machineryTypeId;
        }

        // Check for duplicate plate number if it's being updated
        if (plateNumber !== undefined && plateNumber !== existingUnit.plateNumber) {
            const duplicateCheck = await global.machineriesModels.MachineriesUnit.findOne({
                _id: { $ne: machineryUnitId }, // exclude the current item
                plateNumber
            });

            if (duplicateCheck) {
                return res.status(400).json({ success: false, message: "A machinery unit with this plate number already exists." });
            }
            updateData.plateNumber = plateNumber;
        }

        // Add other fields to updateData if they are provided
        if (engineBrand !== undefined) updateData.engineBrand = engineBrand;
        if (engineHorsepower !== undefined) updateData.engineHorsepower = engineHorsepower;
        if (modeOfAcquisition !== undefined) updateData.modeOfAcquisition = modeOfAcquisition;
        if (costOfAcquisition !== undefined) updateData.costOfAcquisition = costOfAcquisition;
        if (yearAcquired !== undefined) updateData.yearAcquired = new Date(yearAcquired);
        if (condition !== undefined) updateData.condition = condition;
        if (location !== undefined) updateData.location = location;
        if (remarks !== undefined) updateData.remarks = remarks;
        if (status !== undefined) updateData.status = status;

        // Update the machinery unit
        const updatedMachineryUnit = await global.machineriesModels.MachineriesUnit.findByIdAndUpdate(
            machineryUnitId,
            updateData,
            { new: true } 
        );

        return res.status(200).json({ success: true, message: "Machinery unit updated successfully.", data: updatedMachineryUnit});

    } catch (error) {
        console.error("Error updating machinery unit:", error);
        return res.status(500).json({ success: false, message: "Error updating machinery unit.", error: error.message });
    }
}; 

export const createWeeklySchedule = async (req, res) => {
    const { weekStart, weekEnd, tickets } = req.body;

    // Validation
    if (!weekStart || !weekEnd || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide day of start and end within a week, and a valid array of tickets." 
        });
    }

    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);

    // Validate date range
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid date range. weekStart must be before weekEnd." 
        });
    }

    try {
        // Extract ticket IDs
        const ticketIds = tickets.map(t => t.ticketId);
        
        const foundTickets = await global.machineriesModels.TicketRequest.find({ 
            _id: { $in: ticketIds } 
        });
        
        if (foundTickets.length !== ticketIds.length) {
            return res.status(404).json({ success: false, message: "One or more tickets not found." });
        }

        // Create new weekly schedule
        const newSchedule = await global.machineriesModels.WeeklySchedule.create({
            weekStart: startDate,
            weekEnd: endDate,
        });

        // Update each ticket with its assigned date and schedule reference
        const updateOperations = [];
        
        for (const ticket of tickets) {
            // Validate that the assigned date is within the week range
            const assignedDate = new Date(ticket.assignedDate);
            
            if (isNaN(assignedDate.getTime()) || assignedDate < startDate || assignedDate > endDate) {
                await global.machineriesModels.WeeklySchedule.findByIdAndDelete(newSchedule._id);
                return res.status(400).json({ success: false, message: `Invalid assigned date for ticket ${ticket.ticketId}. Date must be within the week range. All operations aborted.`});
            }

            const operatorCheck = await global.globalModels.EmployeeAccount.findById(ticket.assignedOperatorId);
            if (!operatorCheck || !operatorCheck.roles.includes('MIS')) {
                await global.machineriesModels.WeeklySchedule.findByIdAndDelete(newSchedule._id);
                return res.status(404).json({ success: false, message: `Operator not found or does not have a valid role.` });
            };

            const machineUnitCheck = await global.machineriesModels.MachineriesUnit.findById(ticket.assignedMachineUnitId);
            if (!machineUnitCheck) {
                await global.machineriesModels.WeeklySchedule.findByIdAndDelete(newSchedule._id);
                return res.status(404).json({ success: false, message: `Machine unit not found.` });
            };

            //validate if a tciket already belongs to another schedule
            const checkExistingSchedule = await global.machineriesModels.TicketRequest.findById(ticket.ticketId);
            if (checkExistingSchedule.scheduleId) {
                await global.machineriesModels.WeeklySchedule.findByIdAndDelete(newSchedule._id);
                return res.status(400).json({ success: false, message: `Ticket ${ticket.ticketId} is already assigned to another schedule. All operations aborted.` });
            }

            // Build nested assignment details per schema
            const assignedMachineUnit = {
                assignedMachineUnitId: machineUnitCheck._id,
                plateNumber: machineUnitCheck.plateNumber,
                engineBrand: machineUnitCheck.engineBrand,
                engineHorsepower: machineUnitCheck.engineHorsepower
            };

            const assignedOperator = {
                assignedOperatorId: operatorCheck._id,
                first_name: operatorCheck.first_name,
                last_name: operatorCheck.last_name,
                middle_name: operatorCheck.middle_name,
                suffix: operatorCheck.suffix,
                email: operatorCheck.email,
                phone: operatorCheck.phone
            };

            const updateData = {
                assignedDate: assignedDate,
                scheduleId: newSchedule._id,
                assignedMachineUnit,
                assignedOperator,
                status: 'Scheduled'
            };

            const updateData1 = {
                $push: {
                    ticketRequests: {
                        ticketRequestId: ticket.ticketId,
                        assignedDate: assignedDate
                    }
                }
            };
            
            updateOperations.push(
                global.machineriesModels.TicketRequest.findByIdAndUpdate(
                    ticket.ticketId,
                    updateData,
                    { new: true }
                ),
                global.machineriesModels.WeeklySchedule.findOneAndUpdate(
                    newSchedule._id,
                    updateData1,
                    { new: true }
                )
            );
        }

        updateOperations.push(
            global.machineriesModels.WeeklySchedule.findOneAndUpdate(
                newSchedule._id,
                { status: 'Scheduled' },
                { new: true }
            )
        );
        
        // Execute all updates in parallel
        const updatedTickets = await Promise.all(updateOperations);

        return res.status(201).json({ success: true, message: "Weekly schedule created successfully.",
            data: {
                schedule: newSchedule,
                updatedTickets: updatedTickets
            }
        });
    } catch (error) {
        console.error("Error creating weekly schedule:", error);
        return res.status(500).json({ success: false, message: "Error creating weekly schedule.", error: error.message });
    }
};

export const removeTicketRequestFromSchedule = async (req, res) => {
    const { ticketRequestId } = req.params;

    if (!ticketRequestId) {
        return res.status(400).json({ success: false, message: "Please provide a ticket request ID." });
    }

    try {
        // Find the ticket request
        const ticketRequest = await global.machineriesModels.TicketRequest.findById(ticketRequestId);
        
        if (!ticketRequest) {
            return res.status(404).json({ success: false, message: "Ticket request not found." });
        }

        if (!ticketRequest.scheduleId) {
            return res.status(400).json({ success: false, message: "This ticket request is not assigned to any schedule."});
        }

        const scheduleId = ticketRequest.scheduleId;

        // Update the ticket request - remove schedule information
        const updatedTicketRequest = await global.machineriesModels.TicketRequest.findByIdAndUpdate(
            ticketRequestId,
            {
                $unset: {
                    scheduleId: "",
                    assignedDate: "",
                    assignedMachineUnitId: "",
                    assignedOperatorId: ""
                },
                status: "Pending"
            },
            { new: true }
        );

        // Update the weekly schedule - remove ticket from ticketRequests array
        const updatedSchedule = await global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
            scheduleId,
            {
                $pull: {
                    ticketRequests: { ticketRequestId: ticketRequestId }
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Ticket request has been removed from the schedule.",
            data: {
                ticketRequest: updatedTicketRequest,
                schedule: updatedSchedule
            }
        });
    } catch (error) {
        console.error("Error removing ticket request from schedule:", error);
        return res.status(500).json({ success: false, message: "Error removing ticket request from schedule.", error: error.message });
    }
};

export const moveTicketRequestToASchedule = async (req, res) => {
    const { targetScheduleId, tickets } = req.body;

    // Validate input
    if (!targetScheduleId || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide target schedule and a valid array of tickets." 
        });
    }

    try {
        // Check if the target schedule exists
        const targetSchedule = await global.machineriesModels.WeeklySchedule.findById(targetScheduleId);
        if (!targetSchedule) {
            return res.status(404).json({ success: false, message: "Target schedule not found."});
        }

        const ticketIds = tickets.map(t => t.ticketId);
        
        // Find all tickets
        const foundTickets = await global.machineriesModels.TicketRequest.find({ 
            _id: { $in: ticketIds } 
        });
        
        if (foundTickets.length !== ticketIds.length) {
            return res.status(404).json({  success: false, message: "One or more tickets not found." });
        }

        // Validate all assigned dates are within schedule range
        for (const ticket of tickets) {
            const assignedDate = new Date(ticket.assignedDate);
            
            if (isNaN(assignedDate.getTime()) || 
                assignedDate < targetSchedule.weekStart || 
                assignedDate > targetSchedule.weekEnd) {
                return res.status(400).json({
                    success: false,
                    message: 'Please check the ticket assigned dates. It must be within the target schedule range.'
                });
            }
            
            // Check for machine unit and operator conflicts
            if (ticket.assignedMachineUnitId || ticket.assignedOperatorId) {
                // Format assigned date to compare only the date part (not time)
                const dateToCheck = new Date(ticket.assignedDate);
                dateToCheck.setHours(0, 0, 0, 0);
                
                const nextDay = new Date(dateToCheck);
                nextDay.setDate(nextDay.getDate() + 1);
                
                // Build the conflict query
                const conflictQuery = {
                    _id: { $ne: ticket.ticketId }, // Exclude the current ticket
                    assignedDate: {
                        $gte: dateToCheck,
                        $lt: nextDay
                    },
                    status: 'Scheduled'
                };
                
                // Check for machine unit conflicts
                if (ticket.assignedMachineUnitId) {
                    const machineConflict = await global.machineriesModels.TicketRequest.findOne({
                        ...conflictQuery,
                        assignedMachineUnitId: ticket.assignedMachineUnitId
                    });
                    
                    if (machineConflict) {
                        return res.status(409).json({
                            success: false,
                            message: `Machine unit conflict: The machine unit assigned to ticket ${ticket.ticketId} is already scheduled for another ticket on the same date.`,
                            conflictingTicket: machineConflict._id
                        });
                    }
                }
                
                // Check for operator conflicts
                if (ticket.assignedOperatorId) {
                    const operatorConflict = await global.machineriesModels.TicketRequest.findOne({
                        ...conflictQuery,
                        assignedOperatorId: ticket.assignedOperatorId
                    });
                    
                    if (operatorConflict) {
                        return res.status(409).json({
                            success: false,
                            message: `Operator conflict: The operator assigned to ticket ${ticket.ticketId} is already scheduled for another ticket on the same date.`,
                            conflictingTicket: operatorConflict._id
                        });
                    }
                }
            }
        }

        // Process each ticket
        const updateOperations = [];
        const scheduleUpdates = [];
        
        for (const ticket of tickets) {
            const ticketRequest = foundTickets.find(t => t._id.toString() === ticket.ticketId);
            
            // If ticket is already in another schedule, remove it from that schedule
            if (ticketRequest.scheduleId && 
                ticketRequest.scheduleId.toString() !== targetScheduleId) {
                
                // Remove from previous schedule
                scheduleUpdates.push(
                    global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                        ticketRequest.scheduleId,
                        {
                            $pull: {
                                ticketRequests: { 
                                    "tr.trId": ticket.ticketId 
                                }
                            }
                        }
                    )
                );
            }

            // Update the ticket with new schedule information
            const updateData = {
                scheduleId: targetScheduleId,
                assignedDate: new Date(ticket.assignedDate),
                status: 'Scheduled'
            };
            
            // Add optional fields if provided
            if (ticket.assignedMachineUnitId) {
                updateData.assignedMachineUnitId = ticket.assignedMachineUnitId;
            }
            
            if (ticket.assignedOperatorId) {
                updateData.assignedOperatorId = ticket.assignedOperatorId;
            }
            
            updateOperations.push(
                global.machineriesModels.TicketRequest.findByIdAndUpdate(
                    ticket.ticketId,
                    updateData,
                    { new: true }
                )
            );

            // Check if the ticket is already in the target schedule
            const ticketInSchedule = await global.machineriesModels.WeeklySchedule.findOne({
                _id: targetScheduleId,
                'ticketRequests.tr.trId': ticket.ticketId
            });

            if (!ticketInSchedule) {
                // Add to the target schedule's ticketRequests array
                scheduleUpdates.push(
                    global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                        targetScheduleId,
                        {
                            $push: {
                                ticketRequests: {
                                    tr: {
                                        trId: ticket.ticketId,
                                        assignedDate: new Date(ticket.assignedDate)
                                    }
                                }
                            }
                        },
                        { new: true }
                    )
                );
            } else {
                // Update the existing ticket in the schedule with new assigned date
                scheduleUpdates.push(
                    global.machineriesModels.WeeklySchedule.findOneAndUpdate(
                        {
                            _id: targetScheduleId,
                            'ticketRequests.tr.trId': ticket.ticketId
                        },
                        {
                            $set: {
                                'ticketRequests.$.tr.assignedDate': new Date(ticket.assignedDate)
                            }
                        },
                        { new: true }
                    )
                );
            }
        }
        
        // Execute all updates
        const [updatedTickets, updatedSchedules] = await Promise.all([
            Promise.all(updateOperations),
            Promise.all(scheduleUpdates)
        ]);

        return res.status(200).json({
            success: true,
            message: "Ticket requests successfully moved to the target schedule.",
            data: {
                tickets: updatedTickets,
                schedules: updatedSchedules
            }
        });
    } catch (error) {
        console.error("Error moving ticket requests to schedule:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error moving ticket requests to schedule.", 
            error: error.message 
        });
    }
};

//fetch controllers
export const formGetAvailableMachineryTypes = async (req, res) => {
    try {
        const filter = {status: "Available"}
        const projection = {
            equipmentType: 1
        }
        const availableMachineryTypes = await global.machineriesModels.MachineriesType.find( filter, projection).lean();
        
        return res.status(200).json({
            success: true,
            message: "Available machinery types retrieved successfully.",
            data: availableMachineryTypes
        });
    } catch (error) {
        console.error("Error fetching available machinery types:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching available machinery types.", 
            error: error.message 
        });
    }
};

export const getMachineryTypes = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [];

        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { ownerName: { $regex: word, $options: 'i' } },
                    { ownerType: { $regex: word, $options: 'i' } },
                    { equipmentType: { $regex: word, $options: 'i' } },
                    { ratedCapacity: { $regex: word, $options: 'i' } },
                ],
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { _id: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.machineriesModels.MachineriesType.aggregate(pipeline);
        const relevantTypes = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: "Machinery types retrieved successfully.",
            data: {
                relevantTypes,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching machinery types:", error);
        return res.status(500).json({ success: false, message: "Error fetching machinery types.", error: error.message });
    }
};

export const getMachineryUnits = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const machineTypeColl = global.machineriesModels.MachineriesType.collection.name;

        const pipeline = [
            {
                $lookup: {
                    from: machineTypeColl,
                    localField: 'machineryTypeId',
                    foreignField: '_id',
                    as: 'machineTypeDetails'
                }
            },
            { $unwind: { path: '$machineTypeDetails', preserveNullAndEmptyArrays: true } },
        ];

        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { plateNumber: { $regex: word, $options: 'i' } },
                    { engineBrand: { $regex: word, $options: 'i' } },
                    { location: { $regex: word, $options: 'i' } },
                    { 'machineTypeDetails.equipmentType': { $regex: word, $options: 'i' } },
                    { 'machineTypeDetails.ownerName': { $regex: word, $options: 'i' } },
                ],
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { createdAt: -1, _id: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.machineriesModels.MachineriesUnit.aggregate(pipeline);
        const relevantUnits = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: "Machinery units retrieved successfully.",
            data: {
                relevantUnits,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching machinery units:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching machinery units.", 
            error: error.message 
        });
    }
};

export const getMachineryUnitsForDropDown = async (req, res) => {
    try {
        const projection = {
            _id: 1,
            plateNumber: 1,
        };
        const units = await global.machineriesModels.MachineriesUnit.find({status: "Available"}, projection).populate({path: 'machineryTypeId', select: 'equipmentType ownerName'});
        return res.status(200).json({success: true,message: "Machinery units for dropdown retrieved successfully.",data: units });
    } catch (error) {
        console.error("Error fetching machinery units for dropdown:", error);
        return res.status(500).json({ success: false, message: "Error fetching machinery units for dropdown.", error: error.message });
    }
};



// Helper to build $match for free-text and numeric search (adds estimatedArea equality when a term is numeric)
const buildTicketSearchMatch = (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return null;
    const words = searchQuery.trim().split(/\s+/);

    const andClauses = words.map((word) => {
        const num = Number(word);
        const numericClauses = Number.isFinite(num) ? [{ estimatedArea: num }] : [];

        return {
            $or: [
                // allow searching by ticket ref #
                { refNumber: { $regex: word, $options: 'i' } },

                { barangay: { $regex: word, $options: 'i' } },
                { 'requestorFarmer.first_name': { $regex: word, $options: 'i' } },
                { 'requestorFarmer.middle_name': { $regex: word, $options: 'i' } },
                { 'requestorFarmer.surname': { $regex: word, $options: 'i' } },
                { 'requestorFarmer.farmerId': { $regex: word, $options: 'i' } },

                { 'requestedMachineType.equipmentType': { $regex: word, $options: 'i' }},

                { 'assignedOperator.first_name': { $regex: word, $options: 'i' } },
                { 'assignedOperator.middle_name': { $regex: word, $options: 'i' } },
                { 'assignedOperator.last_name': { $regex: word, $options: 'i' } },
                { 'assignedOperator.email': { $regex: word, $options: 'i' } },
                { 'assignedOperator.phone': { $regex: word, $options: 'i' } },

                { 'assignedMachineUnit.plateNumber': { $regex: word, $options: 'i' } },
                { 'assignedMachineUnit.engineBrand': { $regex: word, $options: 'i' } },
                { 'assignedMachineUnit.engineHorsepower': { $regex: word, $options: 'i' } },

                // Numeric search on estimatedArea
                ...numericClauses
            ],
        };
    });

    return { $and: andClauses };
};


export const getPendingTicketRequests = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: { status: 'Pending' } },
        ];

        const searchMatch = buildTicketSearchMatch(searchQuery);
            if (searchMatch) {
                    pipeline.push({ $match: searchMatch });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { dateRequested: 1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.machineriesModels.TicketRequest.aggregate(pipeline);
        const relevantTickets = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            success: true,
            message: "Pending ticket requests retrieved successfully.",
            data: {
                relevantTickets,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error fetching pending ticket requests:", error);
        return res.status(500).json({ success: false, message: "Error fetching pending ticket requests.", error: error.message });
    }
};

export const getOngoingTicketRequests = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: { status: 'Ongoing' } },
        ];

        const searchMatch = buildTicketSearchMatch(searchQuery);
        if (searchMatch) {
            pipeline.push({ $match: searchMatch });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { dateRequested: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.machineriesModels.TicketRequest.aggregate(pipeline);
        const relevantTickets = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: "Ongoing ticket requests retrieved successfully.",
            data: {
                relevantTickets,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error fetching ongoing ticket requests:", error);
        return res.status(500).json({ success: false, message: "Error fetching ongoing ticket requests.", error: error.message });
    }
};

export const getScheduledTicketRequests = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: { status: 'Scheduled' } },
        ];

        const searchMatch = buildTicketSearchMatch(searchQuery);
        if (searchMatch) {
            pipeline.push({ $match: searchMatch });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { dateRequested: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.machineriesModels.TicketRequest.aggregate(pipeline);
        const relevantTickets = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: "Scheduled ticket requests retrieved successfully.",
            data: {
                relevantTickets,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error fetching scheduled ticket requests:", error);
        return res.status(500).json({ success: false, message: "Error fetching scheduled ticket requests.", error: error.message });
    }
};

export const getDeclinedTicketRequests = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            { $match: { status: 'Declined' } },
        ];

        const searchMatch = buildTicketSearchMatch(searchQuery);
        if (searchMatch) {
            pipeline.push({ $match: searchMatch });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { dateRequested: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.machineriesModels.TicketRequest.aggregate(pipeline);
        const relevantTickets = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: "Declined ticket requests retrieved successfully.",
            data: {
                relevantTickets,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error fetching declined ticket requests:", error);
        return res.status(500).json({ success: false, message: "Error fetching declined ticket requests.", error: error.message });
    }
};

export const getOperatorsList = async (req, res) => {
    try {
        const projection = {
            first_name: 1,
            last_name: 1,
            middle_name: 1,
            suffix: 1,
            email: 1,
            phone: 1
        }
        const operators = await global.globalModels.EmployeeAccount.find({ roles: 'MIS' }, projection).lean();

        return res.status(200).json({
            success: true,
            message: "Operators list retrieved successfully.",
            data: operators
        });

    } catch (error) {
        console.error("Error fetching operators list:", error);
        return res.status(500).json({ success: false, message: "Error fetching operators list.", error: error.message });
    }
};

