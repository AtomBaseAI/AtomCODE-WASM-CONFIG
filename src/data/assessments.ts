
import { db } from "@/lib/db";
import { formatTime, formatTime12 } from "@/lib/utils";

export const getAllAssessmentsByCourseId = async (courseId: string) => {
    try {
        const assessmentsData = await db.assessments.findMany({
            where: { courseId },
            select: {
                id: true,
                title: true,
                date: true,
                accesskey: true,
                language: true,
                maxtime: true,
                active: true,
                maxscore: true,
                tabswitches: true,
                courseId: true,
                _count: {
                    select: {
                        mcqQuestions: true,
                        codeQuestions: true,
                    },
                },
            },
        });

        const assessments = assessmentsData.map(assessment => {
            // Assessment start time in the app timezone (Asia/Kolkata)
            const starttime = formatTime(assessment.date);

            return {
                ...assessment,
                mcqcount: assessment._count.mcqQuestions,
                codecount: assessment._count.codeQuestions,
                starttime // Add the new field
            };
        });
        // console.log(assessments)
        return assessments;
    } catch (error) {
        console.error("Error fetching assessments:", error);
        return [];
    }
};

// Get a single assessment by its ID
export const getAssessmentById = async (id: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id }
        });
        if (!assessment) return null;

        // Start time in the app timezone (Asia/Kolkata), 12-hour format
        const starttime = formatTime12(assessment.date);
        return {
            ...assessment,
            starttime
        };
    } catch (error) {
        console.error("Error fetching assessment by ID:", error);
        return null;
    }
};

// Get coding questions for an assessment
export const getAssessmentCodeQuestionsById = async (assessmentId: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id: assessmentId },
            include: { codeQuestions: true }
        });

        return assessment?.codeQuestions ?? null;
    } catch (error) {
        console.error("Error fetching code questions:", error);
        return null;
    }
};

// Get MCQ questions for an assessment
export const getAssessmentMcqQuestionsById = async (assessmentId: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id: assessmentId },
            include: { mcqQuestions: true }
        });

        return assessment?.mcqQuestions ?? null;
    } catch (error) {
        console.error("Error fetching MCQ questions:", error);
        return null;
    }
};

// Get course and assessment titles (like module titles)
export const getCourseAssessmentTitlesByAssessmentId = async (assessmentId: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id: assessmentId },
            select: {
                title: true,
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        if (assessment) {
            return {
                courseTitle: assessment.course.title,
                assessmentTitle: assessment.title
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching assessment and course titles:", error);
        return null;
    }
};
