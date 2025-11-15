//only ran once when the backend server starts, fallback sya for cron job kung sakaling mamatay yung backend service
export const updateScheduleStatus = async () => {
    try {
        const now = new Date();

        const tickets = await global.machineriesModels.TicketRequest.find({ status: 'Scheduled', scheduleId: { $ne: null } }).populate('scheduleId', '_id weekStart weekEnd status');

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

                // Update ticket
                if (tr.status !== 'Ongoing') {
                    tr.status = 'Ongoing';
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

        // Find all ongoing tickets with assignedDate <= today and disabledForEditing = false
        const tickets = await global.machineriesModels.TicketRequest.find({
            status: 'Ongoing',
            assignedDate: {
                $lte: startOfDay
            },
            disabledForEditing: { $ne: true }
        });

        if (tickets.length === 0) {
            console.log('No ongoing tickets found with today\'s or past assigned dates');
            return;
        }

        // Update all matching tickets
        const updatePromises = tickets.map(ticket => {
            ticket.disabledForEditing = true;
            return ticket.save();
        });

        await Promise.all(updatePromises);
        console.log(`Successfully disabled editing for ${tickets.length} ticket(s) with today's or past assigned dates`);

    } catch (error) {
        console.error('Error disabling editing for today\'s tickets:', error);
        return;
    }
};

