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

// Internal helpers (previously exported service functions)
const uploadFileToDrive = async (fileBuffer, fileName, mimeType, folderId = null) => {
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

    // Make file publicly accessible (optional)
    await drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
    });

    return response.data;
};

const createDriveFolder = async (folderName, parentFolderId = null) => {
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentFolderId && { parents: [parentFolderId] })
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name'
    });

    return response.data;
};

const listDriveFiles = async (folderId = null, pageSize = 100) => {
    const query = folderId
        ? `'${folderId}' in parents and trashed=false`
        : 'trashed=false';

    const response = await drive.files.list({
        q: query,
        pageSize,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, size)'
    });

    return response.data.files;
};

const getFileMetadata = async (fileId) => {
    return drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size'
    });
};

const getFileStream = async (fileId) => {
    return drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );
};

const deleteDriveFile = async (fileId) => {
    await drive.files.delete({ fileId });
    return { success: true, message: 'File deleted successfully' };
};

// Express handlers (routes call these directly)

// Upload handler (parses multipart + uploads)
export const uploadFile = (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        try {
            const { folderId } = req.body;
            const result = await uploadFileToDrive(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype,
                folderId
            );
            res.json({ success: true, file: result });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: error.message });
        }
    });
};

// Create folder handler
export const createFolder = async (req, res) => {
    try {
        const { folderName, parentFolderId } = req.body;
        const result = await createDriveFolder(folderName, parentFolderId);
        res.json({ success: true, folder: result });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: error.message });
    }
};

// List files handler
export const listFiles = async (req, res) => {
    try {
        const { folderId, pageSize } = req.query;
        const files = await listDriveFiles(
            folderId || null,
            pageSize ? Number(pageSize) : 100
        );
        res.json({ success: true, files });
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: error.message });
    }
};

// Download handler (sets headers then streams)
export const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const meta = await getFileMetadata(fileId);
        const streamResponse = await getFileStream(fileId);

        const fileName = meta.data.name || 'file';
        const mimeType = meta.data.mimeType || 'application/octet-stream';
        const size = meta.data.size;

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        if (size) res.setHeader('Content-Length', size);

        streamResponse.data.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming file' });
            } else {
                res.end();
            }
        });

        streamResponse.data.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete handler
export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const result = await deleteDriveFile(fileId);
        res.json(result);
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: error.message });
    }
};