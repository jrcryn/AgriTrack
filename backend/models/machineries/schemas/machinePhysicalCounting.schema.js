import mongoose from 'mongoose';

export const MachinePhysicalCountingSchema = new mongoose.Schema({
    machineUnits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
        required: true
    }],
    notFoundMachineUnits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
        required: true
    }],
    countingDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    discrepancyFound: {
        type: String,
        enum: ['Discrepancy Found', 'No Discrepancy Found', 'Resolved'],
    },
    assignedEmployee: {
        employeeId: {
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
    remarks: { type: String },
    resolveRemarks: { type: String },
}, { versionKey: false, timestamps: true });

// Add index for better query performance on counting date
MachinePhysicalCountingSchema.index({ countingDate: 1 });

