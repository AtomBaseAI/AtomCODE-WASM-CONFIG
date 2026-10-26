import { db } from "@/lib/db";

export const getAllQuestionGroups = () => {
    try {
        const groups = db.questionGroup.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        })
        return groups
    }
    catch {
        return null
    }
}

export const getQuestionGroupById = async (id: string) => {
    try {
        const group = await db.questionGroup.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { title: "asc" }
                },
                _count: {
                    select: { questions: true }
                }
            }
        })
        return group
    }
    catch {
        return null
    }
}

export const getQuestionGroupsCount = () => {
    try {
        const count = db.questionGroup.count()
        return count
    }
    catch {
        return null
    }
}

/**
 * Questions that can be moved into the given group — everything that is
 * not already inside it (ungrouped questions + questions of other groups).
 */
export const getQuestionsAvailableForGroup = async (gid: string) => {
    try {
        const questions = await db.codeQuestion.findMany({
            where: {
                OR: [
                    { questionGroupId: null },
                    { questionGroupId: { not: gid } },
                ],
            },
            orderBy: { title: "asc" },
            select: {
                id: true,
                title: true,
                lang: true,
                difficulty: true,
                maxscore: true,
                topic: true,
                subtopic: true,
                questionGroup: { select: { title: true } },
            },
        })
        return questions
    }
    catch {
        return null
    }
}
