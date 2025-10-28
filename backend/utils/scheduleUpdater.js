
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
    } catch (error) {
        console.error('Error updating schedule status:', error);
        return;
    }
};

