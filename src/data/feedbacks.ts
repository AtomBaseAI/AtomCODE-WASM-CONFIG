import { db } from "@/lib/db";

export const getAllFeedbacksByCourseId = async (id: string) => {
    try {
        const feedbacksdata = await db.feedbacks.findMany({
            where: { courseId: id }
        })
        return feedbacksdata
    }
    catch {
        return null
    }
}