import mongoose from 'mongoose';

export const IncidentReportSchema = new mongoose.Schema({
    machineryUnitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
        required: true
    },
    machineryTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Type',
        required: true
    },

    ticketRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket_Request',
        required: false
    },
    incidentType: {
        type: String,
        required: true,
        enum: ['Mechanical Failure', 'Electrical Failure', 'Hydraulic/Pneumatic Failure', 'Flat Tire or Track Issue', 'Machine Overheating', 'Fuel System Issue']
    },
    description: {
        type: String,
        required: true
    },

    // location: {
    //     type: String,
    //     required: true
    // },
    // dateTime: {
    //     type: Date,
    //     required: true
    // },

    // machineStatusAfter: {
    //     type: String,
    //     required: true,
    //     enum: ['Available', 'In Use', 'Under Repair', 'Retired', 'Not for Use']
    // },
    
    //yung machine status and condition after the incident, sa misning machineries unit schema na

    // adminAssessment: {
    //     type: String
    // },

    assignedOperator: {
        operatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee_Account',
            required: true
        },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Declined', 'Resolved'],
        default: 'Pending'
    }
}, { versionKey: false, timestamps: true });

