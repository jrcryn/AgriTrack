import { google } from "googleapis";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get credentials - remove fallbacks as they might cause issues
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 3000}/api/google/callback`;

// Validate that we have required credentials
if (!clientId || !clientSecret) {
    console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables');
    console.error('Current values:', { clientId: clientId ? 'set' : 'missing', clientSecret: clientSecret ? 'set' : 'missing' });
    throw new Error('Google OAuth credentials are missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
}

export const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
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