import QRCode from 'qrcode';

export const createStaffAccount = async (req, res) => {
    const { name, office_position, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        // Check if staff already exists with the same email or phone
        const staffAlreadyExists = await global.docTrackModels.StaffAccount.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });

        if (staffAlreadyExists) {
            return res.status(400).json({ message: 'Staff account already exists' });
        }

        // Convert phone to number if it's provided as string
        const phoneNumber = phone ? Number(phone) : undefined;
        
        // Create new staff account
        const newStaffAccount = await global.docTrackModels.StaffAccount.create({
            name,
            office_position,
            email,
            phone: phoneNumber,
        });

        return res.status(201).json({
            message: 'Staff account created successfully',
            data: newStaffAccount,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating staff account', error: error.message });
    }
};



export const createDocument = async (req, res) => {
    try {
        // Check if request is already being processed to prevent duplicates
        if (req.processingStarted) {
            console.log('Prevented duplicate processing of request');
            return;
        }
        req.processingStarted = true;


        const { title, type, description, priority = 'Medium', remarks, action, id } = req.body;
        
        // Validate required fields
        if (!title || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and type are required' 
            });
        }
        
        // Validate document type
        if (!['IN', 'OUT'].includes(type)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Document type must be either IN or OUT' 
            });
        }
        
        // Validate priority
        if (priority && !['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Priority must be one of: Low, Medium, High, Urgent' 
            });
        }


                // Determine user role from ID by checking both collections
                let userDetails;
                let role;
                
                // Try finding in Admin collection first
                userDetails = await global.docTrackModels.AdminAccount.findById(id);
                if (userDetails) {
                    role = 'Admin';
                } else {
                    // If not found in Admin, check Staff collection
                    userDetails = await global.docTrackModels.StaffAccount.findById(id);
                    if (userDetails) {
                        role = 'Staff';
                    } else {
                        // User not found in either collection
                        return res.status(404).json({
                            success: false,
                            message: 'User not found with provided ID'
                        });
                    }
                }
                

        // Create new document
        const newDocument = await global.docTrackModels.Document.create({
            title,
            type,
            description,
            action,
            priority,
            currentHandler: {
                id: id,
                role: role
            },
            isCompleted: false
        });
        

        
        // Create document detail record
        const documentDetail = await global.docTrackModels.Document_Detail.create({
            document_id: newDocument._id,
            
            action, 
    

            handleBy: { 
               id: userDetails._id,
               name: userDetails.name,
               role: userDetails.role,
               office_position: userDetails.office_position,
               email: userDetails.email,
               phone: userDetails.phone,
            },

            remarks: remarks || `Document created or updated by ${userDetails.name}`,
        });
        
        // Generate unique 8-digit reference number
        const generateReferenceNumber = () => {
            // Generate random 8-digit number
            return Math.floor(10000000 + Math.random() * 90000000).toString();
        };
        
        let referenceNumber;
        let isUnique = false;
        
        // Keep generating until we get a unique reference number
        while (!isUnique) {
            referenceNumber = generateReferenceNumber();
            // Check if reference number already exists
            const existingQR = await global.docTrackModels.QrCode.findOne({ referenceNumber });
            if (!existingQR) {
                isUnique = true;
            }
        }

        const readableDate = new Date(newDocument.createdAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
        
        // Create QR data containing document ID and reference number
        const qrData = JSON.stringify({
            documentId: newDocument._id.toString(),
            referenceNumber: referenceNumber,
            title: newDocument.title,
            created: readableDate,
        });
        
        // Create QR code in database
        const qrCode = await global.docTrackModels.QrCode.create({
            document_id: newDocument._id,
            qr_data: qrData,
            referenceNumber,
            errorCorrectionLevel: 'M',
            version: 1,
            isActive: true
        });
        
        // Generate actual QR code image
        let qrImageData;
        try {
            qrImageData = await QRCode.toDataURL(qrData);
        } catch (err) {
            qrImageData = null;
            console.error('Error generating QR code image:', err);
        }
        
        return res.status(201).json({
            success: true,
            message: 'Document created successfully',
            data: {
                document: newDocument,
                documentDetail,
                qrCode: {
                    ...qrCode.toObject(),
                    qrImageUrl: `/documents/${newDocument._id}/qrcode` // URL to download the QR code
                }
            }
        });
        
    } catch (error) {
        console.error('Error creating document:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating document',
            error: error.message
        });
    }
};


export const downloadQrCode = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find QR code data for document
        const qrCode = await global.docTrackModels.QrCode.findOne({ document_id: id });
        
        if (!qrCode) {
            return res.status(404).json({
                success: false,
                message: 'QR code not found'
            });
        }
        
        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="document-${qrCode.referenceNumber}.png"`);
        res.setHeader('Content-Type', 'image/jpeg');
        
        // Calculate QR size (1.5 inches at 96 DPI = 144 pixels)
        const qrSize = 144;
        
        // Generate and send QR code
        return QRCode.toFileStream(res, qrCode.qr_data, {
            type: 'png',
            width: qrSize,
            margin: 4,
            errorCorrectionLevel: 'M'
        });
        
    } catch (error) {
        console.error('Error downloading QR code:', error);
        return res.status(500).json({
            success: false,
            message: 'Error downloading QR code',
            error: error.message
        });
    }
};