import { getMachineriesDB } from "../../config/dbAccessHelper.js";

import { MachineriesTypeSchema } from "./schemas/machineriesType.schema.js";
import { MachineriesAdminSchema } from "./schemas/machineriesAdminAccount.schema.js";
import { MachineriesStaffSchema } from "./schemas/machineriesStaffAccount.schema.js";

export const initializeMachineriesModels = () => {
    const db = getMachineriesDB();

    return {
        MachineriesType: db.model("Machine_Type", MachineriesTypeSchema),
        ManagerAccount: db.model("Admin_Account", MachineriesAdminSchema),
        StaffAccount: db.model("Staff_Account", MachineriesStaffSchema)
    }
};