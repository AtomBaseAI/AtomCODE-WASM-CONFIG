import { db } from "@/lib/db";

export const getAllStudents = () => {
    try {
        const students = db.user.findMany()
        return students
    }
    catch {
        return null
    }
}
export const getStudentById = async (id: string) => {
    try {
        const student = await db.user.findUnique({ where: { id } })
        return student
    }
    catch {
        return null
    }
}
export const getStudentsCount = () => {
    try {
        const scount = db.user.count()
        return scount
    }
    catch {
        return null
    }
}


