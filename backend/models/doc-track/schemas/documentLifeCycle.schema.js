import mongoose from 'mongoose';

export const lifeCycleIterationsSchema = new mongoose.Schema({
    action: { 
        type: String,
        enum: ['Document Created', 'Forwarded', 'Received/Work on Progress', 'Archived', 'Finalized'],
        required: true
    },

    performedBy: { // hindi lang sya naka reference kay Staff_Account or Manager_Account for historical accuracy
        userModel: { type: String, enum: ['Staff_Account', 'Manager_Account'] },
        userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'performedBy.userModel' },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        role: String,
        office_position: String,
        email: String,
        phone: String
    },

    forwardDetails: { // same goes here
        userModel: { type: String, enum: ['Staff_Account', 'Manager_Account'] },
        userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'forwardDetails.userModel' },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        role: String,
        office_position: String,
        email: String,
        phone: String,
        forwardRemarks: String,
    },

    //finalized actions
    archivalDetails: { //same goes here
        disposalMethod: String,
        retentionPeriod: Number,

        //sa mismong archival date magkakaroon ng info based sa active and retention period
        retentionUntil: Date,
        medium: String,
        location: String,
        archiveRemarks: String
    },
    releaseDetails: {
        recipientOffice: String,
        recipientPerson: String,
        modeOfRelease: String, // pick up, email, courier, etc
        releaseRemarks: String,
    },

    timeStamp: {
        type: Date,
        default: Date.now,
    },
}, {_id: false});

export const DocumentLifeCycleSchema = new mongoose.Schema({
    documentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Document'},
    documentName: {type: String, required: true},
    documentCode: {type: String, required: true},

    priority: {type: String, enum: ['Urgent', 'Medium', 'Low'], required: true},
    refNumber: {type: String, required: true},
    docQRData: {type: String, required: true},
    remarks: String,

    lifeCycle: [lifeCycleIterationsSchema],

    currentHandler: { //for forwarding lang, not indicative of actual current handler kung hindi pa na re-receive
        userModel: { type: String, enum: ['Staff_Account', 'Manager_Account'] },
        userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'currentHandler.userModel' },
    }
}, {versionKey: false});