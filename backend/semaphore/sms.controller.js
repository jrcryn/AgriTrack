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

export const sendVisitationScheduleSMS = async (phone, farmerName, visitDate, visitTime, location, officerName) => {
    try {
        const message =
            `Magandang araw, ${farmerName}! Napansin namin na tinanggihan mo ang huling request para itama ang iyong datos. ` +
            `Upang ma-verify at maresolba ang iyong submission, magsasagawa kami ng field visitation.\n\n` +
            `Iskedyul: ${visitDate} ${visitTime}\n` +
            `Lokasyon: ${location}\n` +
            `Personnel: ${officerName}\n\n` +
            `Kung may conflict sa iskedyul, makipag-ugnayan sa ating group chat para sa re-schedule. Salamat.`;

        await sendSMS(phone, message);
        console.log("Visitation schedule SMS sent successfully");
    } catch (error) {
        console.error("Error sending visitation schedule SMS:", error);
        throw new Error(`Error sending visitation schedule SMS: ${error}`);
    }
};

