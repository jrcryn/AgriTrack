import { sendSMS } from "./semaphore.config.js";

export const sendNewlyPlantedCropCorrectionSMS = async (phone, farmerName, reviewLink) => {
    try {
        const message = `Magandang araw, ${farmerName}! Napansin ng staff ang mali sa iyong isinumiteng newly planted crop na impormasyon. Bilang pagsunod sa Data Privacy Act, kailangan namin ang iyong pahintulot para maitama ito.\n\nPaki-review dito: ${reviewLink}`;
        await sendSMS(phone, message);
        console.log("Newly planted crop correction SMS sent successfully");
    } catch (error) {
        console.error("Error sending newly planted crop correction SMS:", error);
        throw new Error(`Error sending newly planted crop correction SMS: ${error}`);
    }
};

export const sendHarvestingCropCorrectionSMS = async (phone, farmerName, reviewLink) => {
    try {
        const message = `Magandang araw, ${farmerName}! Napansin ng staff ang mali sa iyong isinumiteng harvesting crop na impormasyon. Bilang pagsunod sa Data Privacy Act, kailangan namin ang iyong pahintulot para maitama ito.\n\nPaki-review dito: ${reviewLink}`;
        await sendSMS(phone, message);
        console.log("Harvesting crop correction SMS sent successfully");
    } catch (error) {
        console.error("Error sending harvesting crop correction SMS:", error);
        throw new Error(`Error sending harvesting crop correction SMS: ${error}`);
    }
};

