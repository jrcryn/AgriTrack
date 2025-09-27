import qrcode from 'qrcode';
import PDFDocument from 'pdfkit';

const capitalizeWords = (str) => {
    if (!str) return str;

    const smallWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with']);

    return str.split(' ').map((word, index) => {
        return word.split('-').map(part => {
            const match = part.match(/^(\W*)(\w+)(\W*)$/);
            if (!match) {
                return part;
            }

            const [, prefix, coreWord, suffix] = match;

            // Preserve abbreviations (all-caps words)
            if (coreWord.length > 1 && coreWord === coreWord.toUpperCase()) {
                return prefix + coreWord + suffix;
            }

            const lowerCoreWord = coreWord.toLowerCase();

            // Capitalize if it's the first word or not a small word
            if (index === 0 || !smallWords.has(lowerCoreWord)) {
                return prefix + coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase() + suffix;
            } else {
                return prefix + lowerCoreWord + suffix;
            }
        }).join('-');
    }).join(' ');
};

export const createDocument = async (req, res) => {
    const { documentName, documentCode, disposalMethod, retentionPeriod } = req.body;
    try {
        if (!documentName || !documentCode) {
            return res.status(400).json({
                success: false,
                message: 'All available fields are required.'
            });
        }
        
        const formattedDocName = await capitalizeWords(documentName);

        const newDocument = await global.docTrackModels.Document.create({
            documentName: formattedDocName,
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

export const updateDocumentType = async (req, res) => {
    const { documentId, documentName, documentCode, disposalMethod, retentionPeriod } = req.body;

    try {
        const document = await global.docTrackModels.Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document type not found.' });
        }

        if (documentName !== undefined) document.documentName = capitalizeWords(documentName);
        if (documentCode !== undefined) document.documentCode = documentCode;
        if (disposalMethod !== undefined) document.disposalMethod = disposalMethod;
        if (retentionPeriod !== undefined) document.retentionPeriod = retentionPeriod;

        await document.save();

        return res.status(200).json({ success: true, message: 'Document type updated successfully.', data: document });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Error updating document type', error: error.message});
    }
}

const getNextSequence = async (key) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const currentDate = `${yyyy}${mm}${dd}`;

  const counterId = `${key}:${currentDate}`;

  // Find and update (or insert) atomically
  const counter = await global.docTrackModels.Counter.findOneAndUpdate(
    { _id: counterId },
    {
      $inc: { seq: 1 },                        // increment if exists
      $setOnInsert: { date: currentDate },     // only set date on first insert
    },
    { new: true, upsert: true }                // create if not exists
  );

  // If it was just created, seq will be undefined → set it to 1
  const sequenceNumber = counter.seq || 1;

  return `${currentDate}-${String(sequenceNumber).padStart(4, '0')}`;
};

export const registerDocument = async (req, res) => {
    const { userAccountId, documentId, priority, details, isRegisterOnly, documentNameText, originatingOffice, isManuallyTyped } = req.body;
    try {

        const document = isManuallyTyped ? null : await global.docTrackModels.Document.findById(documentId);
        if (!document && isManuallyTyped === false) {
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
        name: isManuallyTyped ? documentNameText : document.documentName,
        code: isManuallyTyped ? 'N/A' : document.documentCode,
        originatingOffice: isManuallyTyped ? originatingOffice : 'N/A',
        registeredBy: `${user.first_name}, ${user.last_name}`,
        createdAt: readableDate
        });

        const newDocRegistration = await global.docTrackModels.DocumentLifeCycle.create({
            documentId: isManuallyTyped ? null : document._id,
            documentName: isManuallyTyped ? 'N/A' : document.documentName,
            documentCode: isManuallyTyped ? 'N/A' : document.documentCode,

            documentNameText: isManuallyTyped ? documentNameText : 'N/A',
            originatingOffice: isManuallyTyped ? originatingOffice : 'N/A',

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
        });

        if (isRegisterOnly === true) {
            await global.docTrackModels.DocumentLifeCycle.updateOne(
            {_id: newDocRegistration._id},
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
                            userModel: userModel,
                            userId: user._id,
                            first_name: user.first_name,
                            last_name: user.lastName,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone,
                            forwardRemarks: 'Registered and forwarded to self.'
                        },
                        timeStamp: Date.now()
                    }
                    
                },
                $set: { currentHandler: { 
                    first_name: user.first_name,
                    last_name: user.last_name,
                    middle_name: user.middle_name,
                    suffix: user.suffix,
                    role: user.role,
                    office_position: user.office_position,
                    email: user.email,
                    phone: user.phone
                } }

            }
        );
        };

        return res.status(201).json({ 
            success: true, 
            message: 'Document registered successfully and QR code generated.',
            data: newDocRegistration,
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

        let forwardAccount = await global.docTrackModels.ManagerAccount.findById(forwardAccountId) ||
                          await global.docTrackModels.StaffAccount.findById(forwardAccountId);
        if (!forwardAccount) {
            return res.status(404).json({ success: false, message: 'Cannot find the user you are trying to forward to.' });
        }
        const userForwardModel = forwardAccount instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';


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
                            userId: forwardAccount._id,
                            first_name: forwardAccount.first_name,
                            last_name: forwardAccount.lastName,
                            middle_name: forwardAccount.middle_name,
                            suffix: forwardAccount.suffix,
                            role: forwardAccount.role,
                            office_position: forwardAccount.office_position,
                            email: forwardAccount.email,
                            phone: forwardAccount.phone,
                            forwardRemarks: forwardRemarks
                        },
                        timeStamp: Date.now()
                    }
                    
                },
                $set: { currentHandler: { 
                    first_name: forwardAccount.first_name,
                    last_name: forwardAccount.lastName,
                    middle_name: forwardAccount.middle_name,
                    suffix: forwardAccount.suffix,
                    role: forwardAccount.role,
                    office_position: forwardAccount.office_position,
                    email: forwardAccount.email,
                    phone: forwardAccount.phone
                } }

            }
        );

        return res.status(200).json({ success: true, message: 'Document forwarded successfully', data: forwardDocument });

    } catch (error) {
        console.error('Error forwarding document:', error);
        return res.status(500).json({ success: false, message: 'Error forwarding document', error: error.message });
    }
};

export const registerAndForwardDocument = async (req, res) => {
    const { userAccountId, documentId, priority, details, forwardAccountId, forwardRemarks, documentNameText, originatingOffice, isManuallyTyped } = req.body;

    try {
        const registerDocument = isManuallyTyped ? null : await global.docTrackModels.Document.findById(documentId);
        if (!registerDocument && isManuallyTyped === false) {
            return res.status(404).json({ success: false, message: 'Document type not found.'});
        }

        let registerAccount = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                              await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!registerAccount) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.'});
        }

        const registerAccountModel = registerAccount instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        const newRefNumber = await getNextSequence('document_ref_number');
        const readableDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        const qrData = JSON.stringify({
        refNumber: newRefNumber,
        name: isManuallyTyped ? documentNameText : registerDocument.documentName,
        code: isManuallyTyped ? 'N/A' : registerDocument.documentCode,
        originatingOffice: isManuallyTyped ? originatingOffice : 'N/A',
        registeredBy: `${registerAccount.first_name}, ${registerAccount.last_name}`,
        createdAt: readableDate
        });

        const newDocRegistration = await global.docTrackModels.DocumentLifeCycle.create({
            documentId: isManuallyTyped ? null : registerDocument._id,
            documentName: isManuallyTyped ? 'N/A' : registerDocument.documentName,
            documentCode: isManuallyTyped ? 'N/A' : registerDocument.documentCode,

            documentNameText: isManuallyTyped ? documentNameText : 'N/A',
            originatingOffice: isManuallyTyped ? originatingOffice : 'N/A',

            priority: priority,
            refNumber: newRefNumber,
            docQRData: qrData,

            lifeCycle: {
                action: 'Document Created',
                performedBy: {
                    userModel: registerAccountModel,
                    userId: registerAccount._id,
                    first_name: registerAccount.first_name,
                    last_name: registerAccount.last_name,
                    middle_name: registerAccount.middle_name,
                    suffix: registerAccount.suffix,
                    role: registerAccount.role,
                    office_position: registerAccount.office_position,
                    email: registerAccount.email,
                    phone: registerAccount.phone
                },
                timeStamp: Date.now(),
            },
            details: details,
        });
        
        let forwardAccount = await global.docTrackModels.ManagerAccount.findById(forwardAccountId) ||
                   await global.docTrackModels.StaffAccount.findById(forwardAccountId);
        if (!forwardAccount) {
            return res.status(404).json({ success: false, message: 'Cannot find the user you are trying to forward to.'});
        }
        const forwardAccountModel = forwardAccount instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        const forwardDocument = await global.docTrackModels.DocumentLifeCycle.findById(newDocRegistration._id);
        if (!forwardDocument) {
            return res.status(404).json({ success: false, message: 'Registered document not found.' });
        }
        
        const docForwarded = await global.docTrackModels.DocumentLifeCycle.updateOne(
            {_id: forwardDocument._id},
            {
                $push: {
                    lifeCycle: {
                        action: 'Forwarded',
                        performedBy: {
                            userModel: forwardAccountModel,
                            userId: registerAccount._id,
                            first_name: registerAccount.first_name,
                            last_name: registerAccount.last_name,
                            middle_name: registerAccount.middle_name,
                            suffix: registerAccount.suffix,
                            role: registerAccount.role,
                            office_position: registerAccount.office_position,
                            email: registerAccount.email,
                            phone: registerAccount.phone
                        },
                        forwardDetails: {
                            userModel: forwardAccountModel,
                            userId: forwardAccount._id,
                            first_name: forwardAccount.first_name,
                            last_name: forwardAccount.lastName,
                            middle_name: forwardAccount.middle_name,
                            suffix: forwardAccount.suffix,
                            role: forwardAccount.role,
                            office_position: forwardAccount.office_position,
                            email: forwardAccount.email,
                            phone: forwardAccount.phone,
                            forwardRemarks: forwardRemarks
                        },
                        timeStamp: Date.now()
                    }
                    
                },
                $set: { currentHandler: { 
                    first_name: forwardAccount.first_name,
                    last_name: forwardAccount.lastName,
                    middle_name: forwardAccount.middle_name,
                    suffix: forwardAccount.suffix,
                    role: forwardAccount.role,
                    office_position: forwardAccount.office_position,
                    email: forwardAccount.email,
                    phone: forwardAccount.phone
                } }

            }
        );

        return res.status(201).json({ 
            success: true, 
            message: 'Document registered, forwarded and QR code generated successfully.', 
            data: newDocRegistration,
        });

    } catch (error) {
        console.error('Error registering and forwarding document:', error);
        return res.status(500).json({ success: false, message: 'Error registering and forwarding document.', error: error.message });
    }
}

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
    const { registeredDocId, userAccountId, medium, location, archiveRemarks, isCustomDoc, customDisposalMethod, customRetentionPeriod } = req.body;

    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findById(registeredDocId);
        if (!document) {
            return res.status(404).json({ success:false, message: 'Registered document not found.' });
        }
        const docType = isCustomDoc !== true ? await global.docTrackModels.Document.findById(document.documentId) : null;
        if (!docType && isCustomDoc !== true) {
            return res.status(404).json({ success:false, message: 'Document type not found.' });
        }
        const user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                     await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';


        const rawPeriod = isCustomDoc === true
            ? Number(customRetentionPeriod)
            : Number(docType?.retentionPeriod);
        const period = Number.isFinite(rawPeriod) && rawPeriod > 0 ? rawPeriod : null;

        let retentionUntil = null;
        if (period) {
            const until = new Date();
            until.setMonth(until.getMonth() + period);
            retentionUntil = until;
        }

        // const today = new Date();
        // const retUntil = isCustomDoc !== true ? docType.retentionPeriod : customRetentionPeriod;
        // let retentionUntil = new Date(today.setMonth(today.getMonth() + retUntil));
        // if (!docType.retentionPeriod === 0 && isCustomDoc !== true) { //if null, meaning permanent
        //     retentionUntil = null;
        // }

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
                            disposalMethod: isCustomDoc !== true ? docType.disposalMethod : customDisposalMethod,
                            retentionPeriod: isCustomDoc !== true ? docType.retentionPeriod : customRetentionPeriod,

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
        console.error('Error archiving document:', error);
        return res.status(500).json({success: false, message: 'Error archiving document', error: error.message});
     }
};

export const releaseDocument = async (req, res) => {
    const { registeredDocId, userAccountId, recipientOffice, recipientPerson, modeOfRelease, releaseRemarks, isCustomDoc } = req.body;

    try {
        const document = isCustomDoc !== true ? await global.docTrackModels.DocumentLifeCycle.findById(registeredDocId) : null;
        if (!document && isCustomDoc !== true) {
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

export const getAdminAndStaffAccounts = async (req, res) => {
    const {id} = req.params;
    try {
        const projection = {
            first_name: 1,
            last_name: 1,
            middle_name: 1,
            suffix: 1,
            role: 1,
            office_position: 1
        }
        const filter = {_id: {$ne: id}};
        const [managers, staffs] = await Promise.all([
            global.docTrackModels.ManagerAccount.find(filter, projection).lean(),
            global.docTrackModels.StaffAccount.find(filter, projection).lean()
        ]);

        const allAccounts = [...managers, ...staffs];

        return res.status(200).json({success: true, message: 'Successfully fetched all admin and staff accounts.', data: allAccounts})
    } catch (error) {   
        console.error('Error fetching admin and staff accounts:', error);
        return res.status(500).json({success: false, message: 'Error fetching accounts.', error: error.message});
    }   
};

export const getIncomingForwardedDocuments = async (req, res) => {
    const {id} = req.params;
    const { searchQuery } = req.query; // keep this
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await global.docTrackModels.ManagerAccount.findById(id) ||
                     await global.docTrackModels.StaffAccount.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }

        // Base pipeline: assigned to you and last action is Forwarded
        const pipeline = [
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            {
                $match: {
                    $or: [
                         { 'lastAction.action': 'Forwarded', 'lastAction.forwardDetails.userId': user._id },
                         { 'lastAction.action': 'Rerouted', 'lastAction.rerouteDetails.userId': user._id },
                         { 'lastAction.action': 'Unarchived', 'lastAction.forwardDetails.userId': user._id },
                         { 'lastAction.action': 'Unreleased', 'lastAction.forwardDetails.userId': user._id },
                    ]
                }
            }
        ];

        // Optional search filter across fields if searchQuery provided
        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { documentName: { $regex: word, $options: 'i' } },
                    { documentCode: { $regex: word, $options: 'i' } },
                    { refNumber:   { $regex: word, $options: 'i' } },
                    { documentNameText: { $regex: word, $options: 'i' } },
                ],
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        // Pagination and count
        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.timeStamp': -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

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
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Error fetching incoming documents', error: error.message});
    }
};

export const getPendingDocuments = async (req, res) => {
    const {id} = req.params;
    const { searchQuery } = req.query; // added
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
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': 'Received/Work on Progress', 
                        'lastAction.performedBy.userId': user._id }
            },
        ];

        // added: optional search filter
        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { documentName: { $regex: word, $options: 'i' } },
                    { documentCode: { $regex: word, $options: 'i' } },
                    { refNumber:   { $regex: word, $options: 'i' } },
                    { documentNameText: { $regex: word, $options: 'i' } },
                ],
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        // Stage 4: Sort and Paginate using $facet
        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.timeStamp': -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

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

export const getOutgoingForwardedDocuments = async (req, res) => {
    const { id } = req.params;
    const { searchQuery } = req.query; // added
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await global.docTrackModels.ManagerAccount.findById(id) ||
                     await global.docTrackModels.StaffAccount.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }

        const pipeline = [
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': 'Forwarded', 'lastAction.performedBy.userId': user._id } },
        ];

        // added: optional search filter
        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { documentName: { $regex: word, $options: 'i' } },
                    { documentCode: { $regex: word, $options: 'i' } },
                    { refNumber:   { $regex: word, $options: 'i' } },
                    { documentNameText: { $regex: word, $options: 'i' } },
                ],
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.timeStamp': -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.docTrackModels.DocumentLifeCycle.aggregate(pipeline);
        const relevantDocs = result[0].paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            success: true,
            message: 'Successfully fetched outgoing forwarded documents.',
            data: {
                relevantDocs,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error fetching outgoing forwarded documents:', error);
        return res.status(500).json({ success: false, message: 'Error fetching outgoing documents', error: error.message });
    }
};

export const getDocumentTypes = async (req, res) => {
    try {
        const docTypes = await global.docTrackModels.Document.find();
        return res.status(200).json({success: true, message: 'Successfully fetched document types.', data: docTypes });
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Error fetching document types.', error: error.message})
    }
};




// export const getDocumentHistory = async (req, res) => { //para sa history, lahat ng ginawa ni staff ngayong araw, not currently used.
//     const {id} = req.params;
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const user = await global.docTrackModels.ManagerAccount.findById(id) ||
//                      await global.docTrackModels.StaffAccount.findById(id);
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
//         }

//         // Define the start and end of today
//         const startOfToday = new Date();
//         startOfToday.setHours(0, 0, 0, 0);

//         const endOfToday = new Date();
//         endOfToday.setHours(23, 59, 59, 999);

//         const pipeline = [
//             {
//                 $match: {
//                     'lifeCycle': {
//                         $elemMatch: {
//                             'performedBy.userId': user._id,
//                             'timeStamp': {
//                                 $gte: startOfToday,
//                                 $lte: endOfToday
//                             }
//                         }
//                     }
//                 },
//             },
//             {
//                 $facet: {
//                     paginatedResults: [
//                         { $sort: {'lifeCycle.timeStamp': -1} },
//                         { $skip: skip },
//                         { $limit: limit }
//                     ],
//                     totalCount: [
//                         { $count: 'count' }
//                     ]
//                 }
//             }
//         ];

//         const result = await global.docTrackModels.DocumentLifeCycle.aggregate(pipeline);

//         const relevantDocs = result[0].paginatedResults;
//         const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

//         return res.status(200).json({
//             success: true,
//             message: 'Successfully fetched document history.',
//             data: {
//                 relevantDocs,
//                 totalCount,
//                 totalPages: Math.ceil(totalCount / limit),
//                 currentPage: page
//             }
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({success: false, message: 'Error fetching document history', error: error.message})
//     }
// };




export const getDocumentStatus = async (req, res) => { //check doc status, tatangapin na is buong qr data, need ng controller basahin lang yung ref number
    const { qrData, refNumber } = req.body;
    try {
        let number = qrData?.refNumber || refNumber;
        if (!number) {
            return res.status(400).json({success: false, message: "Invalid QR data."})
        }
        const document = await global.docTrackModels.DocumentLifeCycle.findOne({refNumber: number}) ||
                         await global.docTrackModels.ArchivedDocuments.findOne({refNumber: number}) ||
                         await global.docTrackModels.ReleasedDocuments.findOne({refNumber: number});

        if (!document) {
            return res.status(404).json({success: false, message: "Cannot find document with that reference number."})
        }

        return res.status(200).json({success: true, message: "Successfully found document.", data: document})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Failed to check document status."})
    }
};

export const getArchivedDocuments = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            // Use the last lifecycle entry; archived docs should end with "Archived"
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': 'Archived' } },
        ];

        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { refNumber: { $regex: word, $options: 'i' } },
                    { documentName: { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.first_name': { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.last_name': { $regex: word, $options: 'i' } },
                    // Match "First Last" combined
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$lastAction.performedBy.first_name', ' ', '$lastAction.performedBy.last_name'] },
                                regex: word,
                                options: 'i'
                            }
                        }
                    }
                ]
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.timeStamp': -1, _id: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.docTrackModels.ArchivedDocuments.aggregate(pipeline);
        const relevantDocs = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: 'Successfully fetched archived documents.',
            data: {
                relevantDocs,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error fetching archived documents:', error);
        return res.status(500).json({ success: false, message: 'Error fetching archived documents', error: error.message });
    }
};

export const unarchiveDocument = async (req, res) => {
    const { archivedDocId, userAccountId, forwardAccountId, unarchiveRemarks, forwardToSelf } = req.body;

    try {
        const archivedDocument = await global.docTrackModels.ArchivedDocuments.findById(archivedDocId);
        if (!archivedDocument) {
            return res.status(404).json({ success: false, message: 'Archived document not found.' });
        }

        const docLifeCycleColl = global.docTrackModels.DocumentLifeCycle.db.collection('document_life_cycles');

        const existingRestored = await global.docTrackModels.DocumentLifeCycle.findOne({ _id: archivedDocument._id });

        if (!existingRestored){
            await docLifeCycleColl.insertOne({...archivedDocument.toObject()});
        } else {
            return res.status(400).json({ success: false, message: 'Document with this ID already exists in active documents.' });
        };




        let user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                   await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';



        if (forwardToSelf === true) {
            await global.docTrackModels.DocumentLifeCycle.updateOne(
                {_id: archivedDocument._id},
                {
                    $push: {
                        lifeCycle: {
                            action: 'Unarchived',
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
                            userModel: userModel,
                            userId: user._id,
                            first_name: user.first_name,
                            last_name: user.lastName,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone,
                            forwardRemarks: unarchiveRemarks
                        },
                        timeStamp: Date.now()
                        }
                    },
                    $set: { currentHandler: { 
                            first_name: user.first_name,
                            last_name: user.last_name,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone
                        } },
                }
            );
        } else {
            let forwardAccount = await global.docTrackModels.ManagerAccount.findById(forwardAccountId) ||
                             await global.docTrackModels.StaffAccount.findById(forwardAccountId);
            if (!forwardAccount) {
                return res.status(404).json({ success: false, message: 'Cannot find the user you are trying to forward to.' });
            }
            const userForwardModel = forwardAccount instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

            await global.docTrackModels.DocumentLifeCycle.updateOne(
                {_id: archivedDocument._id},
                {
                    $push: {
                        lifeCycle: {
                            action: 'Unarchived',
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
                            userId: forwardAccount._id,
                            first_name: forwardAccount.first_name,
                            last_name: forwardAccount.lastName,
                            middle_name: forwardAccount.middle_name,
                            suffix: forwardAccount.suffix,
                            role: forwardAccount.role,
                            office_position: forwardAccount.office_position,
                            email: forwardAccount.email,
                            phone: forwardAccount.phone,
                            forwardRemarks: unarchiveRemarks
                        },
                        timeStamp: Date.now()
                        }
                    },
                    $set: { currentHandler: { 
                            first_name: forwardAccount.first_name,
                            last_name: forwardAccount.lastName,
                            middle_name: forwardAccount.middle_name,
                            suffix: forwardAccount.suffix,
                            role: forwardAccount.role,
                            office_position: forwardAccount.office_position,
                            email: forwardAccount.email,
                            phone: forwardAccount.phone
                        } },
                }
            )
        };
        await global.docTrackModels.ArchivedDocuments.findByIdAndDelete(archivedDocId);


        return res.status(200).json({ success: true, message: 'Document unarchived and forwarded successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error unarchiving document', error: error.message });
    }
};

export const unreleaseDocument = async (req, res) => {
    const { releasedDocId, userAccountId, forwardAccountId, unreleaseRemarks, forwardToSelf } = req.body;

    try {
        const releasedDocument = await global.docTrackModels.ReleasedDocuments.findById(releasedDocId);
        if (!releasedDocument) {
            return res.status(404).json({ success: false, message: 'Released document not found.' });
        }

        const docLifeCycleColl = global.docTrackModels.DocumentLifeCycle.db.collection('document_life_cycles');

        const existingRestored = await global.docTrackModels.DocumentLifeCycle.findById(releasedDocument._id);

        if (!existingRestored){
            await docLifeCycleColl.insertOne({...releasedDocument.toObject()});
        } else {
            return res.status(400).json({ success: false, message: 'Document with this ID already exists in active documents.' });
        };




        let user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                   await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';


        if (forwardToSelf === true) {
            await global.docTrackModels.DocumentLifeCycle.updateOne(
                {_id: releasedDocument._id},
                {
                    $push: {
                        lifeCycle: {
                            action: 'Unreleased',
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
                            userModel: userModel,
                            userId: user._id,
                            first_name: user.first_name,
                            last_name: user.lastName,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone,
                            forwardRemarks: unreleaseRemarks
                        },
                        timeStamp: Date.now()
                        }
                    },
                    $set: { currentHandler: { 
                            first_name: user.first_name,
                            last_name: user.last_name,
                            middle_name: user.middle_name,
                            suffix: user.suffix,
                            role: user.role,
                            office_position: user.office_position,
                            email: user.email,
                            phone: user.phone
                        } },
                }
            );
        } else {
            let forwardAccount = await global.docTrackModels.ManagerAccount.findById(forwardAccountId) ||
                                 await global.docTrackModels.StaffAccount.findById(forwardAccountId);
            if (!forwardAccount) {
                return res.status(404).json({ success: false, message: 'Cannot find the user you are trying to forward to.' });
            }
            const userForwardModel = forwardAccount instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

            await global.docTrackModels.DocumentLifeCycle.updateOne(
                {_id: releasedDocument._id},
                {
                    $push: {
                        lifeCycle: {
                            action: 'Unreleased',
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
                            userId: forwardAccount._id,
                            first_name: forwardAccount.first_name,
                            last_name: forwardAccount.lastName,
                            middle_name: forwardAccount.middle_name,
                            suffix: forwardAccount.suffix,
                            role: forwardAccount.role,
                            office_position: forwardAccount.office_position,
                            email: forwardAccount.email,
                            phone: forwardAccount.phone,
                            forwardRemarks: unreleaseRemarks
                        },
                        timeStamp: Date.now()
                        }
                    },
                    $set: { currentHandler: { 
                            first_name: forwardAccount.first_name,
                            last_name: forwardAccount.lastName,
                            middle_name: forwardAccount.middle_name,
                            suffix: forwardAccount.suffix,
                            role: forwardAccount.role,
                            office_position: forwardAccount.office_position,
                            email: forwardAccount.email,
                            phone: forwardAccount.phone
                        } },
                }
            )
        };
        await global.docTrackModels.ReleasedDocuments.findByIdAndDelete(releasedDocId);


        return res.status(200).json({ success: true, message: 'Document unreleased and forwarded successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error unrelease document', error: error.message });
    }
};
;
export const getUsersDocumentWorkload = async (req, res) => {
    try {
        

        // 1. Fetch all active accounts
        const projection = {
            first_name: 1,
            last_name: 1,
            middle_name: 1,
            suffix: 1,
            role: 1,
            office_position: 1
        };
        const [managers, staffs] = await Promise.all([
            global.docTrackModels.ManagerAccount.find({}, projection).lean(),
            global.docTrackModels.StaffAccount.find({}, projection).lean()
        ]);

        const allAccounts = [
            ...managers.map(a => ({ ...a, accountModel: 'Manager_Account' })),
            ...staffs.map(a => ({ ...a, accountModel: 'Staff_Account' }))
        ];

        if (allAccounts.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 2. Aggregation for incoming (Forwarded/Rerouted to user)
        const incomingPipeline = [
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': { $in: ['Forwarded', 'Rerouted', 'Unarchived', 'Unreleased'] } } },
            {
                $addFields: {
                    targetUserId: {
                        $cond: [
                            { $eq: ['$lastAction.action', 'Rerouted'] },
                                '$lastAction.rerouteDetails.userId',
                                '$lastAction.forwardDetails.userId',
                        ]
                    }
                }
            },
            { $sort: { 'lastAction.timeStamp': -1 } },
            {
                $group: {
                    _id: '$targetUserId',
                    count: { $sum: 1 },
                    documents: {
                        $push: {
                            _id: '$_id',
                            refNumber: '$refNumber',
                            documentName: '$documentName',
                            documentCode: '$documentCode',
                            documentNameText: '$documentNameText'
                        }
                    }
                }
            }
        ];

        // 3. Aggregation for pending (Received/Work on Progress performed by user)
        const pendingPipeline = [
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': 'Received/Work on Progress' } },
            { $sort: { 'lastAction.timeStamp': -1 } },
            {
                $group: {
                    _id: '$lastAction.performedBy.userId',
                    count: { $sum: 1 },
                    documents: {
                        $push: {
                            _id: '$_id',
                            refNumber: '$refNumber',
                            documentName: '$documentName',
                            documentCode: '$documentCode',
                            documentNameText: '$documentNameText'
                        }
                    }
                }
            },
        ];

        const [incomingAgg, pendingAgg] = await Promise.all([
            global.docTrackModels.DocumentLifeCycle.aggregate(incomingPipeline),
            global.docTrackModels.DocumentLifeCycle.aggregate(pendingPipeline)
        ]);

        const incomingMap = new Map(incomingAgg.map(r => [String(r._id), r]));
        const pendingMap = new Map(pendingAgg.map(r => [String(r._id), r]));

        // 4. Merge into account list
        const result = allAccounts
            .map(acc => {
                const key = String(acc._id);
                const incoming = incomingMap.get(key) || { count: 0, documents: [] };
                const pending = pendingMap.get(key) || { count: 0, documents: [] };
                return {
                    userId: acc._id,
                    accountModel: acc.accountModel,
                    first_name: acc.first_name,
                    last_name: acc.last_name,
                    middle_name: acc.middle_name,
                    suffix: acc.suffix,
                    role: acc.role,
                    office_position: acc.office_position,
                    incoming,
                    pending,
                    totalActive: incoming.count + pending.count
                };
            })
            .sort((a, b) => b.totalActive - a.totalActive || a.last_name.localeCompare(b.last_name));

        return res.status(200).json({
            success: true,
            message: 'Successfully compiled users document workload.',
            data: result
        });
    } catch (error) {
        console.error('Error computing users document workload:', error);
        return res.status(500).json({ success: false, message: 'Error computing workload', error: error.message });
    }
};

export const rerouteDocument = async (req, res) => {
    const { registeredDocId, userAccountId, rerouteAccountId, rerouteRemarks, rerouteToSelf } = req.body;

    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findById(registeredDocId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Registered document not found.' });
        }

        const user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                   await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        
        if (rerouteToSelf === true) {
            await global.docTrackModels.DocumentLifeCycle.updateOne(
                {_id: document._id},
                {
                    $push: {
                        lifeCycle: {
                            action: 'Rerouted',
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
                            rerouteDetails: {
                                userModel: userModel,
                                userId: user._id,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                middle_name: user.middle_name,
                                suffix: user.suffix,
                                role: user.role,
                                office_position: user.office_position,
                                email: user.email,
                                phone: user.phone,
                                rerouteRemarks: rerouteRemarks
                            },
                            timeStamp: Date.now(),
                        }
                    },
                    $set: { currentHandler: { 
                        first_name: user.first_name,
                        last_name: user.last_name,
                        middle_name: user.middle_name,
                        suffix: user.suffix,
                        role: user.role,
                        office_position: user.office_position,
                        email: user.email,
                        phone: user.phone
                    } }
                }
            );
        } else {
            const rerouteAccount = await global.docTrackModels.ManagerAccount.findById(rerouteAccountId) ||
                                   await global.docTrackModels.StaffAccount.findById(rerouteAccountId);
            if (!rerouteAccount) {
                return res.status(404).json({ success: false, message: 'Cannot find the user you are trying to reroute to.' });
            }
            const rerouteAccountModel = rerouteAccount instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';
            await global.docTrackModels.DocumentLifeCycle.updateOne(
                {_id: document._id},
                {
                    $push: {
                        lifeCycle: {
                            action: 'Rerouted',
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
                            rerouteDetails: {
                                userModel: rerouteAccountModel,
                                userId: rerouteAccount._id,
                                first_name: rerouteAccount.first_name,
                                last_name: rerouteAccount.lastName,
                                middle_name: rerouteAccount.middle_name,
                                suffix: rerouteAccount.suffix,
                                role: rerouteAccount.role,
                                office_position: rerouteAccount.office_position,
                                email: rerouteAccount.email,
                                phone: rerouteAccount.phone,
                                rerouteRemarks: rerouteRemarks
                            },
                            timeStamp: Date.now(),
                        }
                    },
                    $set: { currentHandler: { 
                            first_name: rerouteAccount.first_name,
                            last_name: rerouteAccount.lastName,
                            middle_name: rerouteAccount.middle_name,
                            suffix: rerouteAccount.suffix,
                            role: rerouteAccount.role,
                            office_position: rerouteAccount.office_position,
                            email: rerouteAccount.email,
                            phone: rerouteAccount.phone
                        } }
                }
            );
        }

        return res.status(200).json({ success: true, message: 'Document rerouted successfully' });
    } catch (error) {
        console.error('Error rerouting document:', error);
        return res.status(500).json({ success: false, message: 'Error rerouting document', error: error.message });
    }
};

export const getTotalIncomingDocuments = async (req, res) => { //para sa totallity ng incoming documents (registered documents) sa dashboard (includes lahat ng docs sa docLifeCycle collection)
    const {searchQuery} = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const pipeline = [
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', 0] } } },
            {
                $match: { 'lastAction.action': 'Document Created' }
            }
        ];

        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { documentName: { $regex: word, $options: 'i' } },
                    { documentCode: { $regex: word, $options: 'i' } },
                    { refNumber:   { $regex: word, $options: 'i' } },
                    { documentNameText: { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.first_name': { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.last_name': { $regex: word, $options: 'i' } },
                    // Match "First Last" combined
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$lastAction.performedBy.first_name', ' ', '$lastAction.performedBy.last_name'] },
                                regex: word,
                                options: 'i'
                            }
                        }
                    }
                ],
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.timeStamp': -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        })

        const result = await global.docTrackModels.DocumentLifeCycle.aggregate(pipeline);
        const relevantDocs = result[0]?.paginatedResults;
        const totalCount = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            success: true,
            message: 'Total incoming documents fetched successfully',
            data: {
                relevantDocs,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error fetching total incoming documents:', error);
        return res.status(500).json({success: false, message: 'Error fetching all registered documents', error: error.message});
    }
};

export const getReleasedDocuments = async (req, res) => { //get outgoing documents
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            // Use the last lifecycle entry; archived docs should end with "Archived"
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': 'Released' } },
        ];

        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { documentName: { $regex: word, $options: 'i' } },
                    { documentCode: { $regex: word, $options: 'i' } },
                    { refNumber:   { $regex: word, $options: 'i' } },
                    { documentNameText: { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.first_name': { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.last_name': { $regex: word, $options: 'i' } },
                    // Match "First Last" combined
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$lastAction.performedBy.first_name', ' ', '$lastAction.performedBy.last_name'] },
                                regex: word,
                                options: 'i'
                            }
                        }
                    }
                ]
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.timeStamp': -1, _id: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.docTrackModels.ReleasedDocuments.aggregate(pipeline);
        const relevantDocs = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: 'Successfully fetched released documents.',
            data: {
                relevantDocs,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error fetching archived documents:', error);
        return res.status(500).json({ success: false, message: 'Error fetching archived documents', error: error.message });
    }
};

export const getExpiredDocuments = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // End of today to include "equivalent to today"
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const pipeline = [
            // Use the last lifecycle entry (should be Archived)
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            {
                $match: {
                    'lastAction.action': 'Archived',
                    'lastAction.archivalDetails.retentionUntil': { $ne: null, $lte: endOfToday }
                }
            }
        ];

        // Optional search filter across common fields
        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { refNumber: { $regex: word, $options: 'i' } },
                    { documentName: { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.first_name': { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.last_name': { $regex: word, $options: 'i' } },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$lastAction.performedBy.first_name', ' ', '$lastAction.performedBy.last_name'] },
                                regex: word,
                                options: 'i'
                            }
                        }
                    }
                ]
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.archivalDetails.retentionUntil': 1, _id: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.docTrackModels.ArchivedDocuments.aggregate(pipeline);
        const relevantDocs = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: 'Successfully fetched expired archived documents.',
            data: {
                relevantDocs,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error fetching expired archived documents:', error);
        return res.status(500).json({ success: false, message: 'Error fetching expired archived documents', error: error.message });
    }
};

export const disposeDocuments = async (req, res) => {
    const { archivedDocId, userAccountId, disposalRemarks } = req.body;

    try {
        const archivedDocument = await global.docTrackModels.ArchivedDocuments.findById(archivedDocId);
        if (!archivedDocument) {
            return res.status(404).json({ success: false, message: 'Archived document not found.' });
        }

        const user = await global.docTrackModels.ManagerAccount.findById(userAccountId) ||
                     await global.docTrackModels.StaffAccount.findById(userAccountId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Cannot find your account, please contact IT if error persists.' });
        }
        const userModel = user instanceof global.docTrackModels.ManagerAccount ? 'Manager_Account' : 'Staff_Account';

        const updatedArchived = await global.docTrackModels.ArchivedDocuments.findOneAndUpdate(
            { _id: archivedDocument._id },
            {
                $push: {
                    lifeCycle: {
                        action: 'Disposed',
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
                        disposalDetails: {
                            disposedDate: new Date(),
                            disposalRemarks: disposalRemarks
                        },
                        timeStamp: Date.now()
                    }
                },
                $set: { currentHandler: null }
            },
            { new: true } //need kasi deafault update ang binabalik luma prang ewan, kaya dapat new para ang ibalik is yung bagong update.
        );

        const disposedColl = global.docTrackModels.DisposedDocuments.db.collection('disposed_documents');
        await disposedColl.insertOne({ ...updatedArchived.toObject() });

        await global.docTrackModels.ArchivedDocuments.findByIdAndDelete(archivedDocId);

        return res.status(200).json({ success: true, message: 'Document disposed successfully.' });
    } catch (error) {
        console.error('Error disposing document:', error);
        return res.status(500).json({ success: false, message: 'Error disposing document', error: error.message });
    }
};

export const deleteRegisteredDocument = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await global.docTrackModels.DocumentLifeCycle.findById(id);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Registered document not found.' });
        }

        await global.docTrackModels.DocumentLifeCycle.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({ success: false, message: 'Error deleting document', error: error.message });
    }
};

export const getSectionDocumentCount = async (req, res) => {
    try {
        const SECTIONS = ['CFS', 'LPMS', 'ANMS', 'RTSS'];

        // 1) Load account ids by category
        const [managers, staffs] = await Promise.all([
            global.docTrackModels.ManagerAccount.find({}, { _id: 1 }).lean(),
            global.docTrackModels.StaffAccount.find(
                { office_position: { $in: SECTIONS } },
                { _id: 1, office_position: 1 }
            ).lean()
        ]);

        const managerIds = managers.map(m => m._id);

        const staffIdsByPos = SECTIONS.reduce((acc, pos) => {
            acc[pos] = staffs.filter(s => (s.office_position || '').toUpperCase() === pos).map(s => s._id);
            return acc;
        }, { CFS: [], LPMS: [], ANMS: [], RTSS: [] });

        // Helper to build $switch branches only when arrays have members
        const makeBranches = (fieldExpr) => ([
            ...(managerIds.length ? [{ case: { $in: [fieldExpr, managerIds] }, then: 'managers' }] : []),
            ...(staffIdsByPos.CFS.length ? [{ case: { $in: [fieldExpr, staffIdsByPos.CFS] }, then: 'CFS' }] : []),
            ...(staffIdsByPos.LPMS.length ? [{ case: { $in: [fieldExpr, staffIdsByPos.LPMS] }, then: 'LPMS' }] : []),
            ...(staffIdsByPos.ANMS.length ? [{ case: { $in: [fieldExpr, staffIdsByPos.ANMS] }, then: 'ANMS' }] : []),
            ...(staffIdsByPos.RTSS.length ? [{ case: { $in: [fieldExpr, staffIdsByPos.RTSS] }, then: 'RTSS' }] : []),
        ]);

        // 2) Incoming counts (Forwarded/Rerouted/Unarchived/Unreleased to a target user)
        const incomingPipeline = [
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': { $in: ['Forwarded', 'Rerouted', 'Unarchived', 'Unreleased'] } } },
            {
                $addFields: {
                    targetUserId: {
                        $cond: [
                            { $eq: ['$lastAction.action', 'Rerouted'] },
                            '$lastAction.rerouteDetails.userId',
                            '$lastAction.forwardDetails.userId'
                        ]
                    }
                }
            },
            {
                $addFields: {
                    category: {
                        $switch: {
                            branches: makeBranches('$targetUserId'),
                            default: null
                        }
                    }
                }
            },
            { $match: { category: { $ne: null } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ];

        // 3) Pending counts (Received/Work on Progress by user)
        const pendingPipeline = [
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': 'Received/Work on Progress' } },
            {
                $addFields: {
                    category: {
                        $switch: {
                            branches: makeBranches('$lastAction.performedBy.userId'),
                            default: null
                        }
                    }
                }
            },
            { $match: { category: { $ne: null } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ];

        const [incomingAgg, pendingAgg] = await Promise.all([
            global.docTrackModels.DocumentLifeCycle.aggregate(incomingPipeline),
            global.docTrackModels.DocumentLifeCycle.aggregate(pendingPipeline)
        ]);

        const toMap = (arr) => Object.fromEntries(arr.map(r => [r._id, r.count]));
        const incomingMap = toMap(incomingAgg);
        const pendingMap = toMap(pendingAgg);

        const categories = ['managers', ...SECTIONS];
        const sections = {};
        for (const cat of categories) {
            const incoming = incomingMap[cat] || 0;
            const pending = pendingMap[cat] || 0;
            sections[cat] = { incoming, pending, totalActive: incoming + pending };
        }

        const totals = Object.values(sections).reduce(
            (acc, s) => ({
                incoming: acc.incoming + s.incoming,
                pending: acc.pending + s.pending,
                totalActive: acc.totalActive + s.totalActive
            }),
            { incoming: 0, pending: 0, totalActive: 0 }
        );

        return res.status(200).json({
            success: true,
            message: 'Section document counts fetched successfully.',
            data: { sections, totals }
        });
    } catch (error) {
        console.error('Error fetching section document counts:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching section document counts',
            error: error.message
        });
    }
};

export const getDisposedDocuments = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            // Use the last lifecycle entry; archived docs should end with "Archived"
            { $addFields: { lastAction: { $arrayElemAt: ['$lifeCycle', -1] } } },
            { $match: { 'lastAction.action': 'Disposed' } },
        ];

        if (searchQuery && searchQuery.trim() !== '') {
            const words = searchQuery.trim().split(/\s+/);
            const searchConditions = words.map((word) => ({
                $or: [
                    { documentName: { $regex: word, $options: 'i' } },
                    { documentCode: { $regex: word, $options: 'i' } },
                    { refNumber:   { $regex: word, $options: 'i' } },
                    { documentNameText: { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.first_name': { $regex: word, $options: 'i' } },
                    { 'lastAction.performedBy.last_name': { $regex: word, $options: 'i' } },
                    // Match "First Last" combined
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$lastAction.performedBy.first_name', ' ', '$lastAction.performedBy.last_name'] },
                                regex: word,
                                options: 'i'
                            }
                        }
                    }
                ]
            }));
            pipeline.push({ $match: { $and: searchConditions } });
        }

        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { 'lastAction.timeStamp': -1, _id: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await global.docTrackModels.DisposedDocuments.aggregate(pipeline);
        const relevantDocs = result[0]?.paginatedResults || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: 'Successfully fetched diposed documents.',
            data: {
                relevantDocs,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error fetching disposed documents:', error);
        return res.status(500).json({ success: false, message: 'Error fetching disposed documents', error: error.message });
    }
}; 


