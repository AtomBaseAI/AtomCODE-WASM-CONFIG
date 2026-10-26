import { db } from "@/lib/db";

export const getAllReferencesByModuleId = async (id: string) => {
    try {
        const referencedata = await db.moduleReferences.findMany({
            where: { moduleId: id }
        })
        return referencedata
    }
    catch {
        return null
    }
}