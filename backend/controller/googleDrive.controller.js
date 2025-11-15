import { oauth2Client, drive } from '../config/googleDriveService.js';
import multer from 'multer';
import { Readable } from 'stream';

// Multer configured here so routes stay thin
const uploadMiddleware = multer({ storage: multer.memoryStorage() }).single('file');

// Generate auth URL for first-time setup
export const getAuthUrl = (req, res) => {
    const scopes = ['https://www.googleapis.com/auth/drive.file'];
    
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
    
    res.json({ authUrl: url });
};

// Handle OAuth callback and get refresh token
export const handleCallback = async (req, res) => {
    const { code } = req.query;
    
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        console.log('Refresh Token:', tokens.refresh_token);
        console.log('Add this to your .env file as GOOGLE_REFRESH_TOKEN');
        
        res.send('Authorization successful! Check console for refresh token.');
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send('Error during authorization');
    }
};

// Export this helper so other controllers can use it
export const uploadFileToDrive = async (fileBuffer, fileName, mimeType, folderId = null) => {
    const fileMetadata = {
        name: fileName,
        ...(folderId && { parents: [folderId] })
    };

    const media = {
        mimeType,
        body: Readable.from(fileBuffer)
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink, webContentLink'
    });

    // Make file publicly accessible
    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
    });

    return response.data;
};

export const deleteFileFromDrive = async (fileId) => {
    try {
        await drive.files.delete({
            fileId: fileId
        });

        return { success: true, message: 'File deleted successfully' };
    } catch (error) {
        console.error('Error deleting file from Drive:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};