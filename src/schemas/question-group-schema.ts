import * as z from "zod";

export const AddQuestionGroupSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required"
    }).max(120, {
        message: "Title is too long"
    }),
    description: z.string().optional()
});

export const UpdateQuestionGroupSchema = z.object({
    id: z.string().min(1, {
        message: "Group id is required"
    }),
    title: z.string().min(1, {
        message: "Title is required"
    }).max(120, {
        message: "Title is too long"
    }),
    description: z.string().optional()
});

/** Row shape used by the groups table on /admin/questions-groups. */
export type QuestionGroupRow = {
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
    questionCount: number;
};

/** Slim question shape used inside group pickers / group question tables. */
export type GroupQuestionRow = {
    id: string;
    title: string;
    lang: string;
    difficulty: string;
    maxscore: number;
    topic: string | null;
    subtopic: string | null;
    groupTitle: string | null;
};
