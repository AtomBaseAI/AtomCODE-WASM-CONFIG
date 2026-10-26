import { db } from "@/lib/db";

export const getAllStaffs = () => {
    try {
        const staffs = db.staff.findMany()
        return staffs
    }
    catch {
        return null
    }
}
export const getStaffById = async (id: string) => {
    try {
        const staff = await db.staff.findUnique({ where: { id } })
        return staff
    }
    catch {
        return null
    }
}
export const getStaffsCount = () => {
    try {
        const stfcount = db.staff.count()
        return stfcount
    }
    catch {
        return null
    }
}
export const getStaffByEmail= async (email: string) => {
    try {
        const staff = await db.staff.findUnique({ where: { email } })
        return staff
    }
    catch {
        return null
    }
}


