import cron from 'node-cron';
import { updateScheduleStatus, disableEditingForTodayTickets } from './scheduleUpdater.js';

export const startScheduleStatusCron = () => {
	// Runs every day at 00:00 server time
	cron.schedule('0 0 * * *', async () => {
		try {
			await updateScheduleStatus();
			await disableEditingForTodayTickets();
			console.log('Cron: Schedule status update completed at midnight and disabled editing for today\'s tickets.');
		} catch (err) {
			console.error('Cron: Schedule updater failed:', err);
		}
	});
};
