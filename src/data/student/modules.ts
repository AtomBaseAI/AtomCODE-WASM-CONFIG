import { db } from "@/lib/db";

export const getAllModulesByCourseId = async (id: string) => {
    try {
        const modulesdata = await db.module.findMany({
            where: {
                courseId: id,
                modulestatus: "active",
            },
            select: {
                id: true,
                title: true,
                modulestatus: true,
                moduledate: true,
                maxscore: true,
                concepturl: true,
                _count: {
                    select: {
                        codeQuestions: true,
                        mcqQuestions: true,
                    },
                },
                reference: {
                    select: {
                        title: true,
                        link: true,
                        type: true,
                    },
                },
            },
        });

        const modules = modulesdata.map(module => ({
            id: module.id,
            title: module.title,
            modulestatus: module.modulestatus,
            moduledate: module.moduledate,
            concepturl: module.concepturl,
            maxscore: module.maxscore,
            questionscount: module._count.codeQuestions,
            mcqcount: module._count.mcqQuestions,
            modulereference: module.reference,
        }));

        return modules;
    } catch {
        return null;
    }
};
export const getModuleById = async (id: string) => {
    try {
        const modulex = await db.module.findUnique({ where: { id } })
        return modulex
    }
    catch {
        return null
    }
}

export const getModuleQuestionsByModuleId = async (id: string, uid: string) => {
    try {
        const moduleWithQuestions = await db.module.findUnique({
            where: { id },
            include: { codeQuestions: true },
        });

        if (!moduleWithQuestions) {
            return null;
        }

        const userCodeQuestionData = await db.userCodeQuestionData.findMany({
            where: {
                moduleId: id,
                userId: uid,
                status: 'submitted',
            },
        });

        const availableQuestionIds = new Set(userCodeQuestionData.map(qd => qd.questionId));

        const questionsWithStatus = moduleWithQuestions.codeQuestions.map((question) => ({
            ...question,
            submissionstatus: availableQuestionIds.has(question.id),
        }));

        return questionsWithStatus;
    } catch (error) {
        console.error("Error fetching module questions with status:", error);
        return null;
    }
};



export const getCourseModuleByModuleID = async (moduleId: string) => {
    try {
        const moduleData = await db.module.findUnique({
            where: { id: moduleId },
            select: {
                title: true,
                course: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        if (!moduleData) {
            return null;
        }

        return {
            courseName: moduleData.course.title,
            moduleName: moduleData.title,
        };
    } catch (error) {
        console.error("Error fetching module data:", error);
        return null;
    }
};
export const getQuestionIdsByModuleId = async (id: string) => {
    try {
        const questions = await db.module.findMany({
            where: { id },
            select: { codeQuestions: { select: { id: true } } },
        });

        if (questions && questions.length > 0) {
            const questionIds = questions.flatMap((module) => module.codeQuestions.map((q) => q.id));
            return questionIds;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching question IDs:", error);
        return [];
    }
};
