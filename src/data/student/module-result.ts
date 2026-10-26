import { db } from "@/lib/db";

export const getUserModuleResultByUserIdCourseIdModuleId = async (userId: string, courseId: string, moduleId: string) => {
    try {
        const userModuleData = await db.userModuleData.findFirst({
            where: {
                userId: userId,
                courseId: courseId,
                moduleId: moduleId
            }
        });
        if (userModuleData) {
            return userModuleData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching UserModuleData:", error);
        return null;
    }
};



export const getUserModuleResultByUserIdCourseId = async (userId: string, courseId: string) => {
    try {
        const userModulesData = await db.userModuleData.findMany({
            where: {
                userId: userId,
                courseId: courseId
            }
        });
        if (userModulesData) {
            return userModulesData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching UserModuleData:", error);
        return null;
    }
};


