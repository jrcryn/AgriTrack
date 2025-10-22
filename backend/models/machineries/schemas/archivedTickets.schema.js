import mongoose from 'mongoose';

export const ArchivedTicketRequestSchema = new mongoose.Schema({
      requestorFarmer: {
          requestorFarmerId: { 
              type: mongoose.Schema.Types.ObjectId, 
              ref: 'Farmer_Account',
              required: true
          },
          farmerId: String,
          surname: String,
          first_name: String,
          middle_name: String,
          suffix: String,
      },
      requestedMachineType: {
          requestedMachineTypeId: { 
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Machine_Type',
              required: true
          },
          ownerName: String,
          ownerType: String,
          equipmentType: String,
          ratedCapacity: String
      },
      
      refNumber: { type: String, required: true, unique: true },
      barangay: {type: String, required: true},
      estimatedArea: { type: Number, required: true},
      dateRequested: {type: Date, required: true},

      declinedBy: {
          employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee_Account', required: true },
          first_name: String,
          last_name: String,
          middle_name: String,
          suffix: String,
          email: String,
          phone: String
      },

      archivedBy: {
          employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee_Account', required: true },
          first_name: String,
          last_name: String,
          middle_name: String,
          suffix: String,
          email: String,
          phone: String
      }
});
