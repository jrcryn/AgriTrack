import qrcode from 'qrcode';


export const createDocument = async (req, res) => {
    const { documentName, documentCode, disposalMethod, retentionPeriod } = req.body;
    try {
        const newDocument = await global.docTrackModels.Document.create({
            documentName,
            documentCode,
            disposalMethod,
            retentionPeriod //in months
        });
        return res.status(201).json({
            success: true,
            message: 'Document created successfully',
            data: newDocument
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
    const { userAccountId, documentId, priority, remarks } = req.body;
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
            remarks: remarks,
            currentHandler: {
                userId: user._id
            }
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
        
        // Find QR code data for document
        const qrCode = await global.docTrackModels.DocumentLifeCycle.findById(id);

        if (!qrCode) {
            return res.status(404).json({
                success: false,
                message: 'Registered document not found.'
            });
        }
        
        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="document-${qrCode.refNumber}.png"`);
        res.setHeader('Content-Type', 'image/jpeg');
        
        // Generate QR as PNG buffer, 600x600px (2x2 inches at 300dpi)
        
        // Generate and send QR code
        return qrcode.toFileStream(res, qrCode.docQRData, {
            type: 'png',
            width: 144,
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
                currentHandler: {
                        userId: forwardUser._id
                    }
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
        const retentionUntil = new Date(today.setMonth(today.getMonth() + docType.retentionPeriod));

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


