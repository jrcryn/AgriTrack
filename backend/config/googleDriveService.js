import { google } from "googleapis";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug logs to verify environment variables are loaded
// console.log('Google Drive Service - Environment Check:');
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ loaded' : '✗ missing');
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ loaded' : '✗ missing');
// console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'using default');
// console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? '✓ loaded' : '✗ not set yet');

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 3000}/api/google/callback`
);

// Set credentials if refresh token exists
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
}

export const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});