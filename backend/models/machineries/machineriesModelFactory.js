import { getMachineriesDB } from "../../config/dbAccessHelper.js";

import { MachineriesTypeSchema } from "./schemas/machineriesType.schema.js";
import { MachineriesUnitSchema } from "./schemas/machineriesUnit.schema.js";
import { ticketRequestSchema } from "./schemas/ticketRequest.schema.js"
import { extensionTicketSchema } from "./schemas/ticketRequest.schema.js";
import { WeeklyScheduleSchema } from "./schemas/weeklySchedule.schema.js";
import { tripTicketSchema } from "./schemas/tripTicket.schema.js";
import { FormStatus } from "./schemas/formStatus.js";
import { trCounterSchema } from "./schemas/trCounter.schema.js";
import { sCounterSchema } from "./schemas/sCounter.schema.js";
import { ArchivedTicketRequestSchema } from "./schemas/archivedTickets.schema.js";
import { IncidentReportSchema } from "./schemas/incidentReport.schema.js";

export const initializeMachineriesModels = () => {
    const db = getMachineriesDB();

    return {
        MachineriesType: db.model("Machine_Type", MachineriesTypeSchema),
        MachineriesUnit: db.model("Machine_Unit", MachineriesUnitSchema),

        TicketRequest: db.model("Ticket_Request", ticketRequestSchema),
        ExtensionTicket: db.model("Extension_Ticket", extensionTicketSchema),

        WeeklySchedule: db.model("Weekly_Schedule", WeeklyScheduleSchema),
        TripTicket: db.model("Trip_Ticket", tripTicketSchema),
        FormStatus: db.model('FormStatus', FormStatus),
        TRCounter: db.model('trCounter', trCounterSchema),
        SCounter: db.model('sCounter', sCounterSchema),
        ArchivedTicketRequest: db.model('Archived_Ticket_Request', ArchivedTicketRequestSchema),
        IncidentReport: db.model('Incident_Report', IncidentReportSchema)
    }
};