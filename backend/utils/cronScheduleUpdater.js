import cron from 'node-cron';
import { updateScheduleStatus, disableEditingForTodayTickets, updateMachineUnitStatusToInUse, updateMachineUnitStatusToAvailable } from './scheduleUpdater.js';

export const startScheduleStatusCron = () => {
	// Runs every day at 00:00 server time
	cron.schedule('0 0 * * *', async () => {
		try {
			await updateScheduleStatus();
			await disableEditingForTodayTickets();
			await updateMachineUnitStatusToInUse();
			await updateMachineUnitStatusToAvailable();
			console.log('Cron: Schedule and machine unitstatus update completed at midnight and disabled editing for today\'s tickets.');
		} catch (err) {
			console.error('Cron: Schedule and machine unit status updater failed:', err);
		}
	});
};
