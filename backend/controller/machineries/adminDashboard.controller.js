// Helper: atomic daily counter via Counter collection to generate unique TR-YYYYMMDD-#### refs
const getNextCounterSeq = async (counterId) => {
    const doc = await global.machineriesModels.TRCounter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return doc.seq;
};

const getNextScheduleCounterSeq = async (counterId) => {
    const doc = await global.machineriesModels.SCounter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return doc.seq;
};

//PROCESS CONTROLLERS
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

export const declineTicketRequest = async (req, res) => {
    const { employeeId, tickets, reason } = req.body;

    if (!employeeId || !Array.isArray(tickets) || tickets.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide all of the required fields."
        });
    }

    try {
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({ success: false, message: "We cannot find your account. If this error persists please contact IT." });
        }

        const ticketIds = tickets.map(t => t._id);

        const foundTickets = await global.machineriesModels.TicketRequest.find(
            { _id: { $in: ticketIds } },
            { _id: 1 }
        );

        if (foundTickets.length !== ticketIds.length) {
            return res.status(404).json({ success: false, message: "One or more tickets not found. All operations aborted." });
        }

        // First check if ANY ticket is referenced in a schedule (do this outside the loop)
        const scheduleRef = await global.machineriesModels.WeeklySchedule.findOne({
            'ticketRequests.ticketRequestId': { $in: ticketIds }
        });

        if (scheduleRef) {
            return res.status(400).json({
                success: false,
                message: "Cannot decline a ticket that is still referenced in a weekly schedule."
            });
        }

        const updateOperations = [];

        for (const ticket of tickets) {
            updateOperations.push(
                global.machineriesModels.TicketRequest.findOneAndUpdate(
                {_id: ticket._id },
                {
                    status: 'Declined',
                    declinedBy: {
                        employeeId: employee._id,
                        first_name: employee.first_name,
                        last_name: employee.last_name,
                        middle_name: employee.middle_name,
                        suffix: employee.suffix,
                        email: employee.email,
                        phone: employee.phone
                    },
                    declineReason: reason
                }
            ));
        }

        await Promise.all(updateOperations);

        return res.status(200).json({ success: true, message: "Selected tickets has been declined successfully." });

    } catch (error) {
        console.error("Error declining ticket requests:", error);
        return res.status(500).json({ success: false, message: "Error declining ticket requests.", error: error.message });
    }
};

export const archiveTicketRequest = async (req, res) => {
    const { ticketRequestId, employeeId } = req.body;

    if (!ticketRequestId || !employeeId) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide the ticket request ID and employee ID." 
        });
    }

    try {
        const ticket = await global.machineriesModels.TicketRequest.findById(ticketRequestId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket request not found." });
        }

        if (ticket.scheduleId || ['Scheduled', 'Ongoing'].includes(ticket.status)) {
            return res.status(400).json({
                success: false,
                message: "Cannot archive a ticket that is Scheduled or Ongoing, or already assigned to a schedule."
            });
        }

        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({ success: false, message: "We cannot find your account. If this error persists please contact IT." });
        }

        // Defensive check in weekly schedules (supports both shapes stored historically)
        const scheduleRef = await global.machineriesModels.WeeklySchedule.findOne({
            $or: [
                { 'ticketRequests.ticketRequestId': { $in: [ticketRequestId] } }
            ]
        }).lean();

        if (scheduleRef) {
            return res.status(400).json({
                success: false,
                message: "Cannot archive a ticket that is still referenced in a weekly schedule."
            });
        }

        const archiveTicketRequest = await global.machineriesModels.TicketRequest.create(
            {
                requestorFarmer: {
                    requestorFarmerId: ticket.requestorFarmer.requestorFarmerId,
                    farmerId: ticket.requestorFarmer.farmerId,
                    surname: ticket.requestorFarmer.surname,
                    first_name: ticket.requestorFarmer.first_name,
                    middle_name: ticket.requestorFarmer.middle_name,
                    suffix: ticket.requestorFarmer.suffix,
                },
                requestedMachineType: {
                    requestedMachineTypeId: ticket.requestedMachineType.requestedMachineTypeId,
                    ownerName: ticket.requestedMachineType.ownerName,
                    ownerType: ticket.requestedMachineType.ownerType,
                    equipmentType: ticket.requestedMachineType.equipmentType,
                    ratedCapacity: ticket.requestedMachineType.ratedCapacity
                },
                
                refNumber: ticket.refNumber,
                barangay: ticket.barangay,
                estimatedArea: ticket.estimatedArea,
                dateRequested: ticket.dateRequested,

                declinedBy: { 
                    employeeId: ticket.declinedBy.employeeId,
                    last_name: ticket.declinedBy.last_name,
                    middle_name: ticket.declinedBy.middle_name,
                    suffix: ticket.declinedBy.suffix,
                    email: ticket.declinedBy.email,
                    phone: ticket.declinedBy.phone
                },

                archivedBy: {
                    employeeId: employee._id,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    middle_name: employee.middle_name,
                    suffix: employee.suffix,
                    email: employee.email,
                    phone: employee.phone
                },
            }
        );

        await global.machineriesModels.TicketRequest.findByIdAndDelete(ticketRequestId);
        
        return res.status(200).json({ success: true, message: "Ticket request archived successfully.", data: archiveTicketRequest });

    } catch (error) {
        console.error("Error archiving ticket request:", error);
        return res.status(500).json({ success: false, message: "Error archiving ticket request.", error: error.message });
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
            message: "Invalid date range. Start date must be before end date." 
        });
    }

    try {
        // Extract ticket IDs
        const ticketIds = tickets.map(t => t.ticketId);
        
        const foundTickets = await global.machineriesModels.TicketRequest.find({ 
            _id: { $in: ticketIds } 
        });
        
        if (foundTickets.length !== ticketIds.length) {
            return res.status(404).json({ success: false, message: "One or more tickets not found. All operations aborted." });
        }

        // NEW: Pre-validate assigned dates and enforce one ticket per date
        const toDateKey = (d) => new Date(d).toISOString().split('T')[0];
        const seenDates = new Set();
        for (const ticket of tickets) {
            const assignedDate = new Date(ticket.assignedDate);
            //check for valid date format
            if (isNaN(assignedDate.getTime())) {
                return res.status(400).json({ success: false, message: `Invalid assigned date for ticket ${ticket.ticketId}.` });
            }
            //check if within range
            if (assignedDate < startDate || assignedDate > endDate) {
                return res.status(400).json({ success: false, message: `Assigned date for ticket ${ticket.ticketId} must be within the schedule date range.` });
            }
            //check for duplicate dates
            const key = toDateKey(assignedDate);
            if (seenDates.has(key)) {
                return res.status(400).json({
                    success: false,
                    message: `Only one ticket per date is allowed in a schedule. Duplicate date ${key} detected.`
                });
            }
            seenDates.add(key);
        }

        // Build schedule ref number SC-YYYYMMDD-####
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const datePart = `${yyyy}${mm}${dd}`;
        const sSeq = await getNextScheduleCounterSeq(`SC-${datePart}`);
        const scheduleRefNumber = `SC-${datePart}-${String(sSeq).padStart(4, '0')}`;

        // Create new weekly schedule (status aligned to schema: Planned/In Progress/Completed)
        const newSchedule = await global.machineriesModels.WeeklySchedule.create({
            weekStart: startDate,
            weekEnd: endDate,
            refNumber: scheduleRefNumber,
            status: 'Planned'
        });

        // Update each ticket with its assigned date and schedule reference
        const updateOperations = [];
        
        for (const ticket of tickets) {

            const operatorCheck = await global.globalModels.EmployeeAccount.findById(ticket.assignedOperatorId);
            if (!operatorCheck || !operatorCheck.roles.includes('MIS')) {
                await global.machineriesModels.WeeklySchedule.findByIdAndDelete(newSchedule._id);
                return res.status(404).json({ success: false, message: `Operator not found or does not have a valid role. All operations aborted.` });
            };

            const machineUnitCheck = await global.machineriesModels.MachineriesUnit.findById(ticket.assignedMachineUnitId);
            if (!machineUnitCheck) {
                await global.machineriesModels.WeeklySchedule.findByIdAndDelete(newSchedule._id);
                return res.status(404).json({ success: false, message: `Machine unit not found. All operations aborted.` });
            };

            // validate if a ticket already belongs to another schedule
            const checkExistingSchedule = await global.machineriesModels.TicketRequest.findById(ticket.ticketId);
            if (checkExistingSchedule.scheduleId) {
                await global.machineriesModels.WeeklySchedule.findByIdAndDelete(newSchedule._id);
                return res.status(400).json({ success: false, message: `Ticket ${ticket.refNumber} is already assigned to another schedule. All operations aborted.` });
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
                assignedDate: ticket.assignedDate,
                scheduleId: newSchedule._id,
                assignedMachineUnit,
                assignedOperator,
                status: 'Scheduled'
            };

            const updateScheduleData = {
                $push: {
                    ticketRequests: {
                        ticketRequestId: ticket.ticketId,
                        assignedDate: ticket.assignedDate
                    }
                }
            };
            
            updateOperations.push(
                global.machineriesModels.TicketRequest.findByIdAndUpdate(
                    ticket.ticketId,
                    updateData,
                    { new: true }
                ),
                global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                    newSchedule._id,
                    updateScheduleData,
                    { new: true }
                )
            );
        }

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

export const updateWeeklySchedule = async (req, res) => {
    const { scheduleId, tickets } = req.body;

    if (!scheduleId || !Array.isArray(tickets) || tickets.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide scheduleId and a non-empty tickets array."
        });
    }

    try {
        const schedule = await global.machineriesModels.WeeklySchedule.findById(scheduleId).lean();
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Weekly schedule not found." });
        }

        const weekStart = new Date(schedule.weekStart);
        const weekEnd = new Date(schedule.weekEnd);

        // Helper to normalize dates (same as createWeeklySchedule)
        const toDateKey = (d) => new Date(d).toISOString().split('T')[0];

        // Build a map of ticketId -> current assigned date in schedule
        const currentScheduleDates = new Map(
            (schedule.ticketRequests || []).map(tr => [
                tr.ticketRequestId.toString(), 
                toDateKey(tr.assignedDate)
            ])
        );

        // Validate tickets being updated
        const ticketIds = tickets.map(t => t.ticketId);
        
        // Check if all tickets belong to this schedule
        for (const tid of ticketIds) {
            if (!currentScheduleDates.has(tid)) {
                return res.status(400).json({
                    success: false,
                    message: `Ticket ${tid} is not part of this schedule.`
                });
            }
        }

        // Build simulated state after update to check for duplicate dates
        const simulatedDates = new Map(currentScheduleDates);
        
        for (const t of tickets) {
            const assignedDate = new Date(t.assignedDate);
            
            // Validate date format
            if (isNaN(assignedDate.getTime())) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid assignedDate for ticket ${t.ticketId}.` 
                });
            }
            
            // Validate within range
            if (assignedDate < weekStart || assignedDate > weekEnd) {
                return res.status(400).json({
                    success: false,
                    message: `Assigned date for ticket ${t.ticketId} must be within the schedule date range (${toDateKey(weekStart)} to ${toDateKey(weekEnd)}).`
                });
            }

            // Update simulated dates map
            const dateKey = toDateKey(assignedDate);
            simulatedDates.set(t.ticketId, dateKey);
        }

        // Check for duplicate dates in the simulated final state (same logic as createWeeklySchedule)
        const allDates = Array.from(simulatedDates.values());
        const uniqueDates = new Set(allDates);
        
        if (allDates.length !== uniqueDates.size) {
            // Find which date is duplicated
            const dateCount = {};
            allDates.forEach(d => {
                dateCount[d] = (dateCount[d] || 0) + 1;
            });
            const duplicateDate = Object.keys(dateCount).find(d => dateCount[d] > 1);
            
            return res.status(400).json({
                success: false,
                message: `Only one ticket per date is allowed in a schedule. Duplicate date ${duplicateDate} detected.`
            });
        }

        // Validate operators and machines exist (but no conflict checking), also kung naka true yung disabledForEditing. Operators and machine units, can be used at multiple dates or even all of the dates, its just that, a ticket request cannot have a same day.
        for (const t of tickets) {
            // Validate operator exists and has correct role
            const operatorDoc = await global.globalModels.EmployeeAccount.findById(t.assignedOperatorId);
            if (!operatorDoc || !Array.isArray(operatorDoc.roles) || !operatorDoc.roles.includes('MIS')) {
                return res.status(404).json({
                    success: false,
                    message: `Operator ${t.assignedOperatorId} not found or does not have a valid role.`
                });
            }

            // Validate machine exists
            const machineDoc = await global.machineriesModels.MachineriesUnit.findById(t.assignedMachineUnitId);
            if (!machineDoc) {
                return res.status(404).json({
                    success: false,
                    message: `Machine unit ${t.assignedMachineUnitId} not found.`
                });
            }
            const ticketDoc = await global.machineriesModels.TicketRequest.findById(t.ticketId).lean();
            if (ticketDoc.disabledForEditing === true) {
                return res.status(400).json({
                    success: false,
                    message: `Ticket ${ticketDoc.refNumber} is disabled for editing and cannot be updated in this schedule.`
                });
            }

        }

        // All validations passed - perform updates
        const updateOps = [];

        for (const t of tickets) {
            const assignedDate = new Date(t.assignedDate);

            // Fetch operator and machine to embed denormalized details
            const operator = await global.globalModels.EmployeeAccount.findById(t.assignedOperatorId).lean();
            const machine = await global.machineriesModels.MachineriesUnit.findById(t.assignedMachineUnitId).lean();

            const assignedMachineUnit = {
                assignedMachineUnitId: machine._id,
                plateNumber: machine.plateNumber,
                engineBrand: machine.engineBrand,
                engineHorsepower: machine.engineHorsepower
            };

            const assignedOperator = {
                assignedOperatorId: operator._id,
                first_name: operator.first_name,
                last_name: operator.last_name,
                middle_name: operator.middle_name,
                suffix: operator.suffix,
                email: operator.email,
                phone: operator.phone
            };

            // Update TicketRequest document
            updateOps.push(
                global.machineriesModels.TicketRequest.findByIdAndUpdate(
                    t.ticketId,
                    {
                        assignedDate,
                        assignedMachineUnit,
                        assignedOperator,
                        status: 'Scheduled'
                    },
                    { new: true }
                )
            );

            // Update assignedDate in WeeklySchedule.ticketRequests array
            updateOps.push(
                global.machineriesModels.WeeklySchedule.updateOne(
                    { _id: scheduleId, 'ticketRequests.ticketRequestId': t.ticketId },
                    { $set: { 'ticketRequests.$.assignedDate': assignedDate } }
                )
            );
        }

        await Promise.all(updateOps);

        return res.status(200).json({
            success: true,
            message: "Weekly schedule updated successfully.",
            data: {
                updatedTickets: tickets.length
            }
        });
    } catch (error) {
        console.error("Error updating weekly schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating weekly schedule.",
            error: error.message
        });
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
            return res.status(400).json({ success: false, message: "This ticket request already is not assigned to any schedule."});
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
            message: "Please provide the target schedule and a valid array of tickets." 
        });
    }

    try {
        // Check if the target schedule exists
        const targetSchedule = await global.machineriesModels.WeeklySchedule.findById(targetScheduleId).lean();
        if (!targetSchedule) {
            return res.status(404).json({ success: false, message: "Target schedule not found."});
        }

        const weekStart = new Date(targetSchedule.weekStart);
        const weekEnd = new Date(targetSchedule.weekEnd);

        const ticketIds = tickets.map(t => t.ticketId);
        
        // Find all tickets
        const foundTickets = await global.machineriesModels.TicketRequest.find({ 
            _id: { $in: ticketIds } 
        });
        
        if (foundTickets.length !== ticketIds.length) {
            return res.status(404).json({  success: false, message: "One or more tickets not found." });
        }

        // Helper to normalize dates to YYYY-MM-DD
        const toDateKey = (d) => new Date(d).toISOString().split('T')[0];

        // Build map of existing dates in target schedule (excluding tickets being moved)
        const existingDatesInSchedule = new Set(
            (targetSchedule.ticketRequests || [])
                .filter(tr => !ticketIds.includes(tr.ticketRequestId.toString()))
                .map(tr => toDateKey(tr.assignedDate))
        );

        // Validate new tickets and check for duplicate dates
        const newTicketDates = new Set();
        
        for (const ticket of tickets) {
            const assignedDate = new Date(ticket.assignedDate);
            
            // Check for valid date format
            if (isNaN(assignedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid assigned date for ticket ${ticket.ticketId}.`
                });
            }

            // Check if within schedule range
            if (assignedDate < weekStart || assignedDate > weekEnd) {
                return res.status(400).json({
                    success: false,
                    message: `Assigned date for ticket ${ticket.ticketId} must be within the target schedule range.`
                });
            }

            const dateKey = toDateKey(assignedDate);

            // Check if date is already used in the schedule
            if (existingDatesInSchedule.has(dateKey)) {
                return res.status(400).json({
                    success: false,
                    message: `Date ${dateKey} is already assigned to another ticket in this schedule.`
                });
            }

            // Check for duplicate dates within the tickets being added
            if (newTicketDates.has(dateKey)) {
                return res.status(400).json({
                    success: false,
                    message: `Only one ticket per date is allowed in a schedule. Duplicate date ${dateKey} detected.`
                });
            }

            newTicketDates.add(dateKey);

            // Validate operator exists and has correct role
            if (ticket.assignedOperatorId) {
                const operatorCheck = await global.globalModels.EmployeeAccount.findById(ticket.assignedOperatorId);
                if (!operatorCheck || !operatorCheck.roles.includes('MIS')) {
                    return res.status(404).json({ 
                        success: false, 
                        message: `Operator not found or does not have a valid role for ticket ${ticket.ticketId}.` 
                    });
                }
            }

            // Validate machine unit exists
            if (ticket.assignedMachineUnitId) {
                const machineUnitCheck = await global.machineriesModels.MachineriesUnit.findById(ticket.assignedMachineUnitId);
                if (!machineUnitCheck) {
                    return res.status(404).json({ 
                        success: false, 
                        message: `Machine unit not found for ticket ${ticket.ticketId}.` 
                    });
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
                
                scheduleUpdates.push(
                    global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                        ticketRequest.scheduleId,
                        {
                            $pull: {
                                ticketRequests: { ticketRequestId: ticket.ticketId }
                            }
                        }
                    )
                );
            }

            // Fetch operator and machine to build nested objects
            const operator = await global.globalModels.EmployeeAccount.findById(ticket.assignedOperatorId).lean();
            const machine = await global.machineriesModels.MachineriesUnit.findById(ticket.assignedMachineUnitId).lean();

            const assignedMachineUnit = {
                assignedMachineUnitId: machine._id,
                plateNumber: machine.plateNumber,
                engineBrand: machine.engineBrand,
                engineHorsepower: machine.engineHorsepower
            };

            const assignedOperator = {
                assignedOperatorId: operator._id,
                first_name: operator.first_name,
                last_name: operator.last_name,
                middle_name: operator.middle_name,
                suffix: operator.suffix,
                email: operator.email,
                phone: operator.phone
            };

            // Update the ticket with new schedule information
            const updateData = {
                scheduleId: targetScheduleId,
                assignedDate: new Date(ticket.assignedDate),
                assignedMachineUnit,
                assignedOperator,
                status: 'Scheduled'
            };
            
            updateOperations.push(
                global.machineriesModels.TicketRequest.findByIdAndUpdate(
                    ticket.ticketId,
                    updateData,
                    { new: true }
                )
            );

            // Check if the ticket is already in the target schedule
            const ticketInSchedule = targetSchedule.ticketRequests?.some(
                tr => tr.ticketRequestId.toString() === ticket.ticketId
            );

            if (!ticketInSchedule) {
                // Add to the target schedule's ticketRequests array
                scheduleUpdates.push(
                    global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                        targetScheduleId,
                        {
                            $push: {
                                ticketRequests: {
                                    ticketRequestId: ticket.ticketId,
                                    assignedDate: new Date(ticket.assignedDate)
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
                            'ticketRequests.ticketRequestId': ticket.ticketId
                        },
                        {
                            $set: {
                                'ticketRequests.$.assignedDate': new Date(ticket.assignedDate)
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

export const undeclineTicketRequest = async (req, res) => {
    try {
        const { ticketRequestId } = req.body;

        if (!ticketRequestId) {
            return res.status(400).json({
                success: false,
                message: "Please provide the request ticket."
            });
        }

        const ticket = await global.machineriesModels.TicketRequest.findById(ticketRequestId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket request not found."
            });
        }

        if (ticket.status !== 'Declined') {
            return res.status(400).json({
                success: false,
                message: "The ticket request is already not declined."
            });
        }

        // Revert to pending and clear decline metadata
        const updated = await global.machineriesModels.TicketRequest.findByIdAndUpdate(
            ticketRequestId,
            {
                status: 'Pending',
                $unset: {
                    declinedBy: "",
                    declineReason: ""
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Ticket request has been reverted to Pending.",
            data: updated
        });
    } catch (error) {
        console.error("Error undeclining ticket request:", error);
        return res.status(500).json({
            success: false,
            message: "Error undeclining ticket request.",
            error: error.message
        });
    }
};

import { uploadFileToDrive } from '../googleDrive.controller.js';

export const setRequestTicketToComplete = async (req, res) => {
    const { ticketRequestId, extensionRequest, areaServiced, remainingArea, remarks } = req.body;

    if (!ticketRequestId) {
        return res.status(400).json({
            success: false,
            message: "Please provide the ticket request ID."
        });
    }

    // Check if files are uploaded
    if (!req.files || !req.files.proofImage || !req.files.signature) {
        return res.status(400).json({
            success: false,
            message: "Please provide both proof image and signature."
        });
    }

    // Validate extension request fields if extension is requested
    if (extensionRequest === 'true') {
        if (!areaServiced || !remainingArea) {
            return res.status(400).json({
                success: false,
                message: "Please provide area serviced and remaining area for extension request."
            });
        }

        // Validate numeric values
        const areaServicedNum = parseFloat(areaServiced);
        const remainingAreaNum = parseFloat(remainingArea);

        if (isNaN(areaServicedNum) || isNaN(remainingAreaNum) || areaServicedNum <= 0 || remainingAreaNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Area serviced and remaining area must be valid positive numbers."
            });
        }
    }

    try {
        // Find the ticket request
        const ticket = await global.machineriesModels.TicketRequest.findById(ticketRequestId);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket request not found."
            });
        }

        // Validate ticket status
        if (ticket.status !== 'Ongoing') {
            return res.status(400).json({
                success: false,
                message: "Only ongoing tickets can be marked as completed."
            });
        }

        // Validate schedule exists
        if (!ticket.scheduleId) {
            return res.status(400).json({
                success: false,
                message: "Ticket is not assigned to any schedule."
            });
        }

        const proofImageFile = req.files.proofImage[0];
        const signatureFile = req.files.signature[0];

        // Upload proof image using the Google Drive service
        const proofImageName = `proof_${ticket.refNumber}`;
        const proofImageResult = await uploadFileToDrive(
            proofImageFile.buffer,
            proofImageName,
            proofImageFile.mimetype,
            process.env.GOOGLE_DRIVE_FOLDER_ID_SELFIE_PROOFS_MACHINERIES
        );

        // Upload signature using the Google Drive service
        const signatureName = `signature_${ticket.refNumber}`;
        const signatureResult = await uploadFileToDrive(
            signatureFile.buffer,
            signatureName,
            signatureFile.mimetype,
            process.env.GOOGLE_DRIVE_FOLDER_ID_FARMER_SIGNATURES_MACHINERIES
        );

        // Build update data
        const updateData = {
            status: 'Completed',
            completionProof: {
                proofImageId: proofImageResult.id,
                proofImageUrl: `https://drive.google.com/uc?id=${proofImageResult.id}`,
                signatureId: signatureResult.id,
                signatureUrl: `https://drive.google.com/uc?id=${signatureResult.id}`,
                completedAt: new Date()
            },
            disabledForEditing: true
        };

        // Add remarks if provided
        if (remarks && remarks.trim()) {
            updateData.remarks = remarks.trim();
        }

        // Add extension details if extension is requested
        if (extensionRequest === 'true') {
            updateData.extensionDetails = {
                areaServiced: parseFloat(areaServiced),
                remainingArea: parseFloat(remainingArea)
            };
            updateData.extensionNeeded = true;
        }

        // Update ticket with completion details
        const updatedTicket = await global.machineriesModels.TicketRequest.findByIdAndUpdate(
            ticketRequestId,
            updateData,
            { new: true }
        );

        // Check if all tickets in the schedule are completed
        const schedule = await global.machineriesModels.WeeklySchedule.findById(ticket.scheduleId);
        const allTicketIds = schedule.ticketRequests.map(tr => tr.ticketRequestId);
        
        const allTickets = await global.machineriesModels.TicketRequest.find({
            _id: { $in: allTicketIds }
        });

        const allCompleted = allTickets.every(t => t.status === 'Completed');

        // If all tickets are completed, update schedule status
        if (allCompleted) {
            await global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                ticket.scheduleId,
                { status: 'Completed' }
            );
        }

        return res.status(200).json({
            success: true,
            message: extensionRequest === 'true' 
                ? "Ticket marked as completed with extension request successfully." 
                : "Ticket marked as completed successfully.",
            data: {
                ticket: updatedTicket,
                scheduleCompleted: allCompleted,
                extensionRequested: extensionRequest === 'true'
            }
        });

    } catch (error) {
        console.error("Error marking ticket as completed:", error);
        return res.status(500).json({
            success: false,
            message: "Error marking ticket as completed.",
            error: error.message
        });
    }
};

//FETCH CONTROLLERS
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
        const { machineryTypeId } = req.query;

        const projection = {
            _id: 1,
            plateNumber: 1,
        };

        const filter = { status: "Available" };
        if (machineryTypeId) {
            filter.machineryTypeId = machineryTypeId; // add the machinery type filter if provided
        }

        const units = await global.machineriesModels.MachineriesUnit //get all machineries units with the provided machinery type id
            .find(filter, projection)
            .populate({ path: 'machineryTypeId', select: 'equipmentType ownerName' });

        return res.status(200).json({
            success: true,
            message: "Machinery units for dropdown retrieved successfully.",
            data: units
        });
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

                { 'requestedMachineType.equipmentType': { $regex: word, $options: 'i'}},

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

export const getPlannedWeeklySchedules = async (req, res) => { //planned or scheduled weekly schedules
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build match criteria for search
        let matchCriteria = { status: 'Planned' };
        
        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { refNumber: { $regex: word, $options: 'i' } },
                    { status: { $regex: word, $options: 'i' } }
                ],
            }));
            matchCriteria = { $and: [ { status: 'Planned' }, ...searchConditions ] };
        }

        // Find schedules with pagination
        const schedules = await global.machineriesModels.WeeklySchedule
            .find(matchCriteria)
            .sort({ weekStart: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await global.machineriesModels.WeeklySchedule
            .countDocuments(matchCriteria);

        // Extract all ticket IDs from the schedules
        const ticketIds = [];
        schedules.forEach(schedule => {
            schedule.ticketRequests.forEach(tr => {
                if (tr.ticketRequestId) {
                    ticketIds.push(tr.ticketRequestId);
                }
            });
        });

        // Fetch all ticket requests with populated data
        const ticketRequests = await global.machineriesModels.TicketRequest
            .find({ _id: { $in: ticketIds } })
            .lean();

        // Enhance schedules with ticket details
        const enhancedSchedules = schedules.map(schedule => {
            // Map ticket requests to include their details
            const enhancedTickets = schedule.ticketRequests.map(tr => {
                const fullTicket = ticketRequests.find(
                    t => t._id.toString() === tr.ticketRequestId.toString()
                );
                
                return {
                    ...tr,
                    ticketDetails: fullTicket || null
                };
            });

            return {
                ...schedule,
                ticketRequests: enhancedTickets
            };
        });

        return res.status(200).json({
            success: true,
            message: "Weekly schedules retrieved successfully.",
            data: {
                relevantSchedules: enhancedSchedules,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching planned weekly schedules:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching planned weekly schedules.", 
            error: error.message 
        });
    }
};

export const getInProgressWeeklySchedules = async (req, res) => { //in progress or ongoing weekly schedules
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build match criteria for search
        let matchCriteria = { status: 'In Progress' };

        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { refNumber: { $regex: word, $options: 'i' } },
                    { status: { $regex: word, $options: 'i' } }
                ],
            }));
            matchCriteria = { $and: [ { status: 'In Progress' }, ...searchConditions ] };
        }

        // Find schedules with pagination
        const schedules = await global.machineriesModels.WeeklySchedule
            .find(matchCriteria)
            .sort({ weekStart: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await global.machineriesModels.WeeklySchedule
            .countDocuments(matchCriteria);

        // Extract all ticket IDs from the schedules
        const ticketIds = [];
        schedules.forEach(schedule => {
            schedule.ticketRequests.forEach(tr => {
                if (tr.ticketRequestId) {
                    ticketIds.push(tr.ticketRequestId);
                }
            });
        });

        // Fetch all ticket requests with populated data
        const ticketRequests = await global.machineriesModels.TicketRequest
            .find({ _id: { $in: ticketIds } })
            .lean();

        // Enhance schedules with ticket details
        const enhancedSchedules = schedules.map(schedule => {
            // Map ticket requests to include their details
            const enhancedTickets = schedule.ticketRequests.map(tr => {
                const fullTicket = ticketRequests.find(
                    t => t._id.toString() === tr.ticketRequestId.toString()
                );
                
                return {
                    ...tr,
                    ticketDetails: fullTicket || null
                };
            });

            return {
                ...schedule,
                ticketRequests: enhancedTickets
            };
        });

        return res.status(200).json({
            success: true,
            message: "Weekly schedules retrieved successfully.",
            data: {
                relevantSchedules: enhancedSchedules,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching in progress weekly schedules:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching in progress weekly schedules.", 
            error: error.message 
        });
    }
};