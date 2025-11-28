import mongoose from 'mongoose';

//UNUSED CONTROLLERS
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

export const deleteScheduleAndTickets = async (req, res) => {//FOR TESTING PURPOSES (NASA ROUTES)
    const { scheduleId } = req.params;

    if (!scheduleId) {
        return res.status(400).json({
            success: false,
            message: "Please provide the schedule ID."
        });
    }

    try {
        // Find the schedule
        const schedule = await global.machineriesModels.WeeklySchedule.findById(scheduleId).lean();
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Weekly schedule not found."
            });
        }

        // Extract all ticket IDs from the schedule
        const ticketIds = schedule.ticketRequests.map(tr => tr.ticketRequestId);

        if (ticketIds.length > 0) {
            // Delete all tickets associated with this schedule
            await global.machineriesModels.TicketRequest.deleteMany({
                _id: { $in: ticketIds }
            });
        }

        // Delete the schedule itself
        await global.machineriesModels.WeeklySchedule.findByIdAndDelete(scheduleId);

        return res.status(200).json({
            success: true,
            message: "Weekly schedule and all associated tickets deleted successfully.",
            data: {
                deletedScheduleId: scheduleId,
                deletedTicketsCount: ticketIds.length
            }
        });
    } catch (error) {
        console.error("Error deleting schedule and tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting schedule and tickets.",
            error: error.message
        });
    }
};

export const getMachineryUnitStatusHistory = async (req, res) => {
    const { machineryUnitId } = req.params;

    if (!machineryUnitId) {
        return res.status(400).json({
            success: false,
            message: "Please provide machinery unit ID."
        });
    }

    try {
        const machineryUnit = await global.machineriesModels.MachineriesUnit
            .findById(machineryUnitId)
            .select('unitNumber statusHistory')
            .lean();

        if (!machineryUnit) {
            return res.status(404).json({
                success: false,
                message: "Machinery unit not found."
            });
        }

        // Sort status history by date (most recent first)
        const sortedHistory = (machineryUnit.statusHistory || []).sort((a, b) => 
            new Date(b.changedAt) - new Date(a.changedAt)
        );

        return res.status(200).json({
            success: true,
            message: "Machinery unit status history retrieved successfully.",
            data: {
                unitNumber: machineryUnit.unitNumber,
                statusHistory: sortedHistory
            }
        });

    } catch (error) {
        console.error("Error fetching machinery unit status history:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching machinery unit status history.",
            error: error.message
        });
    }
};

export const recordMachineryMaintenance = async (req, res) => {
    const { machineryUnitId, employeeId, maintenanceDate, nextMaintenanceDate, notes } = req.body;

    if (!machineryUnitId || !employeeId || !maintenanceDate) {
        return res.status(400).json({
            success: false,
            message: "Please provide machinery unit ID, employee ID, and maintenance date."
        });
    }

    try {
        const machineryUnit = await global.machineriesModels.MachineriesUnit.findById(machineryUnitId);
        
        if (!machineryUnit) {
            return res.status(404).json({
                success: false,
                message: "Machinery unit not found."
            });
        }

        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee account not found."
            });
        }

        // Update maintenance dates
        machineryUnit.lastMaintenanceDate = new Date(maintenanceDate);
        
        if (nextMaintenanceDate) {
            machineryUnit.nextMaintenanceDate = new Date(nextMaintenanceDate);
        }

        // Add to status history
        const historyEntry = {
            status: machineryUnit.status,
            condition: machineryUnit.condition,
            reason: notes && notes.trim() ? `Maintenance: ${notes.trim()}` : 'Routine maintenance performed',
            changedBy: {
                _id: employee._id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                middle_name: employee.middle_name,
                suffix: employee.suffix,
                email: employee.email,
                phone: employee.phone
            },
            changedAt: new Date(maintenanceDate)
        };

        machineryUnit.statusHistory.push(historyEntry);

        await machineryUnit.save();

        return res.status(200).json({
            success: true,
            message: "Machinery maintenance recorded successfully.",
            data: machineryUnit
        });

    } catch (error) {
        console.error("Error recording machinery maintenance:", error);
        return res.status(500).json({
            success: false,
            message: "Error recording machinery maintenance.",
            error: error.message
        });
    }
};

export const getMachineryUnitsByStatus = async (req, res) => {
    const { status } = req.query;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Please provide a status to filter by."
        });
    }

    const validStatuses = ['Available', 'In Use', 'Under Repair', 'Retired', 'Not for Use'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status. Must be one of: " + validStatuses.join(', ')
        });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const machineTypeColl = global.machineriesModels.MachineriesType.collection.name;

        const pipeline = [
            { $match: { status } },
            {
                $lookup: {
                    from: machineTypeColl,
                    localField: 'machineryTypeId',
                    foreignField: '_id',
                    as: 'machineTypeDetails'
                }
            },
            { $unwind: { path: '$machineTypeDetails', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    paginatedResults: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ];

        const result = await global.machineriesModels.MachineriesUnit.aggregate(pipeline);
        const machineryUnits = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: `Machinery units with status '${status}' retrieved successfully.`,
            data: {
                machineryUnits,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error fetching machinery units by status:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching machinery units by status.",
            error: error.message
        });
    }
};

export const getMachineryMaintenanceSchedule = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const now = new Date();

        const pipeline = [
            {
                $match: {
                    nextMaintenanceDate: { $exists: true },
                    isRetired: { $ne: true }
                }
            },
            {
                $addFields: {
                    isOverdue: { $lt: ['$nextMaintenanceDate', now] },
                    daysUntilMaintenance: {
                        $divide: [
                            { $subtract: ['$nextMaintenanceDate', now] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            { $sort: { nextMaintenanceDate: 1 } },
            {
                $lookup: {
                    from: global.machineriesModels.MachineriesType.collection.name,
                    localField: 'machineryTypeId',
                    foreignField: '_id',
                    as: 'machineTypeDetails'
                }
            },
            { $unwind: { path: '$machineTypeDetails', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [{ $count: 'count' }],
                    overdueCount: [
                        { $match: { isOverdue: true } },
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await global.machineriesModels.MachineriesUnit.aggregate(pipeline);
        const maintenanceSchedule = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;
        const overdueCount = result[0]?.overdueCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: "Machinery maintenance schedule retrieved successfully.",
            data: {
                maintenanceSchedule,
                totalCount,
                overdueCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error fetching machinery maintenance schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching machinery maintenance schedule.",
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

export const setTicketToInTransit = async (req, res) => { //future use
    const { ticketRequestId, operatorId } = req.body;

    if (!ticketRequestId || !operatorId) {
        return res.status(400).json({
            success: false,
            message: "Please provide ticket request ID and operator ID."
        });
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
        if (ticket.status !== 'Scheduled') {
            return res.status(400).json({
                success: false,
                message: "Only scheduled tickets can be set to in transit."
            });
        }

        // Validate operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId).lean();
        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator account not found."
            });
        }

        if (!operator.roles || (!operator.roles.includes('MIS') && !operator.roles.includes('MIM'))) {
            return res.status(400).json({
                success: false,
                message: "The provided user is not an authorized operator."
            });
        }

        // Validate assigned date is today
        const toDateKey = (d) => new Date(d).toISOString().split('T')[0];
        const todayKey = toDateKey(new Date());
        const assignedDateKey = toDateKey(ticket.assignedDate);

        if (assignedDateKey !== todayKey) {
            return res.status(400).json({
                success: false,
                message: "Ticket can only be set to in transit on its assigned date."
            });
        }

        // Check if already in transit
        if (ticket.statusTimeline?.inTransit) {
            return res.status(400).json({
                success: false,
                message: "Ticket is already marked as in transit."
            });
        }

        // Update ticket
        const updatedTicket = await global.machineriesModels.TicketRequest.findByIdAndUpdate(
            ticketRequestId,
            {
                $set: {
                    'statusTimeline.inTransit': new Date()
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Ticket marked as in transit successfully.",
            data: updatedTicket
        });

    } catch (error) {
        console.error("Error setting ticket to in transit:", error);
        return res.status(500).json({
            success: false,
            message: "Error setting ticket to in transit.",
            error: error.message
        });
    }
};

export const setTicketToArrivedOnSite = async (req, res) => { //future use
    const { ticketRequestId, operatorId } = req.body;

    if (!ticketRequestId || !operatorId) {
        return res.status(400).json({
            success: false,
            message: "Please provide ticket request ID and operator ID."
        });
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
        if (ticket.status !== 'Scheduled') {
            return res.status(400).json({
                success: false,
                message: "Only scheduled tickets can be set to arrived on site."
            });
        }

        // Validate operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId).lean();
        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator account not found."
            });
        }

        if (!operator.roles || (!operator.roles.includes('MIS') && !operator.roles.includes('MIM'))) {
            return res.status(400).json({
                success: false,
                message: "The provided user is not an authorized operator."
            });
        }

        // Validate assigned date is today
        const toDateKey = (d) => new Date(d).toISOString().split('T')[0];
        const todayKey = toDateKey(new Date());
        const assignedDateKey = toDateKey(ticket.assignedDate);

        if (assignedDateKey !== todayKey) {
            return res.status(400).json({
                success: false,
                message: "Ticket can only be set to arrived on site on its assigned date."
            });
        }

        // Check if in transit timestamp exists
        if (!ticket.statusTimeline?.inTransit) {
            return res.status(400).json({
                success: false,
                message: "Ticket must be in transit before arriving on site."
            });
        }

        // Check if already arrived
        if (ticket.statusTimeline?.arrivedOnSite) {
            return res.status(400).json({
                success: false,
                message: "Ticket is already marked as arrived on site."
            });
        }

        // Update ticket status to Ongoing and set arrivedOnSite timestamp
        const updatedTicket = await global.machineriesModels.TicketRequest.findByIdAndUpdate(
            ticketRequestId,
            {
                status: 'Ongoing',
                $set: {
                    'statusTimeline.arrivedOnSite': new Date()
                }
            },
            { new: true }
        );

        // Update schedule status to In Progress if not already
        if (ticket.scheduleId) {
            await global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                ticket.scheduleId,
                { status: 'In Progress' }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Ticket marked as arrived on site successfully.",
            data: updatedTicket
        });

    } catch (error) {
        console.error("Error setting ticket to arrived on site:", error);
        return res.status(500).json({
            success: false,
            message: "Error setting ticket to arrived on site.",
            error: error.message
        });
    }
};

export const setTicketToMachineReturned = async (req, res) => { //future use
    const { ticketRequestId, operatorId } = req.body;

    if (!ticketRequestId || !operatorId) {
        return res.status(400).json({
            success: false,
            message: "Please provide ticket request ID and operator ID."
        });
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
                message: "Only ongoing or completed tickets can be set to machine returned."
            });
        }

        // Validate operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId).lean();
        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator account not found."
            });
        }

        if (!operator.roles || (!operator.roles.includes('MIS') && !operator.roles.includes('MIM'))) {
            return res.status(400).json({
                success: false,
                message: "The provided user is not an authorized operator."
            });
        }

        // Validate assigned date is today
        const toDateKey = (d) => new Date(d).toISOString().split('T')[0];
        const todayKey = toDateKey(new Date());
        const assignedDateKey = toDateKey(ticket.assignedDate);

        if (assignedDateKey !== todayKey) {
            return res.status(400).json({
                success: false,
                message: "Ticket can only be set to machine returned on its assigned date."
            });
        }

        // Check if arrived on site timestamp exists
        if (!ticket.statusTimeline?.arrivedOnSite) {
            return res.status(400).json({
                success: false,
                message: "Ticket must have arrived on site before machine can be returned."
            });
        }

        // Check if already returned
        if (ticket.statusTimeline?.machineReturned) {
            return res.status(400).json({
                success: false,
                message: "Machine is already marked as returned."
            });
        }

        // Update ticket
        const updatedTicket = await global.machineriesModels.TicketRequest.findByIdAndUpdate(
            ticketRequestId,
            {
                $set: {
                    'statusTimeline.machineReturned': new Date()
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Machine marked as returned successfully.",
            data: updatedTicket
        });

    } catch (error) {
        console.error("Error setting ticket to machine returned:", error);
        return res.status(500).json({
            success: false,
            message: "Error setting ticket to machine returned.",
            error: error.message
        });
    }
};


//==================================================================REQUEST FORM (TICKET REQUEST)=====================================================================

const getNextCounterSeq = async (counterId) => {
    const doc = await global.machineriesModels.TRCounter.findOneAndUpdate(
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

export const availableMachineryTypes = async (req, res) => { //also used when creating weekly schedules
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

//==================================================================DASHBOARD (REQUESTS OVERVIEW)=====================================================================

export const getTicketStatusCounts = async (req, res) => {
    try {
        // Count ticket requests
        const ticketPipeline = [
            {
                $facet: {
                    pending: [
                        { $match: { status: 'Pending' } },
                        { $count: 'count' }
                    ],
                    ongoing: [
                        { $match: { status: 'Ongoing' } },
                        { $count: 'count' }
                    ],
                    scheduled: [
                        { $match: { status: 'Scheduled' } },
                        { $count: 'count' }
                    ],
                    completed: [
                        { $match: { status: 'Completed' } },
                        { $count: 'count' }
                    ],
                    partiallyCompleted: [
                        { $match: { status: 'Partially Completed' } },
                        { $count: 'count' }
                    ],
                    declined: [
                        { $match: { status: 'Declined' } },
                        { $count: 'count' }
                    ],
                    total: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        // Count extension tickets
        const extensionPipeline = [
            {
                $facet: {
                    pending: [
                        { $match: { status: 'Pending' } },
                        { $count: 'count' }
                    ],
                    ongoing: [
                        { $match: { status: 'Ongoing' } },
                        { $count: 'count' }
                    ],
                    scheduled: [
                        { $match: { status: 'Scheduled' } },
                        { $count: 'count' }
                    ],
                    completed: [
                        { $match: { status: 'Completed' } },
                        { $count: 'count' }
                    ],
                    declined: [
                        { $match: { status: 'Declined' } },
                        { $count: 'count' }
                    ],
                    total: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const [ticketResult, extensionResult] = await Promise.all([
            global.machineriesModels.TicketRequest.aggregate(ticketPipeline),
            global.machineriesModels.ExtensionTicket.aggregate(extensionPipeline)
        ]);

        const ticketData = ticketResult[0];
        const extensionData = extensionResult[0];

        // Combine counts from both ticket requests and extension tickets
        const counts = {
            pending: (ticketData.pending[0]?.count || 0) + (extensionData.pending[0]?.count || 0),
            ongoing: (ticketData.ongoing[0]?.count || 0) + (extensionData.ongoing[0]?.count || 0),
            scheduled: (ticketData.scheduled[0]?.count || 0) + (extensionData.scheduled[0]?.count || 0),
            completed: (ticketData.completed[0]?.count || 0) + (extensionData.completed[0]?.count || 0),
            partiallyCompleted: ticketData.partiallyCompleted[0]?.count || 0, // Only ticket requests have this status
            declined: (ticketData.declined[0]?.count || 0) + (extensionData.declined[0]?.count || 0),
            total: (ticketData.total[0]?.count || 0) + (extensionData.total[0]?.count || 0)
        };

        return res.status(200).json({
            success: true,
            message: "Ticket status counts retrieved successfully.",
            data: counts
        });

    } catch (error) {
        console.error("Error fetching ticket status counts:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching ticket status counts.",
            error: error.message
        });
    }
};

export const getUpcomingAndOngoingSchedules = async (req, res) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        // Fetch 3 upcoming planned schedules (weekStart >= today)
        const upcomingSchedules = await global.machineriesModels.WeeklySchedule
            .find({
                status: 'Planned',
                weekStart: { $gte: now }
            })
            .sort({ weekStart: 1 }) // Earliest first
            .limit(3)
            .lean();

        // Fetch 3 ongoing schedules
        const ongoingSchedules = await global.machineriesModels.WeeklySchedule
            .find({ status: 'In Progress' })
            .sort({ weekStart: -1 }) // Most recent first
            .limit(3)
            .lean();

        // Extract ticket IDs from both upcoming and ongoing schedules
        const allSchedules = [...upcomingSchedules, ...ongoingSchedules];
        const ticketIds = [];
        const extensionIds = [];

        allSchedules.forEach(schedule => {
            schedule.ticketRequests?.forEach(tr => {
                if (tr.ticketRequestId) ticketIds.push(tr.ticketRequestId);
                if (tr.extensionRequestId) extensionIds.push(tr.extensionRequestId);
            });
        });

        // Fetch all related ticket requests and extensions
        const [ticketRequests, extensionTickets] = await Promise.all([
            global.machineriesModels.TicketRequest
                .find({ _id: { $in: ticketIds } })
                .lean(),
            extensionIds.length > 0
                ? global.machineriesModels.ExtensionTicket
                    .find({ _id: { $in: extensionIds } })
                    .lean()
                : []
        ]);

        // Helper function to enhance schedules with ticket details
        const enhanceSchedule = (schedule) => {
            const enhancedTickets = schedule.ticketRequests?.map(tr => {
                let ticketDetails = null;
                let extensionDetails = null;

                if (tr.ticketRequestId) {
                    ticketDetails = ticketRequests.find(
                        t => t._id?.toString() === tr.ticketRequestId.toString()
                    );
                }
                if (tr.extensionRequestId) {
                    extensionDetails = extensionTickets.find(
                        ext => ext._id?.toString() === tr.extensionRequestId.toString()
                    );
                }

                return {
                    ...tr,
                    ticketDetails: ticketDetails || null,
                    extensionDetails: extensionDetails || null
                };
            }) || [];

            // Sort tickets by assigned date (earliest first)
            enhancedTickets.sort((a, b) => {
                const dateA = new Date(a.assignedDate || 0);
                const dateB = new Date(b.assignedDate || 0);
                return dateA - dateB;
            });

            return {
                ...schedule,
                ticketRequests: enhancedTickets
            };
        };

        // Enhance both upcoming and ongoing schedules
        const enhancedUpcoming = upcomingSchedules.map(enhanceSchedule);
        const enhancedOngoing = ongoingSchedules.map(enhanceSchedule);

        return res.status(200).json({
            success: true,
            message: "Upcoming and ongoing schedules retrieved successfully.",
            data: {
                upcoming: enhancedUpcoming,
                ongoing: enhancedOngoing,
                upcomingCount: enhancedUpcoming.length,
                ongoingCount: enhancedOngoing.length
            }
        });

    } catch (error) {
        console.error("Error fetching upcoming and ongoing schedules:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching upcoming and ongoing schedules.",
            error: error.message
        });
    }
};


//==============================================================MACHINERY MANAGEMENT (MACHINERY INVENTORY)=============================================================

export const getMachineOverview = async (req, res) => {
    try {
        const pipeline = [
            {
                $facet: {
                    // Total number of machines
                    totalMachines: [
                        { $count: 'count' }
                    ],
                    // Count by condition
                    byCondition: [
                        {
                            $group: {
                                _id: '$condition',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    // Count by status
                    byStatus: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    // Count retired machines
                    retired: [
                        { $match: { isRetired: true } },
                        { $count: 'count' }
                    ],
                    // Count under repair
                    underRepair: [
                        { $match: { status: 'Under Repair' } },
                        { $count: 'count' }
                    ],
                    // Count functional
                    functional: [
                        { $match: { condition: 'Functional' } },
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await global.machineriesModels.MachineriesUnit.aggregate(pipeline);
        
        const data = result[0];
        
        // Format the response
        const overview = {
            totalMachines: data.totalMachines[0]?.count || 0,
            functional: data.functional[0]?.count || 0,
            underRepair: data.underRepair[0]?.count || 0,
            retired: data.retired[0]?.count || 0,
            byCondition: data.byCondition.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byStatus: data.byStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

        return res.status(200).json({
            success: true,
            message: "Machine overview retrieved successfully.",
            data: overview
        });

    } catch (error) {
        console.error("Error fetching machine overview:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching machine overview.",
            error: error.message
        });
    }
};

export const getMachineUnits = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        // First populate all units to enable searching on populated fields
        let allUnits = await global.machineriesModels.MachineriesUnit
            .find({})
            .populate({
                path: 'machineryTypeId',
                select: 'equipmentType ownerName ownerType'
            })
            .lean();

        // Filter units based on search query
        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            
            allUnits = allUnits.filter(unit => {
                return words.every(word => {
                    const regex = new RegExp(word, 'i');
                    return (
                        regex.test(unit.unitNumber || '') ||
                        regex.test(unit.engineBrand || '') ||
                        regex.test(unit.location || '') ||
                        regex.test(unit.status || '') ||
                        regex.test(unit.condition || '') ||
                        regex.test(unit.machineryTypeId?.equipmentType || '') ||
                        regex.test(unit.machineryTypeId?.ownerName || '')
                    );
                });
            });
        }

        // Get total count after filtering
        const totalCount = allUnits.length;

        // Sort by creation date (newest first)
        allUnits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply pagination
        const paginatedUnits = allUnits.slice(skip, skip + limit);

        // Group by machinery type for display
        const machineTypesMap = new Map();
        
        paginatedUnits.forEach(unit => {
            const typeId = unit.machineryTypeId?._id?.toString();
            if (!typeId) return;

            if (!machineTypesMap.has(typeId)) {
                machineTypesMap.set(typeId, {
                    _id: unit.machineryTypeId._id,
                    equipmentType: unit.machineryTypeId.equipmentType,
                    ownerName: unit.machineryTypeId.ownerName,
                    ownerType: unit.machineryTypeId.ownerType,
                    machineUnits: []
                });
            }

            // Sort status history by changedAt (most recent first)
            const sortedStatusHistory = (unit.statusHistory || []).sort((a, b) => 
                new Date(b.changedAt) - new Date(a.changedAt)
            );

            machineTypesMap.get(typeId).machineUnits.push({
                _id: unit._id,
                unitNumber: unit.unitNumber,
                engineBrand: unit.engineBrand,
                engineHorsepower: unit.engineHorsepower,
                modeOfAcquisition: unit.modeOfAcquisition,
                costOfAcquisition: unit.costOfAcquisition,
                yearAcquired: unit.yearAcquired,
                condition: unit.condition,
                location: unit.location,
                remarks: unit.remarks,
                status: unit.status,
                statusHistory: sortedStatusHistory, // Include sorted status history
                createdAt: unit.createdAt,
                updatedAt: unit.updatedAt
            });
        });

        const machineTypesWithUnits = Array.from(machineTypesMap.values());

        return res.status(200).json({
            success: true,
            message: "Machine units retrieved successfully.",
            data: {
                machineTypesWithUnits,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching machine units:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching machine units.",
            error: error.message
        });
    }
};

export const getMachineTypeUnitCounts = async (req, res) => {
    try {
        const machineTypeColl = global.machineriesModels.MachineriesType.collection.name;

        const pipeline = [
            {
                $group: {
                    _id: '$machineryTypeId',
                    unitCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: machineTypeColl,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'machineTypeDetails'
                }
            },
            {
                $unwind: {
                    path: '$machineTypeDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    unitCount: 1,
                    equipmentType: '$machineTypeDetails.equipmentType',
                }
            },
            {
                $sort: { unitCount: -1 }
            }
        ];

        const result = await global.machineriesModels.MachineriesUnit.aggregate(pipeline);

        return res.status(200).json({
            success: true,
            message: "Machine type unit counts retrieved successfully.",
            data: result
        });

    } catch (error) {
        console.error("Error fetching machine type unit counts:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching machine type unit counts.",
            error: error.message
        });
    }
};

export const getMachineTypesForAddingUnits = async (req, res) => { //ginagamit sa register/add machine units 
    try {
        const machineTypes = await global.machineriesModels.MachineriesType
            .find({})
            .select('equipmentType ownerName ownerType ratedCapacity')
            .lean();

        if (!machineTypes || machineTypes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No machine types found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Machine types retrieved successfully.",
            data: machineTypes
        });

    } catch (error) {
        console.error("Error fetching machine types:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching machine types.",
            error: error.message
        });
    }
};

export const createMachineriesType = async (req, res) => { //CREATE MACHINERIES TYPE
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
        unitNumber,  // Changed from plateNumber
        engineBrand, 
        engineHorsepower, 
        modeOfAcquisition, 
        costOfAcquisition,
        otherModeOfAcquisition,
        yearAcquired, 
        condition, 
        remarks, 
        status 
    } = req.body;

    // Updated validation - unitNumber instead of plateNumber
    if (!machineryTypeId || !unitNumber) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide machinery type ID and unit number." 
        });
    }

    try {
        const machineType = await global.machineriesModels.MachineriesType.findById(machineryTypeId);
        if (!machineType) {
            return res.status(404).json({ success: false, message: "Machinery type not found." });
        }

        // // Check for duplicate unit number
        // const existingUnit = await global.machineriesModels.MachineriesUnit.findOne({ unitNumber });
        // if (existingUnit) {
        //     return res.status(400).json({ 
        //         success: false, 
        //         message: "A machinery unit with this unit number already exists." 
        //     });
        // }

        const newMachineryUnit = await global.machineriesModels.MachineriesUnit.create({
            machineryTypeId,
            unitNumber,  // Changed from plateNumber
            engineBrand: engineBrand || '',
            engineHorsepower: engineHorsepower || '',
            modeOfAcquisition: modeOfAcquisition || '',
            otherModeOfAcquisition: otherModeOfAcquisition || '',
            costOfAcquisition: costOfAcquisition || '',
            yearAcquired: yearAcquired || '',
            condition: condition || 'Functional',  // Default value
            remarks: remarks || '',
            status: status || 'Available'  // Default value
        });

        return res.status(201).json({
            success: true, 
            message: "Machinery unit created successfully.",
            data: newMachineryUnit
        });
    } catch (error) {
        console.error("Error creating machinery unit:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error creating machinery unit.", 
            error: error.message 
        });
    }
};

export const updateMachineryUnitStatus = async (req, res) => { 
    const { 
        machineryUnitId, 
        employeeId, 
        newStatus, 
        newCondition, 
        reason
    } = req.body;

    // Validate required fields
    if (!machineryUnitId || !employeeId || !newStatus || !newCondition || !reason) {
        return res.status(400).json({
            success: false,
            message: "Please provide machinery unit ID, employee ID, new status, and new condition."
        });
    }

    // Validate reason is provided
    if (!reason || !reason.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please provide a reason for the status change."
        });
    }

    // Validate status and condition enums
    const validStatuses = ['Available', 'In Use', 'Under Repair', 'Retired', 'Not for Use'];
    const validConditions = ['Functional', 'Non-Functional'];

    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status. Must be one of: " + validStatuses.join(', ')
        });
    }

    if (!validConditions.includes(newCondition)) {
        return res.status(400).json({
            success: false,
            message: "Invalid condition. Must be one of: " + validConditions.join(', ')
        });
    }

    try {
        // Find the machinery unit
        const machineryUnit = await global.machineriesModels.MachineriesUnit.findById(machineryUnitId);
        
        if (!machineryUnit) {
            return res.status(404).json({
                success: false,
                message: "Machinery unit not found."
            });
        }

        // Find the employee
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee account not found."
            });
        }

        // Build status history entry
        const historyEntry = {
            status: newStatus,
            condition: newCondition,
            reason: reason.trim(),
            changedBy: {
                _id: employee._id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                middle_name: employee.middle_name,
                suffix: employee.suffix,
                email: employee.email,
                phone: employee.phone
            },
            changedAt: new Date()
        };

        // Handle retirement
        if (newStatus === 'Retired') {
            machineryUnit.isRetired = true;
            machineryUnit.retiredDate = new Date();
        } else {
            // If changing from Retired to another status, clear retirement flags
            if (machineryUnit.isRetired) {
                machineryUnit.isRetired = false;
                machineryUnit.retiredDate = undefined;
            }
        }

        // Update machinery unit status
        machineryUnit.status = newStatus;
        machineryUnit.condition = newCondition;
        machineryUnit.remarks = reason.trim();

        // Add to status history
        machineryUnit.statusHistory.push(historyEntry);

        await machineryUnit.save();

        return res.status(200).json({
            success: true,
            message: "Machinery unit status updated successfully.",
            data: machineryUnit
        });

    } catch (error) {
        console.error("Error updating machinery unit status:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating machinery unit status.",
            error: error.message
        });
    }
};

//============================================================TICKET REQUESTS (PENDING, SCHEDULED, ONGOING)============================================================

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

export const getPlannedWeeklySchedules = async (req, res) => { //planned or scheduled weekly schedules
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build match criteria for search
        let matchCriteria = { status: 'Planned' };

        // Use buildTicketSearchMatch for searching assigned operators and ticket details
        const ticketSearchMatch = buildTicketSearchMatch(searchQuery);

        // Find schedules with pagination
        let schedules = await global.machineriesModels.WeeklySchedule
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
        let ticketRequests = await global.machineriesModels.TicketRequest
            .find({ _id: { $in: ticketIds } })
            .populate('extensionTicketId')
            .lean();

        // If searchQuery is present, filter tickets using buildTicketSearchMatch
        if (ticketSearchMatch) {
            ticketRequests = await global.machineriesModels.TicketRequest
                .find({ _id: { $in: ticketIds }, ...ticketSearchMatch })
                .lean();
        }

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
            }).filter(tr => !ticketSearchMatch || tr.ticketDetails); // filter if searching

            enhancedTickets.sort((a, b) => {
                const dateA = new Date(a.assignedDate || 0);
                const dateB = new Date(b.assignedDate || 0);
                return dateA - dateB;
            });

            return {
                ...schedule,
                ticketRequests: enhancedTickets
            };
        }).filter(sch => sch.ticketRequests.length > 0 || !ticketSearchMatch); // filter schedules if searching

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

export const getInProgressWeeklySchedules = async (req, res) => { //in progress weekly schedules or ongoing schedules in the dashboard
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build match criteria for search
        let matchCriteria = { status: 'In Progress' };

        // Use buildTicketSearchMatch for searching assigned operators and ticket details
        const ticketSearchMatch = buildTicketSearchMatch(searchQuery);

        // Find schedules with pagination
        let schedules = await global.machineriesModels.WeeklySchedule
            .find(matchCriteria)
            .sort({ weekStart: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await global.machineriesModels.WeeklySchedule
            .countDocuments(matchCriteria);

        // Extract all ticket and extension IDs from the schedules
        const ticketIds = [];
        const extensionIds = [];
        schedules.forEach(schedule => {
            schedule.ticketRequests.forEach(tr => {
                if (tr.ticketRequestId) ticketIds.push(tr.ticketRequestId);
                if (tr.extensionRequestId) extensionIds.push(tr.extensionRequestId);
            });
        });

        // Fetch all ticket requests and extension tickets
        let ticketRequests = await global.machineriesModels.TicketRequest
            .find({ _id: { $in: ticketIds } })
            .populate('extensionTicketId')
            .lean();

        let extensionTickets = [];
        if (extensionIds.length > 0) {
            extensionTickets = await global.machineriesModels.ExtensionTicket
                .find({ _id: { $in: extensionIds } })
                .lean();
        }

        // If searchQuery is present, filter tickets using buildTicketSearchMatch
        if (ticketSearchMatch) {
            ticketRequests = await global.machineriesModels.TicketRequest
                .find({ _id: { $in: ticketIds }, ...ticketSearchMatch })
                .lean();
        }

        // Enhance schedules with ticket details
        const enhancedSchedules = schedules.map(schedule => {
            // Map ticket requests to include their details
            const enhancedTickets = schedule.ticketRequests.map(tr => {
                let ticketDetails = null;
                let extensionDetails = null;

                if (tr.ticketRequestId) {
                    ticketDetails = ticketRequests.find(
                        t => t._id && t._id.toString() === tr.ticketRequestId.toString()
                    );
                }
                if (tr.extensionRequestId) {
                    extensionDetails = extensionTickets.find(
                        ext => ext._id && ext._id.toString() === tr.extensionRequestId.toString()
                    );
                }

                return {
                    ...tr,
                    ticketDetails: ticketDetails || null,
                    extensionDetails: extensionDetails || null
                };
            }).filter(tr => {
                // If searching, only include tickets with details
                if (ticketSearchMatch) return tr.ticketDetails;
                return true;
            });

            // Sort tickets by assigned date (earliest first)
            enhancedTickets.sort((a, b) => {
                const dateA = new Date(a.assignedDate || 0);
                const dateB = new Date(b.assignedDate || 0);
                return dateA - dateB;
            });

            return {
                ...schedule,
                ticketRequests: enhancedTickets
            };
        }).filter(sch => sch.ticketRequests.length > 0 || !ticketSearchMatch); // filter schedules if searching

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

export const getOccupiedDatesForScheduling = async (req, res) => { //yung exisitng date rages sa manage pending tickt requests
    try {
        // Only consider active schedules to prevent overlapping future weeks
        const match = { status: { $in: ['Planned', 'In Progress'] } };
        const projection = { weekStart: 1, weekEnd: 1, _id: 0 };

        const schedules = await global.machineriesModels.WeeklySchedule
            .find(match, projection)
            .lean();

        // Helper to format as YYYY-MM-DD in local time (avoid TZ shifts)
        const toDateKey = (d) => {
            const dt = new Date(d);
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const occupiedWeeks = schedules
            .filter(s => s.weekStart && s.weekEnd)
            .map(s => ({
                weekStart: toDateKey(s.weekStart),
                weekEnd: toDateKey(s.weekEnd)
            }))
            .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

        return res.status(200).json({
            success: true,
            message: "Occupied weeks compiled successfully.",
            data: {
                occupiedWeeks,
                count: occupiedWeeks.length
            }
        });
    } catch (error) {
        console.error("Error compiling occupied weeks:", error);
        return res.status(500).json({
            success: false,
            message: "Error compiling occupied weeks.",
            error: error.message
        });
    }
};

export const getMachineryUnitsForDropDown = async (req, res) => {
    try {
        const { machineryTypeId } = req.query;

        const projection = {
            _id: 1,
            unitNumber: 1,
        };

        const filter = { status: "Available", condition: "Functional" };
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

export const getOperatorsList = async (req, res) => {
    try {
        const { requestedMachineTypeId } = req.query;

        const projection = {
            first_name: 1,
            last_name: 1,
            middle_name: 1,
            suffix: 1,
            email: 1,
            phone: 1,
            operatorLicenses: 1,
            isOperatorDisabled: 1
        };

        // Find all operators with MIS role
        let operators = await global.globalModels.EmployeeAccount.find({ roles: 'MIS' }, projection).lean();

        // If requestedMachineTypeId is provided, filter operators by their licenses
        if (requestedMachineTypeId) {
            // Validate that the machine type exists
            const machineType = await global.machineriesModels.MachineriesType.findById(requestedMachineTypeId).lean();
            if (!machineType) {
                return res.status(404).json({
                    success: false,
                    message: "Requested machine type not found."
                });
            }

            // Filter operators who:
            // 1. Are not disabled
            // 2. Have at least one active license that includes the requested machine type
            operators = operators.filter(operator => {
                // Skip disabled operators
                if (operator.isOperatorDisabled === true) {
                    return false;
                }

                // Check if operator has any active license with the requested machine type
                if (!operator.operatorLicenses || !Array.isArray(operator.operatorLicenses)) {
                    return false;
                }

                return operator.operatorLicenses.some(license => {
                    // License must be active
                    if (license.isActive !== true) {
                        return false;
                    }

                    // Check if license includes the requested machine type
                    if (!license.allowedMachineryTypes || !Array.isArray(license.allowedMachineryTypes)) {
                        return false;
                    }

                    return license.allowedMachineryTypes.some(typeId => 
                        typeId.toString() === requestedMachineTypeId.toString()
                    );
                });
            });
        } else {
            // If no machine type specified, still filter out disabled operators
            operators = operators.filter(operator => operator.isOperatorDisabled !== true);
        }

        // Remove sensitive fields from response
        const filteredOperators = operators.map(operator => ({
            _id: operator._id,
            first_name: operator.first_name,
            last_name: operator.last_name,
            middle_name: operator.middle_name,
            suffix: operator.suffix,
            email: operator.email,
            phone: operator.phone
        }));

        return res.status(200).json({
            success: true,
            message: "Operators list retrieved successfully.",
            data: filteredOperators
        });

    } catch (error) {
        console.error("Error fetching operators list:", error);
        return res.status(500).json({ success: false, message: "Error fetching operators list.", error: error.message });
    }
};

const getNextScheduleCounterSeq = async (counterId) => {
    const doc = await global.machineriesModels.SCounter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return doc.seq;
};

//CREATE WEEKLY SCHEDULE
// 1.) Validate ticket → exists, not deleted
// 2.) Validate date selected → not past, inside schedule range
// 3) Check machine availability
// 4.) Check operator availability
// 5.) Check per-day schedule capacity
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

        // prepare intra-payload maps to catch duplicates inside the same schedule
        const operatorDateMap = new Set();
        const machineDateMap = new Set();

        for (const ticket of tickets) {
            const assignedDate = new Date(ticket.assignedDate);
            const dateKey = toDateKey(assignedDate);
            const dayStart = new Date(dateKey);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            // check duplicate operator/machine assignments inside the incoming tickets array
            if (ticket.assignedOperatorId) {
                const opKey = `${ticket.assignedOperatorId.toString()}|${dateKey}`;
                if (operatorDateMap.has(opKey)) {
                    return res.status(400).json({
                        success: false,
                        message: `Operator ${ticket.assignedOperatorId} is assigned to more than one ticket on ${dateKey} within this schedule.`
                    });
                }
                operatorDateMap.add(opKey);
            }
            if (ticket.assignedMachineUnitId) {
                const mKey = `${ticket.assignedMachineUnitId.toString()}|${dateKey}`;
                if (machineDateMap.has(mKey)) {
                    return res.status(400).json({
                        success: false,
                        message: `Machine unit ${ticket.assignedMachineUnitId} is assigned to more than one ticket on ${dateKey} within this schedule.`
                    });
                }
                machineDateMap.add(mKey);
            }

            // Check operator in TicketRequest (Scheduled/Ongoing)
            if (ticket.assignedOperatorId) {
                const operatorConflict = await global.machineriesModels.TicketRequest.findOne({
                    'assignedOperator.assignedOperatorId': ticket.assignedOperatorId,
                    assignedDate: { $gte: dayStart, $lt: dayEnd },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                }).lean();

                if (operatorConflict) {
                    return res.status(400).json({
                        success: false,
                        message: `Operator is already assigned to another ticket on ${dateKey}.`
                    });
                }

                // Check operator in ExtensionTicket as well
                const operatorExtConflict = await global.machineriesModels.ExtensionTicket.findOne({
                    'assignedOperator.assignedOperatorId': ticket.assignedOperatorId,
                    assignedDate: { $gte: dayStart, $lt: dayEnd },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                }).lean();

                if (operatorExtConflict) {
                    return res.status(400).json({
                        success: false,
                        message: `Operator is already assigned to another extension ticket on ${dateKey}.`
                    });
                }
            }

            // Check machine in TicketRequest (Scheduled/Ongoing)
            if (ticket.assignedMachineUnitId) {
                const machineConflict = await global.machineriesModels.TicketRequest.findOne({
                    'assignedMachineUnit.assignedMachineUnitId': ticket.assignedMachineUnitId,
                    assignedDate: { $gte: dayStart, $lt: dayEnd },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                }).lean();

                if (machineConflict) {
                    return res.status(400).json({
                        success: false,
                        message: `Machine unit is already assigned to another ticket on ${dateKey}.`
                    });
                }

                // Check machine in ExtensionTicket as well
                const machineExtConflict = await global.machineriesModels.ExtensionTicket.findOne({
                    'assignedMachineUnit.assignedMachineUnitId': ticket.assignedMachineUnitId,
                    assignedDate: { $gte: dayStart, $lt: dayEnd },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                }).lean();

                if (machineExtConflict) {
                    return res.status(400).json({
                        success: false,
                        message: `Machine unit is already assigned to another extension ticket on ${dateKey}.`
                    });
                }
            }
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
                unitNumber: machineUnitCheck.unitNumber,
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

export const updateWeeklySchedule = async (req, res) => { //pang update ng assigned dates, operators, machines sa existing weekly schedulemachi
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


        // Build map of schedule id -> assigned date for both ticketRequestId and extensionRequestId
        const currentScheduleDates = new Map();
        (schedule.ticketRequests || []).forEach(tr => {
            const dateKey = toDateKey(tr.assignedDate);
            if (tr.ticketRequestId) {
                currentScheduleDates.set(tr.ticketRequestId.toString(), dateKey);
            }
            if (tr.extensionRequestId) {
                currentScheduleDates.set(tr.extensionRequestId.toString(), dateKey);
            }
        });

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
                unitNumber: machine.unitNumber,
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
                .filter(tr => 
                    !ticketIds.includes(tr.ticketRequestId?.toString()) &&
                    !ticketIds.includes(tr.extensionRequestId?.toString())
                )
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

                // NEW: Check if operator is already assigned on this date in ANY schedule
                const operatorConflict = await global.machineriesModels.TicketRequest.findOne({
                    _id: { $ne: ticket.ticketId }, // exclude current ticket if moving within same schedule
                    'assignedOperator.assignedOperatorId': ticket.assignedOperatorId,
                    assignedDate: {
                        $gte: new Date(dateKey),
                        $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1))
                    },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                });

                if (operatorConflict) {
                    return res.status(400).json({
                        success: false,
                        message: `Operator is already assigned to another ticket on ${dateKey}.`
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

                // NEW: Check if machine is already assigned on this date in ANY schedule
                const machineConflict = await global.machineriesModels.TicketRequest.findOne({
                    _id: { $ne: ticket.ticketId }, // exclude current ticket if moving within same schedule
                    'assignedMachineUnit.assignedMachineUnitId': ticket.assignedMachineUnitId,
                    assignedDate: {
                        $gte: new Date(dateKey),
                        $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1))
                    },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                });

                if (machineConflict) {
                    return res.status(400).json({
                        success: false,
                        message: `Machine unit is already assigned to another ticket on ${dateKey}.`
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
                unitNumber: machine.unitNumber,
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
                tr => tr.ticketRequestId?.toString() === ticket.ticketId ||
                    tr.extensionRequestId?.toString() === ticket.ticketId
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

//=============================================================================CALENDAR==============================================================================






//===============================================================RETURNS (ONGOING SCHEDULES - OPERATOR)==============================================================

export const getPendingExtensionRequestsCount = async (req, res) => {
    try {
        // Find all tickets with pending extension requests
        const count = await global.machineriesModels.ExtensionTicket.countDocuments({ status: 'Pending' });

        return res.status(200).json({
            success: true,
            message: "Pending extension requests count retrieved successfully.",
            data: {
                count
            }
        });
    } catch (error) {
        console.error("Error fetching pending extension requests count:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching pending extension requests count.",
            error: error.message
        });
    }
};

export const getPendingIncidentReportsCount = async (req, res) => {
    try {
        // Find all incident reports with pending status
        const count = await global.machineriesModels.IncidentReport.countDocuments({ status: 'Pending' });

        return res.status(200).json({
            success: true,
            message: "Pending incident reports count retrieved successfully.",
            data: {
                count
            }
        });
    } catch (error) {
        console.error("Error fetching pending incident reports count:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching pending incident reports count.",
            error: error.message
        });
    }
};

// Helper function to create incident report (not exported, used internally)
const createIncidentReportHelper = async ({
    machineryUnitId,
    machineryTypeId,
    ticketRequestId,
    incidentType,
    description,
    assignedOperatorId,
    session = null
}) => {
    // Validate required fields
    if (!machineryUnitId || !machineryTypeId || !incidentType || !description || !assignedOperatorId) {
        throw new Error("Please provide machineryUnitId, machineryTypeId, incidentType, description, and assignedOperatorId.");
    }

    // Validate incidentType enum
    const validIncidentTypes = ['Mechanical Failure', 'Electrical Failure', 'Hydraulic/Pneumatic Failure', 'Flat Tire or Track Issue', 'Machine Overheating', 'Fuel System Issue'];
    if (!validIncidentTypes.includes(incidentType)) {
        throw new Error("Invalid incident type. Must be one of: " + validIncidentTypes.join(', '));
    }

    // Automatically set status and condition for machinery unit
    const newStatus = 'Under Repair';
    const newCondition = 'Non-Functional';

    // Validate machinery unit exists
    const machineryUnitQuery = global.machineriesModels.MachineriesUnit.findById(machineryUnitId);
    if (session) machineryUnitQuery.session(session);
    const machineryUnit = await machineryUnitQuery;
    if (!machineryUnit) {
        throw new Error("Machinery unit not found.");
    }

    // Validate machinery type exists
    const machineryTypeQuery = global.machineriesModels.MachineriesType.findById(machineryTypeId);
    if (session) machineryTypeQuery.session(session);
    const machineryType = await machineryTypeQuery;
    if (!machineryType) {
        throw new Error("Machinery type not found.");
    }

    // Validate assigned operator exists
    const assignedOperator = await global.globalModels.EmployeeAccount.findById(assignedOperatorId).lean();
    if (!assignedOperator) {
        throw new Error("Assigned operator not found.");
    }

    // Validate ticket request if provided
    if (ticketRequestId) {
        const ticketRequestQuery = global.machineriesModels.TicketRequest.findById(ticketRequestId);
        if (session) ticketRequestQuery.session(session);
        const ticketRequest = await ticketRequestQuery;
        if (!ticketRequest) {
            throw new Error("Ticket request not found.");
        }
    }

    // Create incident report
    const incidentReportData = {
        machineryUnitId,
        machineryTypeId,
        ticketRequestId: ticketRequestId || undefined,
        incidentType,
        description: description.trim(),
        assignedOperator: {
            operatorId: assignedOperator._id,
            first_name: assignedOperator.first_name,
            last_name: assignedOperator.last_name,
            middle_name: assignedOperator.middle_name,
            suffix: assignedOperator.suffix,
            email: assignedOperator.email,
            phone: assignedOperator.phone
        },
        status: 'Pending'
    };

    const incidentReport = session 
        ? await global.machineriesModels.IncidentReport.create([incidentReportData], { session })
        : await global.machineriesModels.IncidentReport.create(incidentReportData);

    // Find the employee who created the report (we'll use the assigned operator as the employee)
    const employee = assignedOperator; // Using assigned operator as the employee who made the change

    // Build status history entry
    const historyEntry = {
        status: newStatus,
        condition: newCondition,
        reason: 'Incident Report Filed: ' + description.trim(), // Use description as reason as requested
        changedBy: {
            _id: employee._id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            middle_name: employee.middle_name,
            suffix: employee.suffix,
            email: employee.email,
            phone: employee.phone
        },
        changedAt: new Date()
    };

    // Update machinery unit status
    machineryUnit.status = 'Under Repair';
    machineryUnit.condition = 'Non-Functional';

    // Add to status history
    machineryUnit.statusHistory.push(historyEntry);

    await machineryUnit.save({ session });

    return session ? incidentReport[0] : incidentReport;
};

import { uploadFileToDrive } from '../googleDrive.controller.js';

export const setRequestTicketToComplete = async (req, res) => { //kapag work done na
    const { ticketRequestId, extensionRequest, areaServiced, remainingArea, remarks, operatorId, incidentReport, incidentType, incidentDescription } = req.body; 

    if (!ticketRequestId) {
        return res.status(400).json({
            success: false,
            message: "Please provide the ticket request ID."
        });
    }

    if (!operatorId) {
        return res.status(400).json({
            success: false,
            message: "Please provide the operator ID."
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

    // Validate incident report fields if incident report is requested
    if (incidentReport === 'true') {
        if (!incidentType || !incidentDescription || !incidentDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide incident type and description for incident report."
            });
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the ticket request
        const ticket = await global.machineriesModels.TicketRequest.findById(ticketRequestId).session(session);
        
        if (!ticket) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Ticket request not found."
            });
        }

        // Validate ticket status
        if (ticket.status !== 'Ongoing') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Only ongoing tickets can be marked as completed."
            });
        }

        // Validate schedule exists
        if (!ticket.scheduleId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Ticket is not assigned to any schedule."
            });
        }

        // const toDateKey = (d) => new Date(d).toISOString().split('T')[0];
        // const todayKey = toDateKey(new Date());
        // const assignedDateKey = toDateKey(ticket.assignedDate);

        // if (assignedDateKey !== todayKey) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Ticket can only be marked as completed on its assigned date."
        //     });
        // }

        const operator = await global.globalModels.EmployeeAccount.findById(operatorId).lean();
        if (!operator) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Operator account not found. If issue persists, please contact IT."
            });
        }

        if (!operator.roles || !operator.roles.includes('MIS') && !operator.roles.includes('MIM')) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "The provided user is not an authorized operator."
            });
        }

        if (operator.isOperatorDisabled === true) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Your operator priviledges is currently disabled, cannot set the request ticket to complete."
            })
        }

        if (operator.isOperatorDisabled) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ 
                success: false, 
                message: "Your operator account has been disabled. Please speak with your manager for more information." 
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
            status: extensionRequest === 'true' ? 'Partially Completed' : 'Completed',
            completionProof: {
                proofImageId: proofImageResult.id,
                proofImageUrl: `https://drive.google.com/uc?id=${proofImageResult.id}`,
                signatureId: signatureResult.id,
                signatureUrl: `https://drive.google.com/uc?id=${signatureResult.id}`,
                completedAt: new Date()
            },
            completedBy: {
                operatorId: operator._id,
                first_name: operator.first_name,
                last_name: operator.last_name,
                middle_name: operator.middle_name,
                suffix: operator.suffix,
                email: operator.email,
                phone: operator.phone,
            },
            disabledForEditing: true
        };

        // Handle extension request
        if (extensionRequest === 'true') {
            const extensionRefNumber = ticket.refNumber.replace(/^TR-/, 'EXT-');
            
            // Create new ExtensionTicket document
            const extensionTicket = await global.machineriesModels.ExtensionTicket.create([{
                refNumber: extensionRefNumber,
                parentTicketId: ticket._id,
                areaServiced: parseFloat(areaServiced),
                remainingArea: parseFloat(remainingArea),
                extensionReason: remarks && remarks.trim() ? remarks.trim() : undefined,
                status: 'Pending'
            }], { session });

            // Mark that extension is needed
            updateData.extensionNeeded = true;
            updateData.extensionTicketId = extensionTicket[0]._id;
        } else {
            // If no extension, add remarks to the main document
            if (remarks && remarks.trim()) {
                updateData.remarks = remarks.trim();
            }
        }

        // Update ticket with completion details
        const updatedTicket = await global.machineriesModels.TicketRequest.findByIdAndUpdate(
            ticketRequestId,
            updateData,
            { new: true, session }
        );

        // Check if all tickets in the schedule are completed
        const schedule = await global.machineriesModels.WeeklySchedule.findById(ticket.scheduleId).session(session);
        const allTicketIds = schedule.ticketRequests.map(tr => tr.ticketRequestId);
        
        const allTickets = await global.machineriesModels.TicketRequest.find({
            _id: { $in: allTicketIds }
        }).session(session);

        const allCompleted = allTickets.every(t => t.status === 'Completed');

        // If all tickets are completed, update schedule status
        if (allCompleted) {
            await global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                ticket.scheduleId,
                { status: 'Completed' },
                { session }
            );
        }

        // Create incident report if requested (must succeed or transaction will rollback)
        let incidentReportCreated = false;
        if (incidentReport === 'true') {
            await createIncidentReportHelper({
                machineryUnitId: ticket.assignedMachineUnit.assignedMachineUnitId,
                machineryTypeId: ticket.requestedMachineType.requestedMachineTypeId,
                ticketRequestId: ticket._id,
                incidentType: incidentType,
                description: incidentDescription,
                assignedOperatorId: operatorId,
                session: session
            });
            incidentReportCreated = true;
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: extensionRequest === 'true' 
                ? "Ticket marked as completed with extension request successfully." 
                : "Ticket marked as completed successfully.",
            data: {
                ticket: updatedTicket,
                scheduleCompleted: allCompleted,
                extensionRequested: extensionRequest === 'true',
                incidentReportCreated: incidentReportCreated
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error marking ticket as completed:", error);
        return res.status(500).json({
            success: false,
            message: "Error marking ticket as completed.",
            error: error.message
        });
    }
};

export const approveExtensionRequest = async (req, res) => {
    const { extensionTicketId, employeeId, assignedOperatorId, assignedMachineUnitId, requestTicketId } = req.body;

    if (!extensionTicketId || !employeeId) {
        return res.status(400).json({
            success: false,
            message: "Please provide extension ticket ID and employee ID."
        });
    }

    if (!assignedOperatorId || !assignedMachineUnitId) {
        return res.status(400).json({
            success: false,
            message: "Please provide assignedOperatorId and assignedMachineUnitId."
        });
    }

    try {
        // 1. Validate approver
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee account not found." });
        }
        if (!employee.roles || !employee.roles.includes('MIM')) {
            return res.status(400).json({ success: false, message: "The provided user is not an authorized manager." });
        }

        // Validate operator and machine unit
        const operatorDoc = await global.globalModels.EmployeeAccount.findById(assignedOperatorId).lean();
        if (!operatorDoc || !Array.isArray(operatorDoc.roles) || !operatorDoc.roles.includes('MIS')) {
            return res.status(404).json({ success: false, message: "Operator not found or does not have a valid role." });
        }
        const machineDoc = await global.machineriesModels.MachineriesUnit.findById(assignedMachineUnitId).lean();
        if (!machineDoc) {
            return res.status(404).json({ success: false, message: "Machine unit not found." });
        }

        // 2. Load extension ticket
        const extensionTicket = await global.machineriesModels.ExtensionTicket.findById(extensionTicketId);
        if (!extensionTicket) {
            return res.status(404).json({ success: false, message: "Extension ticket not found." });
        }
        if (extensionTicket.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending extension requests can be approved."
            });
        }

        // 3. Load parent ticket
        const parentTicket = await global.machineriesModels.TicketRequest.findById(requestTicketId);
        if (!parentTicket) {
            return res.status(404).json({ success: false, message: "Parent ticket request not found." });
        }

        if (!parentTicket.scheduleId || !parentTicket.assignedDate) {
            return res.status(400).json({
                success: false,
                message: "Parent ticket must be assigned to a schedule with an assigned date before approving extension."
            });
        }

        // 4. Load schedule (as a doc, not lean, so we can extend weekEnd)
        const schedule = await global.machineriesModels.WeeklySchedule.findById(parentTicket.scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Original schedule not found." });
        }

        const addDays = (d, n) => {
            const r = new Date(d);
            r.setHours(0,0,0,0);
            r.setDate(r.getDate() + n);
            return r;
        };
        const toDateKey = (d) => new Date(d).toISOString().split('T')[0];

        const originalAssignedDate = new Date(parentTicket.assignedDate);
        originalAssignedDate.setHours(0,0,0,0);
        const extensionDate = addDays(originalAssignedDate, 1);
        const dateKey = toDateKey(extensionDate);

        // NEW: Auto-extend weekEnd by 1 day (to the extension date) if needed
        const currentWeekEnd = new Date(schedule.weekEnd);
        currentWeekEnd.setHours(0,0,0,0);
        if (extensionDate > currentWeekEnd) {
            schedule.weekEnd = extensionDate;
            await schedule.save();
        }

        // Check operator/machine availability on extension date
        const operatorConflict = await global.machineriesModels.TicketRequest.findOne({
            'assignedOperator.assignedOperatorId': assignedOperatorId,
            assignedDate: {
                $gte: new Date(dateKey),
                $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1))
            },
            status: { $in: ['Scheduled', 'Ongoing'] }
        });
        if (operatorConflict) {
            return res.status(400).json({
                success: false,
                message: `Operator is already assigned to another ticket on ${dateKey}.`
            });
        }

        const operatorExtConflict = await global.machineriesModels.ExtensionTicket.findOne({
            _id: { $ne: extensionTicketId },
            'assignedOperator.assignedOperatorId': assignedOperatorId,
            assignedDate: {
                $gte: new Date(dateKey),
                $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1))
            },
            status: { $in: ['Scheduled', 'Ongoing'] }
        });
        if (operatorExtConflict) {
            return res.status(400).json({
                success: false,
                message: `Operator is already assigned to another extension ticket on ${dateKey}.`
            });
        }

        const machineConflict = await global.machineriesModels.TicketRequest.findOne({
            'assignedMachineUnit.assignedMachineUnitId': assignedMachineUnitId,
            assignedDate: {
                $gte: new Date(dateKey),
                $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1))
            },
            status: { $in: ['Scheduled', 'Ongoing'] }
        });
        if (machineConflict) {
            return res.status(400).json({
                success: false,
                message: `Machine unit is already assigned to another ticket on ${dateKey}.`
            });
        }

        const machineExtConflict = await global.machineriesModels.ExtensionTicket.findOne({
            _id: { $ne: extensionTicketId },
            'assignedMachineUnit.assignedMachineUnitId': assignedMachineUnitId,
            assignedDate: {
                $gte: new Date(dateKey),
                $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1))
            },
            status: { $in: ['Scheduled', 'Ongoing'] }
        });
        if (machineExtConflict) {
            return res.status(400).json({
                success: false,
                message: `Machine unit is already assigned to another extension ticket on ${dateKey}.`
            });
        }

        // 5. Load all tickets in schedule and sort by assignedDate
        const scheduleTicketIds = (schedule.ticketRequests || []).map(tr => tr.ticketRequestId);
        let scheduleTickets = await global.machineriesModels.TicketRequest.find({
            _id: { $in: scheduleTicketIds }
        }).lean();

        scheduleTickets = scheduleTickets
            .filter(t => t.assignedDate)
            .sort((a, b) => new Date(a.assignedDate) - new Date(b.assignedDate));

        // 6. If there are already 5 or more tickets, free the last one
        if (scheduleTickets.length >= 5) {
            const lastTicket = scheduleTickets[scheduleTickets.length - 1];

            await global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
                schedule._id,
                { $pull: { ticketRequests: { ticketRequestId: lastTicket._id } } }
            );

            await global.machineriesModels.TicketRequest.findByIdAndUpdate(
                lastTicket._id,
                {
                    $unset: {
                        scheduleId: "",
                        assignedDate: "",
                        assignedMachineUnit: "",
                        assignedOperator: ""
                    },
                    status: "Pending"
                }
            );

            scheduleTickets = scheduleTickets.filter(t => t._id.toString() !== lastTicket._id.toString());
        }

        // 7. Shift all future tickets one day forward
        const shiftUpdates = [];
        for (const t of scheduleTickets) {
            const tDate = new Date(t.assignedDate);
            tDate.setHours(0,0,0,0);
            if (tDate >= extensionDate) {
                const newDate = addDays(tDate, 1);

                shiftUpdates.push(
                    global.machineriesModels.TicketRequest.findByIdAndUpdate(
                        t._id,
                        { assignedDate: newDate },
                        { new: true }
                    )
                );

                shiftUpdates.push(
                    global.machineriesModels.WeeklySchedule.updateOne(
                        {
                            _id: schedule._id,
                            "ticketRequests.ticketRequestId": t._id
                        },
                        {
                            $set: {
                                "ticketRequests.$.assignedDate": newDate
                            }
                        }
                    )
                );
            }
        }

        await Promise.all(shiftUpdates);

        // Build nested assignment details
        const assignedMachineUnit = {
            assignedMachineUnitId: machineDoc._id,
            unitNumber: machineDoc.unitNumber,
            engineBrand: machineDoc.engineBrand,
            engineHorsepower: machineDoc.engineHorsepower
        };
        const assignedOperator = {
            assignedOperatorId: operatorDoc._id,
            first_name: operatorDoc.first_name,
            last_name: operatorDoc.last_name,
            middle_name: operatorDoc.middle_name,
            suffix: operatorDoc.suffix,
            email: operatorDoc.email,
            phone: operatorDoc.phone
        };

        // 8. Update extension ticket
        extensionTicket.status = "Scheduled";
        extensionTicket.approvedBy = {
            employeeId: employee._id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            middle_name: employee.middle_name,
            suffix: employee.suffix,
            email: employee.email,
            phone: employee.phone,
            approvedAt: new Date()
        };
        extensionTicket.scheduleId = schedule._id;
        extensionTicket.assignedDate = extensionDate;
        extensionTicket.assignedMachineUnit = assignedMachineUnit;
        extensionTicket.assignedOperator = assignedOperator;

        await extensionTicket.save();

        // 9. Add extension to schedule's ticketRequests
        await global.machineriesModels.WeeklySchedule.findByIdAndUpdate(
            schedule._id,
            {
                $push: {
                    ticketRequests: {
                        extensionRequestId: extensionTicket._id,
                        assignedDate: extensionDate,
                        parentTicketId: parentTicket._id
                    }
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Extension request approved and scheduled successfully.",
            data: {
                extensionTicket,
                assignedDate: extensionDate,
                scheduleId: schedule._id
            }
        });
    } catch (error) {
        console.error("Error approving extension request:", error);
        return res.status(500).json({
            success: false,
            message: "Error approving extension request.",
            error: error.message
        });
    }
};

export const declineExtensionRequest = async (req, res) => {
    const { ticketRequestId, extensionTicketId, employeeId, reason } = req.body;

    if (!ticketRequestId || !extensionTicketId || !employeeId) {
        return res.status(400).json({
            success: false,
            message: "Please provide ticket request ID, extension ticket ID, and employee ID."
        });
    }

    if (!reason || !reason.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please provide a reason for declining the extension request."
        });
    }

    try {
        // Validate employee
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee account not found." 
            });
        }
        if (!employee.roles || !employee.roles.includes('MIM')) {
            return res.status(400).json({ 
                success: false, 
                message: "The provided user is not an authorized manager." 
            });
        }

        // Load extension ticket document directly
        const extensionTicket = await global.machineriesModels.ExtensionTicket.findById(extensionTicketId);
        if (!extensionTicket) {
            return res.status(404).json({ 
                success: false, 
                message: "Extension ticket not found." 
            });
        }

        // Validate extension ticket status
        if (extensionTicket.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending extension requests can be declined."
            });
        }

        // Update extension ticket status to Declined
        extensionTicket.status = 'Declined';
        extensionTicket.declinedBy = {
            employeeId: employee._id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            middle_name: employee.middle_name,
            suffix: employee.suffix,
            email: employee.email,
            phone: employee.phone,
            declinedAt: new Date()
        };
        extensionTicket.declineReason = reason.trim();

        await extensionTicket.save();

        return res.status(200).json({
            success: true,
            message: "Extension request declined successfully.",
            data: {
                extensionTicket
            }
        });
    } catch (error) {
        console.error("Error declining extension request:", error);
        return res.status(500).json({
            success: false,
            message: "Error declining extension request.",
            error: error.message
        });
    }
};

export const setExtenstionTicketToComplete = async (req, res) => {
    const { extensionTicketId, operatorId, remarks, incidentReport, incidentType, incidentDescription } = req.body;

    if (!extensionTicketId) {
        return res.status(400).json({ success: false, message: "Please provide the extension ticket ID." });
    }
    if (!operatorId) {
        return res.status(400).json({ success: false, message: "Please provide the operator ID." });
    }
    if (!req.files || !req.files.proofImage || !req.files.signature) {
        return res.status(400).json({
            success: false,
            message: "Please provide both proof image and signature."
        });
    }

    // Validate incident report fields if incident report is requested
    if (incidentReport === 'true') {
        if (!incidentType || !incidentDescription || !incidentDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide incident type and description for incident report."
            });
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Load extension ticket
        const extTicket = await global.machineriesModels.ExtensionTicket.findById(extensionTicketId).session(session);
        if (!extTicket) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Extension ticket not found." });
        }

        // Only allow completion for ongoing extension tickets
        if (extTicket.status !== 'Ongoing') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Only ongoing extension tickets can be marked as completed."
            });
        }


        // Validate operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId).lean();
        if (!operator) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Operator account not found." });
        }
        if (!operator.roles || (!operator.roles.includes('MIS') && !operator.roles.includes('MIM'))) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "The provided user is not an authorized operator." });
        }

        if (operator.isOperatorDisabled) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ 
                success: false, 
                message: "Your operator account has been disabled. Please speak with your manager for more information." 
            });
        }

        const proofImageFile = req.files.proofImage[0];
        const signatureFile = req.files.signature[0];

        // Upload proof image to Google Drive
        const proofImageName = `proof_ext_${extTicket.refNumber}`;
        const proofImageResult = await uploadFileToDrive(
            proofImageFile.buffer,
            proofImageName,
            proofImageFile.mimetype,
            process.env.GOOGLE_DRIVE_FOLDER_ID_SELFIE_PROOFS_MACHINERIES
        );

        // Upload signature to Google Drive
        const signatureName = `signature_ext_${extTicket.refNumber}`;
        const signatureResult = await uploadFileToDrive(
            signatureFile.buffer,
            signatureName,
            signatureFile.mimetype,
            process.env.GOOGLE_DRIVE_FOLDER_ID_FARMER_SIGNATURES_MACHINERIES
        );

        // Update extension ticket completion proof and status
        extTicket.completionProof = {
            proofImageId: proofImageResult.id,
            proofImageUrl: `https://drive.google.com/uc?id=${proofImageResult.id}`,
            signatureId: signatureResult.id,
            signatureUrl: `https://drive.google.com/uc?id=${signatureResult.id}`,
            completedAt: new Date()
        };
        if (remarks && remarks.trim()) extTicket.remarks = remarks.trim();
        extTicket.status = 'Completed';

        await extTicket.save({ session });

        // Update parent ticket: mark Completed if currently Partially Completed
        const parentTicketId = extTicket.parentRequestTicketId;
        const parentTicket = await global.machineriesModels.TicketRequest.findById(parentTicketId).session(session);
        if (!parentTicket) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Parent ticket not found. Aborting operation.",
                data: { extensionTicket: extTicket }
            });
        }

        if (parentTicket.status !== 'Partially Completed') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Parent ticket must be in 'Partially Completed' status to be marked as completed."
            });
        }

        parentTicket.status = 'Completed';
        parentTicket.disabledForEditing = true;
        if (!parentTicket.extensionTicketId) parentTicket.extensionTicketId = extTicket._id;

        await parentTicket.save({ session });

        // Create incident report if requested (must succeed or transaction will rollback)
        let incidentReportCreated = false;
        if (incidentReport === 'true') {
            // Get parent ticket details for incident report
            const parentTicketDetails = await global.machineriesModels.TicketRequest.findById(parentTicketId).session(session).lean();
            await createIncidentReportHelper({
                machineryUnitId: parentTicketDetails.assignedMachineUnit,
                machineryTypeId: parentTicketDetails.requestedMachineType,
                ticketRequestId: parentTicketId,
                incidentType: incidentType,
                description: incidentDescription,
                assignedOperatorId: operatorId,
                session: session
            });
            incidentReportCreated = true;
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Extension ticket and parent ticket marked as completed successfully.",
            data: {
                extensionTicket: extTicket,
                parentTicket,
                incidentReportCreated: incidentReportCreated
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error marking extension ticket as completed:", error);
        return res.status(500).json({
            success: false,
            message: "Error marking extension ticket as completed.",
            error: error.message
        });
    }
};



export const declineIncidentReport = async (req, res) => {//FOR TESTING
    const { incidentReportId, employeeId, reason } = req.body;

    if (!incidentReportId || !employeeId) {
        return res.status(400).json({
            success: false,
            message: "Please provide incident report ID and employee ID."
        });
    }

    if (!reason || !reason.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please provide a reason for declining the incident report."
        });
    }

    try {
        // Validate employee
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee account not found." 
            });
        }
        if (!employee.roles || !employee.roles.includes('MIM')) {
            return res.status(400).json({ 
                success: false, 
                message: "The provided user is not an authorized manager." 
            });
        }

        // Find incident report
        const incidentReport = await global.machineriesModels.IncidentReport.findById(incidentReportId);
        if (!incidentReport) {
            return res.status(404).json({ 
                success: false, 
                message: "Incident report not found." 
            });
        }

        // Validate incident report status
        if (incidentReport.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending incident reports can be declined."
            });
        }

        // Update incident report status to Declined
        incidentReport.status = 'Declined';
        await incidentReport.save();

        // Revert machine unit back to Available and Functional
        const machineryUnit = await global.machineriesModels.MachineriesUnit.findById(incidentReport.machineryUnitId);
        if (machineryUnit) {
            // Build status history entry
            const historyEntry = {
                status: 'Available',
                condition: 'Functional',
                reason: 'Incident Report Declined: ' + reason.trim(),
                changedBy: {
                    _id: employee._id,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    middle_name: employee.middle_name,
                    suffix: employee.suffix,
                    email: employee.email,
                    phone: employee.phone
                },
                changedAt: new Date()
            };

            // Update machinery unit status
            machineryUnit.status = 'Available';
            machineryUnit.condition = 'Functional';
            machineryUnit.remarks = 'Incident Report Declined: ' + reason.trim();

            // Add to status history
            machineryUnit.statusHistory.push(historyEntry);

            await machineryUnit.save();
        }

        // Populate the incident report for response
        const populatedIncidentReport = await global.machineriesModels.IncidentReport.findById(incidentReport._id)
            .populate('machineryUnitId', 'unitNumber')
            .populate('machineryTypeId', 'equipmentType')
            .populate('ticketRequestId', 'refNumber');

        return res.status(200).json({
            success: true,
            message: "Incident report declined successfully.",
            data: populatedIncidentReport
        });

    } catch (error) {
        console.error("Error declining incident report:", error);
        return res.status(500).json({
            success: false,
            message: "Error declining incident report.",
            error: error.message
        });
    }
};

export const resolveIncidentReport = async (req, res) => {//FOR TESTING
    const { incidentReportId, employeeId, newStatus, newCondition, reason } = req.body;

    if (!incidentReportId || !employeeId) {
        return res.status(400).json({
            success: false,
            message: "Please provide incident report ID and employee ID."
        });
    }

    if (!newStatus || !newCondition) {
        return res.status(400).json({
            success: false,
            message: "Please provide new status and new condition for the machine unit."
        });
    }

    if (!reason || !reason.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please provide a reason/notes for resolving the incident report."
        });
    }

    // Validate status and condition enums
    const validStatuses = ['Available', 'In Use', 'Under Repair', 'Retired', 'Not for Use'];
    const validConditions = ['Functional', 'Non-Functional'];

    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status. Must be one of: " + validStatuses.join(', ')
        });
    }

    if (!validConditions.includes(newCondition)) {
        return res.status(400).json({
            success: false,
            message: "Invalid condition. Must be one of: " + validConditions.join(', ')
        });
    }

    try {
        // Validate employee
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee account not found." 
            });
        }
        if (!employee.roles || !employee.roles.includes('MIM')) {
            return res.status(400).json({ 
                success: false, 
                message: "The provided user is not an authorized manager." 
            });
        }

        // Find incident report
        const incidentReport = await global.machineriesModels.IncidentReport.findById(incidentReportId);
        if (!incidentReport) {
            return res.status(404).json({ 
                success: false, 
                message: "Incident report not found." 
            });
        }

        // Validate incident report status
        if (incidentReport.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending incident reports can be resolved."
            });
        }

        // Update incident report status to Resolved
        incidentReport.status = 'Resolved';
        await incidentReport.save();

        // Update machine unit status and condition as specified by user
        const machineryUnit = await global.machineriesModels.MachineriesUnit.findById(incidentReport.machineryUnitId);
        if (!machineryUnit) {
            return res.status(404).json({
                success: false,
                message: "Machinery unit not found."
            });
        }

        // Build status history entry
        const historyEntry = {
            status: newStatus,
            condition: newCondition,
            reason: 'Incident Report Resolved: ' + reason.trim(),
            changedBy: {
                _id: employee._id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                middle_name: employee.middle_name,
                suffix: employee.suffix,
                email: employee.email,
                phone: employee.phone
            },
            changedAt: new Date()
        };

        // Handle retirement
        if (newStatus === 'Retired') {
            machineryUnit.isRetired = true;
            machineryUnit.retiredDate = new Date();
        } else {
            // If changing from Retired to another status, clear retirement flags
            if (machineryUnit.isRetired) {
                machineryUnit.isRetired = false;
                machineryUnit.retiredDate = undefined;
            }
        }

        // Update machinery unit status
        machineryUnit.status = newStatus;
        machineryUnit.condition = newCondition;
        machineryUnit.remarks = reason.trim();

        // Add to status history
        machineryUnit.statusHistory.push(historyEntry);

        await machineryUnit.save();

        // Populate the incident report for response
        const populatedIncidentReport = await global.machineriesModels.IncidentReport.findById(incidentReport._id)
            .populate('machineryUnitId', 'unitNumber')
            .populate('machineryTypeId', 'equipmentType')
            .populate('ticketRequestId', 'refNumber');

        return res.status(200).json({
            success: true,
            message: "Incident report resolved successfully.",
            data: populatedIncidentReport
        });

    } catch (error) {
        console.error("Error resolving incident report:", error);
        return res.status(500).json({
            success: false,
            message: "Error resolving incident report.",
            error: error.message
        });
    }
};

//============================================================================OPERATORS=============================================================================

export const getAllOperators = async (req, res) => {
    const { searchQuery } = req.query;
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build match criteria for operators
        const matchCriteria = {
            roles: 'MIS' // Only get employees with MIS (Machinery Implementation Staff) role
        };

        const pipeline = [
            { $match: matchCriteria }
        ];

        // Add search functionality
        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { first_name: { $regex: word, $options: 'i' } },
                    { last_name: { $regex: word, $options: 'i' } },
                    { middle_name: { $regex: word, $options: 'i' } },
                    { email: { $regex: word, $options: 'i' } },
                    { phone: { $regex: word, $options: 'i' } }
                ]
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        // Project all fields except sensitive ones (password, 2FA secrets, reset tokens)
        // Note: Cannot mix inclusion and exclusion in $project, so we only include what we need
        pipeline.push({
            $project: {
                // Personal information
                first_name: 1,
                last_name: 1,
                middle_name: 1,
                suffix: 1,
                email: 1,
                phone: 1,
                
                // Role and status
                roles: 1,
                office_position: 1,
                isOperatorDisabled: 1,
                isInLeave: 1,
                isLocked: 1,
                
                // Operator licenses (will be populated later)
                operatorLicenses: 1,
                
                // Login and account information
                lastLogin: 1,
                is2FAEnabled: 1,
                
                
                // Timestamps
                createdAt: 1,
                _id: 1
                // Note: Sensitive fields (password, twoFASecret, twoFAQRCode, resetPasswordToken, resetPasswordExpiresAt) 
                // are excluded by default since we're only including specific fields
            }
        });

        // Add pagination
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

        const result = await global.globalModels.EmployeeAccount.aggregate(pipeline);
        const operators = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        // Collect all unique machinery type IDs from all operator licenses
        const allMachineryTypeIds = new Set();
        operators.forEach(operator => {
            if (operator.operatorLicenses && Array.isArray(operator.operatorLicenses)) {
                operator.operatorLicenses.forEach(license => {
                    if (license.allowedMachineryTypes && Array.isArray(license.allowedMachineryTypes)) {
                        license.allowedMachineryTypes.forEach(typeId => {
                            allMachineryTypeIds.add(typeId.toString());
                        });
                    }
                });
            }
        });

        // Fetch all machinery types from machineries DB
        const machineryTypesMap = new Map();
        if (allMachineryTypeIds.size > 0) {
            const machineryTypes = await global.machineriesModels.MachineriesType.find({
                _id: { $in: Array.from(allMachineryTypeIds).map(id => new mongoose.Types.ObjectId(id)) }
            }).select('equipmentType ownerName ownerType ratedCapacity').lean();

            machineryTypes.forEach(type => {
                machineryTypesMap.set(type._id.toString(), type);
            });
        }

        // Manually populate operatorLicenses.allowedMachineryTypes for each operator
        const operatorsWithPopulatedLicenses = operators.map(operator => {
            const operatorObj = operator.toObject ? operator.toObject() : { ...operator };
            
            // Exclude sensitive fields
            delete operatorObj.password;
            delete operatorObj.twoFASecret;
            delete operatorObj.twoFAQRCode;
            delete operatorObj.resetPasswordToken;
            delete operatorObj.resetPasswordExpiresAt;
            delete operatorObj.failedOTPVerifications;
            delete operatorObj.failedLoginAttempts;
            delete operatorObj.is2FAEnabled;
            delete operatorObj.office_position;
            delete operatorObj.isLocked;
            

            // Populate licenses with machinery types
            if (operatorObj.operatorLicenses && Array.isArray(operatorObj.operatorLicenses)) {
                operatorObj.operatorLicenses = operatorObj.operatorLicenses.map(license => {
                    const licenseObj = license.toObject ? license.toObject() : { ...license };
                    
                    if (licenseObj.allowedMachineryTypes && Array.isArray(licenseObj.allowedMachineryTypes)) {
                        licenseObj.allowedMachineryTypes = licenseObj.allowedMachineryTypes.map(typeId => {
                            const typeIdStr = typeId.toString();
                            return machineryTypesMap.get(typeIdStr) || typeId;
                        });
                    }
                    
                    return licenseObj;
                });
            }

            return operatorObj;
        });

        return res.status(200).json({
            success: true,
            message: "Operators retrieved successfully.",
            data: {
                operators: operatorsWithPopulatedLicenses,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Error fetching operators:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching operators.",
            error: error.message
        });
    }
};

export const disableOperator = async (req, res) => {
    const { operatorId, employeeId } = req.body;

    if (!operatorId || !employeeId) {
        return res.status(400).json({
            success: false,
            message: "Please provide operator ID and employee ID."
        });
    }

    try {
        // Validate the employee performing the action
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee account not found."
            });
        }

        // Only managers can disable operators
        if (!employee.roles || !employee.roles.includes('MIM')) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to disable operators."
            });
        }

        // Find the operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId);
        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator account not found."
            });
        }

        // Verify the account is an operator
        if (!operator.roles || !operator.roles.includes('MIS')) {
            return res.status(400).json({
                success: false,
                message: "The specified account is not an operator."
            });
        }

        // Check if already disabled
        if (operator.isOperatorDisabled) {
            return res.status(400).json({
                success: false,
                message: "Operator is already disabled."
            });
        }

        // Disable the operator
        operator.isOperatorDisabled = true;
        await operator.save();

        return res.status(200).json({
            success: true,
            message: "Operator disabled successfully."
        });

    } catch (error) {
        console.error("Error disabling operator:", error);
        return res.status(500).json({
            success: false,
            message: "Error disabling operator.",
            error: error.message
        });
    }
};

export const enableOperator = async (req, res) => {
    const { operatorId, employeeId } = req.body;

    if (!operatorId || !employeeId) {
        return res.status(400).json({
            success: false,
            message: "Please provide operator ID and employee ID."
        });
    }

    try {
        // Validate the employee performing the action
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId).lean();
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee account not found."
            });
        }

        // Only managers can enable operators
        if (!employee.roles || !employee.roles.includes('MIM')) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to enable operators."
            });
        }

        // Find the operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId);
        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator account not found."
            });
        }

        // Verify the account is an operator
        if (!operator.roles || !operator.roles.includes('MIS')) {
            return res.status(400).json({
                success: false,
                message: "The specified account is not an operator."
            });
        }

        // Check if already enabled
        if (!operator.isOperatorDisabled) {
            return res.status(400).json({
                success: false,
                message: "Operator is already enabled."
            });
        }

        // Enable the operator
        operator.isOperatorDisabled = false;
        await operator.save();

        return res.status(200).json({
            success: true,
            message: "Operator enabled successfully.",
        });

    } catch (error) {
        console.error("Error enabling operator:", error);
        return res.status(500).json({
            success: false,
            message: "Error enabling operator.",
            error: error.message
        });
    }
};

export const removeOperatorLicense = async (req, res) => {
    const { operatorId, licenseId } = req.body;

    // Validate required fields
    if (!operatorId || !licenseId) {
        return res.status(400).json({
            success: false,
            message: "Please provide operatorId and licenseId."
        });
    }

    try {
        // Validate operator exists and is an operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId);
        if (!operator) {
            return res.status(404).json({ 
                success: false, 
                message: "Operator not found." 
            });
        }

        // Verify the account is an operator
        if (!operator.roles || !operator.roles.includes('MIS')) {
            return res.status(400).json({ 
                success: false, 
                message: "The specified account is not an operator." 
            });
        }

        // Find the license
        const license = operator.operatorLicenses.id(licenseId);
        if (!license) {
            return res.status(404).json({ 
                success: false, 
                message: "License not found." 
            });
        }

        // Store license details before removal for response
        const removedLicense = {
            licenseNumber: license.licenseNumber,
            licenseType: license.licenseType,
            issuedDate: license.issuedDate,
            expiryDate: license.expiryDate
        };

        // Remove the license
        operator.operatorLicenses.pull(licenseId);
        await operator.save();

        // Fetch the updated operator
        const updatedOperator = await global.globalModels.EmployeeAccount.findById(operatorId);
        
        // Manually populate allowedMachineryTypes for all remaining licenses
        if (updatedOperator.operatorLicenses && updatedOperator.operatorLicenses.length > 0) {
            // Collect all machinery type IDs from all licenses
            const allMachineryTypeIds = [];
            updatedOperator.operatorLicenses.forEach(license => {
                if (license.allowedMachineryTypes && Array.isArray(license.allowedMachineryTypes)) {
                    license.allowedMachineryTypes.forEach(typeId => {
                        const typeIdStr = typeId.toString();
                        if (!allMachineryTypeIds.includes(typeIdStr)) {
                            allMachineryTypeIds.push(typeIdStr);
                        }
                    });
                }
            });

            // Fetch all machinery types from machineries DB
            const machineryTypesMap = new Map();
            if (allMachineryTypeIds.length > 0) {
                const machineryTypes = await global.machineriesModels.MachineriesType.find({
                    _id: { $in: allMachineryTypeIds }
                }).select('equipmentType ownerName ownerType').lean();

                machineryTypes.forEach(type => {
                    machineryTypesMap.set(type._id.toString(), type);
                });
            }

            // Manually populate each license's allowedMachineryTypes
            updatedOperator.operatorLicenses.forEach(license => {
                if (license.allowedMachineryTypes && Array.isArray(license.allowedMachineryTypes)) {
                    license.allowedMachineryTypes = license.allowedMachineryTypes.map(typeId => {
                        const typeIdStr = typeId.toString();
                        return machineryTypesMap.get(typeIdStr) || typeId;
                    });
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Operator license removed successfully.",
            data: {
                operator: updatedOperator,
                removedLicense: removedLicense
            }
        });

    } catch (error) {
        console.error("Error removing operator license:", error);
        return res.status(500).json({
            success: false,
            message: "Error removing operator license.",
            error: error.message
        });
    }
};

export const addOperatorLicense = async (req, res) => {
    const { operatorId, licenseNumber, licenseType, issuedDate, expiryDate, allowedMachineryTypes, issuedBy, notes } = req.body;

    // Validate required fields
    if (!operatorId || !licenseNumber || !licenseType || !issuedDate || !expiryDate || !issuedBy) {
        return res.status(400).json({
            success: false,
            message: "Please provide operatorId, licenseNumber, licenseType, issuedDate, and expiryDate."
        });
    }

    if (!allowedMachineryTypes || !Array.isArray(allowedMachineryTypes) || allowedMachineryTypes.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one allowedMachineryType."
        });
    }

    try {
        // Validate operator exists and is an operator
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId);
        if (!operator) {
            return res.status(404).json({ 
                success: false, 
                message: "Operator not found." 
            });
        }

        if (!operator.roles || !operator.roles.includes('MIS')) {
            return res.status(400).json({ 
                success: false, 
                message: "The specified account is not an operator." 
            });
        }

        // Validate date format and logic
        const issued = new Date(issuedDate);
        const expiry = new Date(expiryDate);
        
        if (isNaN(issued.getTime()) || isNaN(expiry.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format for issuedDate or expiryDate."
            });
        }

        if (issued >= expiry) {
            return res.status(400).json({
                success: false,
                message: "Issued date must be before expiry date."
            });
        }

        // Check for duplicate license number for this operator
        if (operator.operatorLicenses && operator.operatorLicenses.length > 0) {
            const duplicateLicense = operator.operatorLicenses.find(
                license => license.licenseNumber === licenseNumber
            );
            if (duplicateLicense) {
                return res.status(400).json({
                    success: false,
                    message: "A license with this license number already exists for this operator."
                });
            }
        }

        // Validate all machinery types exist
        const machineryTypes = await global.machineriesModels.MachineriesType.find({
            _id: { $in: allowedMachineryTypes }
        });

        if (machineryTypes.length !== allowedMachineryTypes.length) {
            return res.status(400).json({ 
                success: false, 
                message: "One or more machinery types not found." 
            });
        }

        // Create new license
        const newLicense = {
            licenseNumber,
            licenseType,
            issuedDate: issued,
            expiryDate: expiry,
            allowedMachineryTypes,
            isActive: true,
            issuedBy: issuedBy || undefined,
            notes: notes || undefined
        };

        // Initialize operatorLicenses array if it doesn't exist
        if (!operator.operatorLicenses) {
            operator.operatorLicenses = [];
        }

        operator.operatorLicenses.push(newLicense);
        await operator.save();

        
        const savedOperator = await global.globalModels.EmployeeAccount.findById(operatorId);
        
        // Get the newly added license (last one in array)
        const newLicenseDoc = savedOperator.operatorLicenses[savedOperator.operatorLicenses.length - 1];
        
        // Manually populate allowedMachineryTypes
        if (newLicenseDoc.allowedMachineryTypes && newLicenseDoc.allowedMachineryTypes.length > 0) {
            const populatedTypes = await global.machineriesModels.MachineriesType.find({
                _id: { $in: newLicenseDoc.allowedMachineryTypes }
            }).select('equipmentType ownerName ownerType');
            
            // Convert to plain objects for response
            newLicenseDoc.allowedMachineryTypes = populatedTypes;
        }

        return res.status(201).json({
            success: true,
            message: "Operator license added successfully.",
            data: {
                operator: savedOperator,
                newLicense: newLicenseDoc
            }
        });


    } catch (error) {
        console.error("Error adding operator license:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding operator license.",
            error: error.message
        });
    }
};

export const updateOperatorLicense = async (req, res) => {
    const { 
        operatorId, 
        licenseId, 
        licenseNumber, 
        licenseType, 
        issuedDate, 
        expiryDate, 
        allowedMachineryTypes, 
        issuedBy, 
        notes, 
        isActive 
    } = req.body;

    if (!operatorId || !licenseId) {
        return res.status(400).json({
            success: false,
            message: "Please provide operatorId and licenseId."
        });
    }

    try {
        // Validate operator exists
        const operator = await global.globalModels.EmployeeAccount.findById(operatorId);
        if (!operator) {
            return res.status(404).json({ 
                success: false, 
                message: "Operator not found." 
            });
        }

        // Find the license
        const license = operator.operatorLicenses.id(licenseId);
        if (!license) {
            return res.status(404).json({ 
                success: false, 
                message: "License not found." 
            });
        }

        // Validate date logic if dates are being updated
        if (issuedDate !== undefined || expiryDate !== undefined) {
            const issued = issuedDate !== undefined ? new Date(issuedDate) : license.issuedDate;
            const expiry = expiryDate !== undefined ? new Date(expiryDate) : license.expiryDate;
            
            if (isNaN(issued.getTime()) || isNaN(expiry.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format for issuedDate or expiryDate."
                });
            }

            if (issued >= expiry) {
                return res.status(400).json({
                    success: false,
                    message: "Issued date must be before expiry date."
                });
            }
        }

        // Check for duplicate license number if licenseNumber is being updated
        if (licenseNumber !== undefined && licenseNumber !== license.licenseNumber) {
            if (operator.operatorLicenses && operator.operatorLicenses.length > 0) {
                const duplicateLicense = operator.operatorLicenses.find(
                    lic => lic._id.toString() !== licenseId && lic.licenseNumber === licenseNumber
                );
                if (duplicateLicense) {
                    return res.status(400).json({
                        success: false,
                        message: "A license with this license number already exists for this operator."
                    });
                }
            }
        }

        // Update fields if provided
        if (licenseNumber !== undefined) license.licenseNumber = licenseNumber;
        if (licenseType !== undefined) license.licenseType = licenseType;
        if (issuedDate !== undefined) license.issuedDate = new Date(issuedDate);
        if (expiryDate !== undefined) license.expiryDate = new Date(expiryDate);
        if (issuedBy !== undefined) license.issuedBy = issuedBy || undefined;
        if (notes !== undefined) license.notes = notes || undefined;
        if (isActive !== undefined) license.isActive = isActive;

        // Update allowed machinery types if provided
        if (allowedMachineryTypes !== undefined) {
            if (!Array.isArray(allowedMachineryTypes) || allowedMachineryTypes.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "allowedMachineryTypes must be a non-empty array."
                });
            }

            // Validate all machinery types exist
            const machineryTypes = await global.machineriesModels.MachineriesType.find({
                _id: { $in: allowedMachineryTypes }
            });

            if (machineryTypes.length !== allowedMachineryTypes.length) {
                return res.status(400).json({ 
                    success: false, 
                    message: "One or more machinery types not found." 
                });
            }

            license.allowedMachineryTypes = allowedMachineryTypes;
        }

        await operator.save();

        // Fetch the updated operator
        const updatedOperator = await global.globalModels.EmployeeAccount.findById(operatorId);
        
        // Get the updated license
        const updatedLicense = updatedOperator.operatorLicenses.id(licenseId);
        
        // Manually populate allowedMachineryTypes
        if (updatedLicense.allowedMachineryTypes && updatedLicense.allowedMachineryTypes.length > 0) {
            const populatedTypes = await global.machineriesModels.MachineriesType.find({
                _id: { $in: updatedLicense.allowedMachineryTypes }
            }).select('equipmentType ownerName ownerType');
            
            // Convert to plain objects for response
            updatedLicense.allowedMachineryTypes = populatedTypes;
        }

        return res.status(200).json({
            success: true,
            message: "Operator license updated successfully.",
            data: {
                operator: updatedOperator,
                updatedLicense: updatedLicense
            }
        });

    } catch (error) {
        console.error("Error updating operator license:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating operator license.",
            error: error.message
        });
    }
};

export const setEmployeeLeaveStatus = async (req, res) => {
    const { employeeId, isInLeave } = req.body;

    // Validate required fields
    if (!employeeId || isInLeave === undefined) {
        return res.status(400).json({
            success: false,
            message: "Please provide employeeId and isInLeave status."
        });
    }

    // Validate isInLeave is a boolean
    if (typeof isInLeave !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: "isInLeave must be a boolean value (true or false)."
        });
    }

    try {
        // Find the employee
        const employee = await global.globalModels.EmployeeAccount.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee account not found."
            });
        }

        // Check if leave status is already set to the requested value
        if (employee.isInLeave === isInLeave) {
            return res.status(400).json({
                success: false,
                message: `Employee is already ${isInLeave ? 'on leave' : 'not on leave'}.`
            });
        }

        // Update the leave status
        employee.isInLeave = isInLeave;
        await employee.save();

        return res.status(200).json({
            success: true,
            message: `Employee leave status ${isInLeave ? 'set to on leave' : 'set to not on leave'} successfully.`,
            data: {
                employee: {
                    _id: employee._id,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    middle_name: employee.middle_name,
                    suffix: employee.suffix,
                    email: employee.email,
                    isInLeave: employee.isInLeave
                }
            }
        });

    } catch (error) {
        console.error("Error setting employee leave status:", error);
        return res.status(500).json({
            success: false,
            message: "Error setting employee leave status.",
            error: error.message
        });
    }
};

export const getOperatorAssignedNumbers = async (req, res) => {
    try {
        // Aggregate ticket requests by assigned operator (only Scheduled/Ongoing)
        const ticketRequestPipeline = [
            {
                $match: {
                    'assignedOperator.assignedOperatorId': { $exists: true, $ne: null },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                }
            },
            {
                $group: {
                    _id: '$assignedOperator.assignedOperatorId',
                    activeAssignments: { $sum: 1 },
                    operatorDetails: {
                        $first: {
                            first_name: '$assignedOperator.first_name',
                            last_name: '$assignedOperator.last_name',
                            middle_name: '$assignedOperator.middle_name',
                            suffix: '$assignedOperator.suffix',
                            email: '$assignedOperator.email',
                            phone: '$assignedOperator.phone'
                        }
                    }
                }
            }
        ];

        // Aggregate extension tickets by assigned operator (only Scheduled/Ongoing)
        const extensionTicketPipeline = [
            {
                $match: {
                    'assignedOperator.assignedOperatorId': { $exists: true, $ne: null },
                    status: { $in: ['Scheduled', 'Ongoing'] }
                }
            },
            {
                $group: {
                    _id: '$assignedOperator.assignedOperatorId',
                    activeAssignments: { $sum: 1 },
                    operatorDetails: {
                        $first: {
                            first_name: '$assignedOperator.first_name',
                            last_name: '$assignedOperator.last_name',
                            middle_name: '$assignedOperator.middle_name',
                            suffix: '$assignedOperator.suffix',
                            email: '$assignedOperator.email',
                            phone: '$assignedOperator.phone'
                        }
                    }
                }
            }
        ];

        // Execute both aggregations in parallel
        const [ticketRequestResults, extensionTicketResults] = await Promise.all([
            global.machineriesModels.TicketRequest.aggregate(ticketRequestPipeline),
            global.machineriesModels.ExtensionTicket.aggregate(extensionTicketPipeline)
        ]);

        // Combine results by operator ID
        const operatorCountsMap = new Map();

        // Process ticket request results
        ticketRequestResults.forEach(result => {
            const operatorId = result._id.toString();
            if (!operatorCountsMap.has(operatorId)) {
                operatorCountsMap.set(operatorId, {
                    operatorId: result._id,
                    activeAssignments: 0,
                    operatorDetails: result.operatorDetails
                });
            }
            const existing = operatorCountsMap.get(operatorId);
            existing.activeAssignments += result.activeAssignments;
        });

        // Process extension ticket results
        extensionTicketResults.forEach(result => {
            const operatorId = result._id.toString();
            if (!operatorCountsMap.has(operatorId)) {
                operatorCountsMap.set(operatorId, {
                    operatorId: result._id,
                    activeAssignments: 0,
                    operatorDetails: result.operatorDetails
                });
            }
            const existing = operatorCountsMap.get(operatorId);
            existing.activeAssignments += result.activeAssignments;
        });

        // Convert map to array and enrich with operator account data
        const operatorCountsArray = Array.from(operatorCountsMap.values());

        // Fetch full operator details from EmployeeAccount for operators with assignments
        const operatorIds = operatorCountsArray.map(op => op.operatorId);
        const operators = await global.globalModels.EmployeeAccount.find({
            _id: { $in: operatorIds },
            roles: 'MIS'
        }).select('first_name last_name middle_name suffix email phone isOperatorDisabled').lean();

        // Create a map of operator details for quick lookup
        const operatorDetailsMap = new Map();
        operators.forEach(op => {
            operatorDetailsMap.set(op._id.toString(), op);
        });

        // Enrich the results with full operator details and handle missing operators
        const enrichedResults = operatorCountsArray.map(opCount => {
            const operatorIdStr = opCount.operatorId.toString();
            const fullOperatorDetails = operatorDetailsMap.get(operatorIdStr);

            return {
                operatorId: opCount.operatorId,
                activeAssignments: opCount.activeAssignments,
                operatorDetails: fullOperatorDetails || opCount.operatorDetails || null,
                isOperatorDisabled: fullOperatorDetails?.isOperatorDisabled || false
            };
        });

        // Sort by active assignments (highest first) to show overworked operators first
        enrichedResults.sort((a, b) => {
            return b.activeAssignments - a.activeAssignments;
        });

        return res.status(200).json({
            success: true,
            message: "Operator assignment counts retrieved successfully.",
            data: {
                operators: enrichedResults,
                totalOperators: enrichedResults.length,
                totalActiveAssignments: enrichedResults.reduce((sum, op) => sum + op.activeAssignments, 0)
            }
        });

    } catch (error) {
        console.error("Error fetching operator assigned numbers:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching operator assigned numbers.",
            error: error.message
        });
    }
};
