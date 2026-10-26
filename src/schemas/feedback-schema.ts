import * as z from "zod";

export const AddFeedbackSchema = z.object({
    courseId: z.string(),
    title: z.string().min(1, {
        message: "Feedback link is required"
    }),
    link: z.string().min(1, {
        message: "Feedback link is required"
    }),
    date: z.date({
        message: "Feedback date is required"
    }),

});
export const UpdateFeedbackSchema = z.object({
    id: z.string(),
    title: z.string(),
    link: z.string(),
    date: z.date()
})
export const DeleteFeedbackSchema = z.object({
    id: z.string()
});

export const FeedbackTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    // courseId: z.number(),
    link: z.string(),
    date: z.date()
});



export type FeedbackTableType = z.infer<typeof FeedbackTableSchema>;
