//only ran once when the backend server starts, fallback sya for cron job kung sakaling mamatay yung backend service
export const updateScheduleStatus = async () => {
    try {
        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const tickets = await global.machineriesModels.TicketRequest.find({ status: 'Scheduled', scheduleId: { $ne: null } }).populate('scheduleId', '_id weekStart weekEnd status');
        const extTickets = await global.machineriesModels.ExtensionTicket.find({ status: 'Scheduled', scheduleId: { $ne: null } }).populate('scheduleId', '_id weekStart weekEnd status');

        const updatedSchedules = new Set();

        for (const tr of tickets) {
            const schedule = tr.scheduleId;
            if (!schedule || !schedule.weekStart) continue;

            if (now >= new Date(schedule.weekStart) && now <= new Date(schedule.weekEnd)) {
                const scheduleIdStr = String(schedule._id);
                if (schedule.status !== 'In Progress' && !updatedSchedules.has(scheduleIdStr)) {
                    schedule.status = 'In Progress';
                    await schedule.save();
                    updatedSchedules.add(scheduleIdStr);
                }

                // Update ticket to Ongoing only if it's within the week
                if (tr.status !== 'Ongoing' && !tr.updatedToOngoing) {
                    tr.status = 'Ongoing';
                    tr.updatedToOngoing = true;
                    
                    // Only disable editing if assignedDate is today or in the past
                    if (tr.assignedDate && new Date(tr.assignedDate) <= endOfToday) {
                        tr.disabledForEditing = true;
                    }
                    
                    await tr.save();
                }
            }
        }

        for (const tr of extTickets) {
            const schedule = tr.scheduleId;
            if (!schedule || !schedule.weekStart) continue;

            if (now >= new Date(schedule.weekStart) && now <= new Date(schedule.weekEnd)) {
                const scheduleIdStr = String(schedule._id);
                if (schedule.status !== 'In Progress' && !updatedSchedules.has(scheduleIdStr)) {
                    schedule.status = 'In Progress';
                    await schedule.save();
                    updatedSchedules.add(scheduleIdStr);
                }

                // Update ticket to Ongoing only if it's within the week
                if (tr.status !== 'Ongoing' && !tr.updatedToOngoing) {
                    tr.status = 'Ongoing';
                    tr.updatedToOngoing = true;
                    
                    // Only disable editing if assignedDate is today or in the past
                    if (tr.assignedDate && new Date(tr.assignedDate) <= endOfToday) {
                        tr.disabledForEditing = true;
                    }
                    
                    await tr.save();
                }
            }
        }

        console.log('Schedule status update completed.');
    } catch (error) {
        console.error('Error updating schedule status:', error);
        return;
    }
};

// Disable editing for tickets with assigned date today or in the past
export const disableEditingForTodayTickets = async () => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Find all ongoing tickets with assignedDate >= startOfDay AND <= endOfDay (only today)
        const tickets = await global.machineriesModels.TicketRequest.find({
            status: 'Ongoing',
            assignedDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            $or: [
                { disabledForEditing: { $exists: false } },
                { disabledForEditing: false }
            ]
        });

        if (tickets.length === 0) {
            console.log('No ongoing tickets found with today\'s assigned date');
            return;
        }

        // Update all matching tickets
        const updatePromises = tickets.map(ticket => {
            ticket.disabledForEditing = true;
            return ticket.save();
        });

        await Promise.all(updatePromises);
        console.log(`Successfully disabled editing for ${tickets.length} ticket(s) with today's assigned date`);

    } catch (error) {
        console.error('Error disabling editing for today\'s tickets:', error);
        return;
    }
};

// Update machine unit status to 'In Use' for ongoing tickets with assigned date today or in the past
export const updateMachineUnitStatusToInUse = async () => {
    try {
        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Find all ongoing ticket requests with assignedDate today or in the past
        const tickets = await global.machineriesModels.TicketRequest.find({
            status: 'Ongoing',
            assignedDate: { $lte: endOfToday },
            'assignedMachineUnit.assignedMachineUnitId': { $exists: true, $ne: null }
        }).select('assignedMachineUnit');

        // Find all ongoing extension tickets with assignedDate today or in the past
        const extTickets = await global.machineriesModels.ExtensionTicket.find({
            status: 'Ongoing',
            assignedDate: { $lte: endOfToday },
            'assignedMachineUnit.assignedMachineUnitId': { $exists: true, $ne: null }
        }).select('assignedMachineUnit');

        const updatedMachineUnits = new Set();
        let updateCount = 0;

        // Process ticket requests
        for (const ticket of tickets) {
            const machineUnitId = ticket.assignedMachineUnit?.assignedMachineUnitId;
            if (!machineUnitId) continue;

            const machineUnitIdStr = String(machineUnitId);
            if (updatedMachineUnits.has(machineUnitIdStr)) continue;

            try {
                const machineUnit = await global.machineriesModels.MachineriesUnit.findById(machineUnitId);
                if (machineUnit && machineUnit.status !== 'In Use') {
                    machineUnit.status = 'In Use';
                    await machineUnit.save();
                    updatedMachineUnits.add(machineUnitIdStr);
                    updateCount++;
                }
            } catch (error) {
                console.error(`Error updating machine unit ${machineUnitId}:`, error);
                // Continue with other machine units even if one fails
            }
        }

        // Process extension tickets
        for (const ticket of extTickets) {
            const machineUnitId = ticket.assignedMachineUnit?.assignedMachineUnitId;
            if (!machineUnitId) continue;

            const machineUnitIdStr = String(machineUnitId);
            if (updatedMachineUnits.has(machineUnitIdStr)) continue;

            try {
                const machineUnit = await global.machineriesModels.MachineriesUnit.findById(machineUnitId);
                if (machineUnit && machineUnit.status !== 'In Use') {
                    machineUnit.status = 'In Use';
                    await machineUnit.save();
                    updatedMachineUnits.add(machineUnitIdStr);
                    updateCount++;
                }
            } catch (error) {
                console.error(`Error updating machine unit ${machineUnitId}:`, error);
                // Continue with other machine units even if one fails
            }
        }

        if (updateCount > 0) {
            console.log(`Successfully updated ${updateCount} machine unit(s) to 'In Use' status`);
        } else {
            console.log('No machine units needed status update to \'In Use\'');
        }

    } catch (error) {
        console.error('Error updating machine unit status to In Use:', error);
        return;
    }
};

// Update machine unit status to 'Available' for completed tickets whose machine units are still 'In Use'
export const updateMachineUnitStatusToAvailable = async () => {
    try {
        // Find all completed ticket requests with assigned machine units
        const tickets = await global.machineriesModels.TicketRequest.find({
            status: 'Completed',
            'assignedMachineUnit.assignedMachineUnitId': { $exists: true, $ne: null }
        }).select('assignedMachineUnit');

        // Find all completed extension tickets with assigned machine units
        const extTickets = await global.machineriesModels.ExtensionTicket.find({
            status: 'Completed',
            'assignedMachineUnit.assignedMachineUnitId': { $exists: true, $ne: null }
        }).select('assignedMachineUnit');

        const updatedMachineUnits = new Set();
        let updateCount = 0;

        // Process ticket requests
        for (const ticket of tickets) {
            const machineUnitId = ticket.assignedMachineUnit?.assignedMachineUnitId;
            if (!machineUnitId) continue;

            const machineUnitIdStr = String(machineUnitId);
            if (updatedMachineUnits.has(machineUnitIdStr)) continue;

            try {
                const machineUnit = await global.machineriesModels.MachineriesUnit.findById(machineUnitId);
                if (machineUnit && machineUnit.status === 'In Use') {
                    // Check if this machine unit is still assigned to any ongoing tickets
                    const ongoingTicketCount = await global.machineriesModels.TicketRequest.countDocuments({
                        status: 'Ongoing',
                        'assignedMachineUnit.assignedMachineUnitId': machineUnitId
                    });

                    const ongoingExtTicketCount = await global.machineriesModels.ExtensionTicket.countDocuments({
                        status: 'Ongoing',
                        'assignedMachineUnit.assignedMachineUnitId': machineUnitId
                    });

                    // Only set to Available if no ongoing tickets are using it
                    if (ongoingTicketCount === 0 && ongoingExtTicketCount === 0) {
                        machineUnit.status = 'Available';
                        await machineUnit.save();
                        updatedMachineUnits.add(machineUnitIdStr);
                        updateCount++;
                    }
                }
            } catch (error) {
                console.error(`Error updating machine unit ${machineUnitId}:`, error);
                // Continue with other machine units even if one fails
            }
        }

        // Process extension tickets
        for (const ticket of extTickets) {
            const machineUnitId = ticket.assignedMachineUnit?.assignedMachineUnitId;
            if (!machineUnitId) continue;

            const machineUnitIdStr = String(machineUnitId);
            if (updatedMachineUnits.has(machineUnitIdStr)) continue;

            try {
                const machineUnit = await global.machineriesModels.MachineriesUnit.findById(machineUnitId);
                if (machineUnit && machineUnit.status === 'In Use') {
                    // Check if this machine unit is still assigned to any ongoing tickets
                    const ongoingTicketCount = await global.machineriesModels.TicketRequest.countDocuments({
                        status: 'Ongoing',
                        'assignedMachineUnit.assignedMachineUnitId': machineUnitId
                    });

                    const ongoingExtTicketCount = await global.machineriesModels.ExtensionTicket.countDocuments({
                        status: 'Ongoing',
                        'assignedMachineUnit.assignedMachineUnitId': machineUnitId
                    });

                    // Only set to Available if no ongoing tickets are using it
                    if (ongoingTicketCount === 0 && ongoingExtTicketCount === 0) {
                        machineUnit.status = 'Available';
                        await machineUnit.save();
                        updatedMachineUnits.add(machineUnitIdStr);
                        updateCount++;
                    }
                }
            } catch (error) {
                console.error(`Error updating machine unit ${machineUnitId}:`, error);
                // Continue with other machine units even if one fails
            }
        }

        if (updateCount > 0) {
            console.log(`Successfully updated ${updateCount} machine unit(s) to 'Available' status`);
        } else {
            console.log('No machine units needed status update to \'Available\'');
        }

    } catch (error) {
        console.error('Error updating machine unit status to Available:', error);
        return;
    }
};



