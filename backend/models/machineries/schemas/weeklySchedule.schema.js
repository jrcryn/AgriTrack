import mongoose from 'mongoose';

const tr = new mongoose.Schema({
    tr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket_Request',
        required: true
    },
    assignedDay: { type: Date, required: true }
})

export const WeeklyScheduleSchema = new mongoose.Schema({
    weekStart: {type: Date, required: true},
    weekEnd: {type: Date, required: true},
    ticketRequests: [tr],

    status: {type: String, required: true, enum: ['Planned', 'In Progress', 'Completed']},

}, { versionKey: false }, { timestamps: true });

// problem: 