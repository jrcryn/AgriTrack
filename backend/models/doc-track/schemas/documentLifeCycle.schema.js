import mongoose from 'mongoose';

const lifeCycleIterationsSchema = new mongoose.Schema({
    action: { 
        type: String,
        enum: ['Document Created', 'Forwarded', 'Received', 'Work on Progress', 'Finalized'],
        required: true
    },
    status: {
        type: String,
        enum: ['Incoming', 'Pending', 'Outgoing', 'Archived', 'Released'],
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ['Staff_Account', 'Manager_Account'],
        required: true
    },
    remarks: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
    forwardDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ['Staff_Account', 'Manager_Account'],
        required: true
    },

    //finalized actions
    archivalDetails: {

    },
    releaseDetails: {
        recipientOffice: String,
        recipientPerson: String,
        modeOfRelease: String, // pick up, email, courier, etc
    }
});

export const documentLifeCycleSchema = new mongoose.Schema({
    
});