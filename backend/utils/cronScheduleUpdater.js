import cron from 'node-cron';
import { updateScheduleStatus } from './scheduleUpdater.js';

export const startScheduleStatusCron = () => {
	// Runs every day at 00:00 server time
	cron.schedule('0 0 * * *', async () => {
		try {
			await updateScheduleStatus();
			console.log('Cron: Schedule status update completed at midnight.');
		} catch (err) {
			console.error('Cron: Schedule updater failed:', err);
		}
	});
};
