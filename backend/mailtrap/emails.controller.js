import { mailTrapClient, sender } from "./mailtrap.config.js";
import { WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js"

export const sendWelcomeEmail = async (email, defaultPassword) => {
    const recipients = [{ email }];

    const subject = "AgriTrack Credentials *TEST*";
    const htmlContent = WELCOME_EMAIL_TEMPLATE
        .replace("{email}", email)
        .replace("{password}", defaultPassword);

    try {
        await mailTrapClient.send({
            from: sender,
            to: recipients,
            subject: subject,
            html: htmlContent,
            category: "Welcome Email",
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
    }
};