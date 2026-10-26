import { db } from "@/lib/db";

export const getAllMCQByModuleId = async (moduleId: string) => {
    try {
        const mcqs = await db.mCQQuestion.findMany({
            where: { moduleId }
        });

        return mcqs;
    } catch (error) {
        console.error("Error fetching MCQs by module ID:", error);
        return [];
    }
};

export const getMCQCountByModuleId = async (moduleId: string) => {
    try {
        const count = await db.mCQQuestion.count({
            where: { moduleId }
        });

        return count;
    } catch (error) {
        console.error("Error counting MCQs by module ID:", error);
        return 0;
    }
};
