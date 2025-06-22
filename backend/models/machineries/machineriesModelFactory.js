import { getMachineriesDB } from "../../config/dbAccessHelper.js";

import { MachineriesUnitSchema } from "./schemas/machineriesUnit.schema.js";
import { MachineriesStaffSchema } from "./schemas/machineriesStaffAccount.schema.js";

export const initializeMachineriesModels = () => {
    const db = getMachineriesDB();

    return {
        MachineriesUnit: db.model("Machineries_Unit", MachineriesUnitSchema),
        StaffAccount: db.model("Staff_Account", MachineriesStaffSchema)
    }
};