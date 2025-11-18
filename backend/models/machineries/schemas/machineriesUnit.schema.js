import mongoose from 'mongoose';

// Status History sub-schema
const StatusHistorySchema = new mongoose.Schema({
    status: { 
        type: String, 
        required: true, 
        enum: ['Available', 'In Use', 'Under Repair', 'Retired', 'Not for Use']
    },
    condition: {
        type: String,
        required: true,
        enum: ['Functional', 'Non-Functional']
    },
    reason: { type: String }, // Why status changed
    changedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee_Account',
        first_name: { type: String, required: true },
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String, 
    },
    changedAt: { type: Date, default: Date.now },
    repairCost: { type: Number }, // For repairs
    retirementReason: { type: String } // For retired machines
}, { _id: false, versionKey: false });

export const MachineriesUnitSchema = new mongoose.Schema({
    machineryTypeId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Type',
        required: true
    },
    unitNumber: {type: String, required: true},
    engineBrand: {type: String},
    engineHorsepower: {type: String, required: true},
    modeOfAcquisition: {type: String, required: true},
    costOfAcquisition: {type: String},
    yearAcquired: { type: String, required: true},
    
    // Current Status
    condition: { 
        type: String, 
        required: true, 
        enum: ['Functional', 'Non-Functional'], 
        default: 'Functional' 
    },
    location: { 
        type: String, 
        required: true, 
        default: 'Office/The Plaza'
    },
    remarks: { type: String },
    status: { 
        type: String, 
        required: true, 
        enum: ['Available', 'In Use', 'Under Repair', 'Retired', 'Not for Use'],
        default: 'Available'
    },
    
    // Add retirement tracking
    isRetired: { type: Boolean, default: false },
    retiredDate: { type: Date },
    
    // Status History
    statusHistory: [StatusHistorySchema],
    
    // Maintenance tracking
    lastMaintenanceDate: { type: Date },
    nextMaintenanceDate: { type: Date },
    totalRepairCost: { type: Number, default: 0 },
    totalDowntime: { type: Number, default: 0 } // in hours
    
}, { versionKey: false, timestamps: true });

// Add index for better query performance
MachineriesUnitSchema.index({ status: 1, condition: 1 });
MachineriesUnitSchema.index({ isRetired: 1 });