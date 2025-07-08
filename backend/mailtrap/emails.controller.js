import { mailTrapClient, sender } from "./mailtrap.config.js";
import { WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js"

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

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipients = [{ email }];

    const subject = "Password Reset Request *TEST*";
    const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE
        .replace("{resetURL}", resetURL)

    try {
        await mailTrapClient.send({
            from: sender,
            to: recipients,
            subject: subject,
            html: htmlContent,
            category: "Forgot Password",
        });
        console.log(`Password reset request email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send password reset request email to ${email}:`, error);
    }
};

export const sendPasswordResetSuccessEmail = async (email) => {
    const recipients = [{ email }];

    const subject = "Password Reset Success *TEST*";
    const htmlContent = PASSWORD_RESET_SUCCESS_TEMPLATE;

    try {
        await mailTrapClient.send({
            from: sender,
            to: recipients,
            subject: subject,
            html: htmlContent,
            category: "Password Reset Success",
        });
        console.log(`Password reset success email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send password reset success email to ${email}:`, error);
    }
};

