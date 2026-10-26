import { db } from "@/lib/db";
export const getModuleMCQsByModuleId = async (id: string) => {
    try {
        const moduleWithMCQs = await db.module.findUnique({
            where: { id },
            include: { mcqQuestions: true }
        });

        if (moduleWithMCQs) {
            return moduleWithMCQs.mcqQuestions;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching module MCQs:", error);
        return null;
    }
};
export const getAssessmentMCQsByAssessmentId = async (id: string) => {
    try {
        const assessmentWithMCQs = await db.assessments.findUnique({
            where: { id },
            include: { mcqQuestions: true }
        });

        if (assessmentWithMCQs) {
            return assessmentWithMCQs.mcqQuestions;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching assessment MCQs:", error);
        return null;
    }
};
export const getMCQById = async (id: string) => {
    try {
        const question = await db.mCQQuestion.findUnique({ where: { id } })
        return question
    }
    catch {
        return null
    }
}