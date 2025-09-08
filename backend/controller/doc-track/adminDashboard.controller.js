import qrcode from 'qrcode';
import PDFDocument from 'pdfkit';


export const createDocument = async (req, res) => {
    const { documentName, documentCode, disposalMethod, retentionPeriod } = req.body;
    try {
        if (!documentName || !documentCode) {
            return res.status(400).json({
                success: false,
                message: 'All available fields are required.'
            });
        }
        if (retentionPeriod === 0 ) { //pag ka number ang nilagay ni user as a retention period, should be null meaning permanent
            retentionPeriod = null;
        }
        const newDocument = await global.docTrackModels.Document.create({
            documentName,
            documentCode,
            disposalMethod,
            retentionPeriod //in months
        });
        return res.status(201).json({
            success: true,
            message: 'Document type created successfully.',
            data: newDocument
        });
    } catch (error) {
        console.error('Error creating document:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating document type.',
            error: error.message
        });
    }
};

const getNextSequence = async (key) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const currentDate = `${yyyy}${mm}${dd}`;

    let counter = await global.docTrackModels.Counter.findOne({ _id: key });

    if (!counter || counter.date !== currentDate) {
    counter = await global.docTrackModels.Counter.findOneAndUpdate(
      { _id: key },
      { $set: { seq: 1, date: currentDate } },
      { new: true, upsert: true }
    );
    } else {
        counter = await global.docTrackModels.Counter.findOneAndUpdate(
        { _id: key },
        { $inc: { seq: 1 } },
        { new: true }
    );
    }

    const finSequence = `${currentDate}-${String(counter.seq).padStart(4, '0')}`;
    return finSequence;
};

export const registerDocument = async (req, res) => {
    const { userAccountId, documentId, priority, details } = req.body;
    try {

        const document = await global.docTrackModels.Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document type not found.'});
        }

        let user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                   await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.'});
        }

        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        const newRefNumber = await getNextSequence('document_ref_number');
        const readableDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        const qrData = JSON.stringify({
        refNumber: newRefNumber,
        name: document.documentName,
        code: document.documentCode,
        registeredBy: `${user.first_name}, ${user.last_name}`,
        createdAt: readableDate
        });

        const newDocRegistration = await global.docTrackModels.DocumentLifeCycle.create({
            documentId: document._id,
            documentName: document.documentName,
            documentCode: document.documentCode,

            priority: priority,
            refNumber: newRefNumber,
            docQRData: qrData,

            lifeCycle: {
                action: 'Document Created',
                performedBy: {
                    userModel: userModel,
                    userId: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    middle_name: user.middle_name,
                    suffix: user.suffix,
                    role: user.role,
                    office_position: user.office_position,
                    email: user.email,
                    phone: user.phone
                },
                timeStamp: Date.now(),
            },
            details: details,
            $set: { currentHandler: { userId: user._id } }
        });


        return res.status(201).json({ 
            success: true, 
            message: 'Document registered successfully.', 
            data: newDocRegistration,
            qrImageUrl: `/api/doc-track/download-qr-code/${newDocRegistration._id}`
        });

    } catch (error) {

        console.error('Error registering document:', error);
        return res.status(500).json({ success: false, message: 'Error registering document.', error: error.message });
    }
};

export const downloadQrCode = async (req, res) => {
    try {
        const { id } = req.params;
        
        const qrCodeDoc = await global.docTrackModels.DocumentLifeCycle.findById(id);

        if (!qrCodeDoc) {
            return res.status(404).json({
                success: false,
                message: 'Registered document not found.'
            });
        }
        
        // --- PDF and Image Setup ---
        const qrSize = 144; // 2x2 inches (144 points)
        const margin = 36; // 0.5 inch margin

        // 1. Generate the QR code as a PNG buffer
        const qrCodeBuffer = await qrcode.toBuffer(qrCodeDoc.docQRData, {
            type: 'png',
            width: qrSize,
            margin: 1,
            errorCorrectionLevel: 'M'
        });

        // 2. Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4', // Standard A4 paper size
            margins: { top: margin, bottom: margin, left: margin, right: margin }
        });

        // 3. Set headers for PDF download
        res.setHeader('Content-Disposition', `attachment; filename="qr-code-${qrCodeDoc.refNumber}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');

        // 4. Pipe the PDF document to the response
        doc.pipe(res);

        // 5. Position and draw the QR code and text on the far left
        const xPos = margin;
        const yPos = margin;

        // Add the QR code image
        doc.image(qrCodeBuffer, xPos, yPos, { width: qrSize });

        // Add the reference number text below the QR code
        doc.fontSize(10)
           .font('Helvetica')
           .text(qrCodeDoc.refNumber, xPos, yPos + qrSize + 5, { // 5 points of spacing
               width: qrSize,
               align: 'center'
           });

        // 6. Finalize the PDF and end the stream
        doc.end();
        
    } catch (error) {
        console.error('Error downloading QR code as PDF:', error);
        return res.status(500).json({
            success: false,
            message: 'Error downloading QR code',
            error: error.message
        });
    }
};

export const forwardDocument = async (req, res) => {
    const { registeredDocId, userAccountId, forwardAccountId, forwardRemarks } = req.body;

    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findById(registeredDocId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Registered document not found.' });
        }

        let user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                   await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        let forwardUser = await global.docTrackModels.ManagerAccount.findById(forwardAccountId) ||
                          await global.docTrackModels.StaffAccount.findById(forwardAccountId);
        if (!forwardUser) {
            return res.status(404).json({ success: false, message: 'Cannot find the user you are trying to forward to.' });
        }
        const userForwardModel = forwardUser instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';


        const forwardDocument = await global.docTrackModels.DocumentLifeCycle.updateOne(
            {_id: document._id},
            {
                $push: {
                    lifeCycle: {
                        action: 'Forwarded',
                        performedBy: {
                            userModel: userModel,
                            userId: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone
                        },
                        forwardDetails: {
                            userModel: userForwardModel,
                            userId: forwardUser._id,
                            first_name: forwardUser.first_name,
                            last_name: forwardUser.last_name,
                            middle_name: forwardUser.middle_name,
                            suffix: forwardUser.suffix,
                            role: forwardUser.role,
                            office_position: forwardUser.office_position,
                            email: forwardUser.email,
                            phone: forwardUser.phone,
                            forwardRemarks: forwardRemarks
                        },
                        timeStamp: Date.now()
                    }
                    
                },
                $set: { currentHandler: { userId: forwardUser._id } }

            }
        );

        return res.status(200).json({ success: true, message: 'Document forwarded successfully', data: forwardDocument });

    } catch (error) {
        console.error('Error forwarding document:', error);
        return res.status(500).json({ success: false, message: 'Error forwarding document', error: error.message });
    }
};

export const receiveDocument = async (req, res) => {
    const { registeredDocId, userAccountId } = req.body;

    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findById(registeredDocId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Registered document not found.' });
        }

        let user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                   await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        const receiveDocument = await global.docTrackModels.DocumentLifeCycle.updateOne(
            {_id: document._id},
            {
                $push: {
                    lifeCycle: {
                        action: 'Received/Work on Progress',
                        performedBy: {
                            userModel: userModel,
                            userId: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone
                        },
                        timeStamp: Date.now()
                    }
                }
            }
        );
        return res.status(200).json({ success: true, message: 'Document received successfully', data: receiveDocument });
    } catch (error) {
        console.error('Error receiving document:', error);
        return res.status(500).json({ success: false, message: 'Error receiving document', error: error.message });
    }
};

export const archiveDocument = async (req, res) => { 
    const { registeredDocId, userAccountId, medium, location, archiveRemarks } = req.body;

    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findById(registeredDocId);
        if (!document) {
            return res.status(404).json({ success:false, message: 'Registered document not found.' });
        }
        const docType = await global.docTrackModels.Document.findById(document.documentId);
        if (!docType) {
            return res.status(404).json({ success:false, message: 'Document type not found.' });
        }
        const user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                     await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        const today = new Date();
        let retentionUntil = new Date(today.setMonth(today.getMonth() + docType.retentionPeriod));
        if (!docType.retentionPeriod === 0) { //if null, meaning permanent
            retentionUntil = null;
        }

        const archiveDocument = await global.docTrackModels.DocumentLifeCycle.findOneAndUpdate(
            { _id: document._id },
            {
                $push: {
                    lifeCycle: {
                        action: 'Archived',
                        performedBy: {
                            userModel: userModel,
                            userId: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone
                        },
                        archivalDetails: {
                            disposalMethod: docType.disposalMethod,
                            retentionPeriod: docType.retentionPeriod,

                            retentionUntil: retentionUntil,
                            medium: medium,
                            location: location,
                            archiveRemarks: archiveRemarks
                        },
                        timeStamp: Date.now()
                    },
                },
                $set: { currentHandler: null }
            },
            { new: true }
        );

        const archiveColl = global.docTrackModels.ArchivedDocuments.db.collection('archived_documents');
        await archiveColl.insertOne(
            {
                ...archiveDocument.toObject()
            }
        )

        await global.docTrackModels.DocumentLifeCycle.findByIdAndDelete(document._id);

        return res.status(200).json({ success: true, message: 'Document archived successfully', data: archiveDocument });
    } catch (error) {
        return res.status(500).json({success: false, message: 'Error archiving document', error: error.message});
     }
};

export const releaseDocument = async (req, res) => {
    const { registeredDocId, userAccountId, recipientOffice, recipientPerson, modeOfRelease, releaseRemarks } = req.body;

    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findById(registeredDocId);
        if (!document) {
            return res.status(404).json({ success:false, message: 'Registered document not found.' });
        }
        const user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                     await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        const releaseDocument = await global.docTrackModels.DocumentLifeCycle.findOneAndUpdate(
            { _id: document._id },
            {
                $push: {
                    lifeCycle: {
                        action: 'Released',
                        performedBy: {
                            userModel: userModel,
                            userId: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone
                        },
                        releaseDetails: {
                            recipientOffice: recipientOffice,
                            recipientPerson: recipientPerson,
                            modeOfRelease: modeOfRelease, 
                            releaseRemarks: releaseRemarks,
                        },
                        timeStamp: Date.now()
                    },
                },
                $set: { currentHandler: null }

            },
            { new: true }
        );

        const ReleasedColl = global.docTrackModels.ReleasedDocuments.db.collection('released_documents');
        await ReleasedColl.insertOne(
            {
                ...releaseDocument.toObject()
            }
        )

        await global.docTrackModels.DocumentLifeCycle.findByIdAndDelete(document._id);

        return res.status(200).json({ success: true, message: 'Document released successfully', data: releaseDocument });
    } catch (error) {
        return res.status(500).json({success: false, message: 'Error releasing document', error: error.message});
     }
};

export const getIncomingForwardedDocuments = async (req, res) => {
    const {id} = req.params;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Default to 5 per page for each section
        const skip = (page - 1) * limit;

        const user = await global.docTrackModels.ManagerAccount.findById(id) ||
                     await global.docTrackModels.StaffAccount.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }

        const pipeline = [
            // Stage 1: Match documents assigned to the current user
            {
                $match: { 'currentHandler.userId': user._id }
            },
            // Stage 2: Add a field with the last lifecycle action
            {
                $addFields: {
                    lastAction: { $arrayElemAt: ['$lifeCycle', -1] }
                }
            },
            // Stage 3: Match only if the last action was 'Forwarded'
            {
                $match: { 'lastAction.action': 'Forwarded' }
            },
            // Stage 4: Sort and Paginate using $facet
            {
                $facet: {
                    paginatedResults: [
                        { $sort: { 'lastAction.timeStamp': -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await global.docTrackModels.DocumentLifeCycle.aggregate(pipeline);

        const relevantDocs = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            success: true, 
            message: 'Successfully fetched incoming documents.', 
            data: {
                relevantDocs, 
                totalCount, 
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Error fetching incoming documents', error: error.message});
    }
};

export const getPendingDocuments = async (req, res) => {
    const {id} = req.params;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Default to 5 per page for each section
        const skip = (page - 1) * limit;

        const user = await global.docTrackModels.ManagerAccount.findById(id) ||
                     await global.docTrackModels.StaffAccount.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }

        const pipeline = [
            // Stage 1: Match documents assigned to the current user
            {
                $match: { 'currentHandler.userId': user._id }
            },
            // Stage 2: Add a field with the last lifecycle action
            {
                $addFields: {
                    lastAction: { $arrayElemAt: ['$lifeCycle', -1] }
                }
            },
            // Stage 3: Match only if the last action was 'Forwarded'
            {
                $match: { 'lastAction.action': 'Received/Work on Progress' }
            },
            // Stage 4: Sort and Paginate using $facet
            {
                $facet: {
                    paginatedResults: [
                        { $sort: { 'lastAction.timeStamp': -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await global.docTrackModels.DocumentLifeCycle.aggregate(pipeline);

        const relevantDocs = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            success: true, 
            message: 'Successfully fetched incoming documents.', 
            data: {
                relevantDocs, 
                totalCount, 
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Error fetching incoming documents', error: error.message});
    }
};

export const getDocumentTypes = async (req, res) => {
    try {
        const docTypes = await global.docTrackModels.Document.find();
        return res.status(200).json({success: true, message: 'Successfully fetched document types.', data: docTypes})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Error fetching document types.', error: error.message})
    }
};

export const getDocumentHistory = async (req, res) => {
    const {id} = req.params;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await global.docTrackModels.ManagerAccount.findById(id) ||
                     await global.docTrackModels.StaffAccount.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }

        // Define the start and end of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const pipeline = [
            {
                $match: {
                    'lifeCycle': {
                        $elemMatch: {
                            'performedBy.userId': user._id,
                            'timeStamp': {
                                $gte: startOfToday,
                                $lte: endOfToday
                            }
                        }
                    }
                },
            },
            {
                $facet: {
                    paginatedResults: [
                        { $sort: {'lifeCycle.timeStamp': -1} },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await global.docTrackModels.DocumentLifeCycle.aggregate(pipeline);

        const relevantDocs = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            success: true,
            message: 'Successfully fetched document history.',
            data: {
                relevantDocs,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Error fetching document history', error: error.message})
    }
};

export const getDocumentStatus = async (req, res) => { //check doc status
    const { refNum } = req.params;
    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findOne({refNumber: refNum})

        if (!document) {
            return res.status(404).json({success: false, message: "Cannot find document with that reference number."})
        }

        return res.status(200).json({success: true, message: "Successfully found document.", data: document})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Failed to check document status."})
    }
};



