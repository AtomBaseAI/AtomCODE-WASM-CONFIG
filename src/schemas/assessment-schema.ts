import * as z from "zod";
import { QuestionTableSchema } from './question-schema';

export const AddAssessmentSchema = z.object({
    courseId: z.string(),
    title: z.string().min(1, { message: "Assessment title is required" }),
    date: z.date(),
    maxtime: z.string().min(1, { message: "Max time is required" }),
    accesskey: z.number(),
    language: z.string().min(1, { message: "Language is required" }),
    maxscore: z.number(),
    tabswitches: z.number(),
    active: z.boolean().default(false)
})
export const DeleteAssessmentSchema = z.object({
    id: z.string()
});
export const AssessmentTableSchema = z.object({
    id: z.string(),
    courseId: z.string(),
    title: z.string(),
    date: z.date(),
    starttime: z.string(),
    maxtime: z.string(),
    language: z.string(),
    accesskey: z.number(),
    maxscore: z.number(),
    tabswitches: z.number(),
    active: z.boolean(),
    mcqcount: z.number(),
    codecount: z.number()
});
export const UpdateAssessmentSchema = z.object({
    id: z.string(),
    title: z.string(),
    date: z.date(),
    maxtime: z.string(),
    accesskey: z.number(),
    language: z.string(),
    maxscore: z.number(),
    tabswitches: z.number(),
    active: z.boolean().default(false)
});
export const DeleteAssessmentQuestionSchema = z.object({
    id: z.string(),
    aid: z.string()
});
export const AssessmentQuestionTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    // date: z.date(),
    // status: z.string(),
    language: z.string(),
    questions: z.array(QuestionTableSchema)
})
export const AssessmentQuestionTableQuestionSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    sampleinput1: z.string(),
    sampleinput2: z.string(),
    sampleoutput1: z.string(),
    sampleoutput2: z.string(),
    input1: z.string(),
    input2: z.string(),
    input3: z.string(),
    output1: z.string(),
    output2: z.string(),
    output3: z.string(),
    maxscore: z.number(),
    difficulty: z.string(),
    lang: z.string(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
    inputconstrains: z.string().optional(),
    referenceimg: z.string().nullable().optional(),
    sourcecode: z.string().nullable().optional(),
    whitelist: z.string().nullable().optional(),
    blacklist: z.string().nullable().optional(),
})

export type AssessmentTableType = z.infer<typeof AssessmentTableSchema>
export type AssessmentQuestionTableType = z.infer<typeof AssessmentQuestionTableSchema>
export type AssessmentQuestionTableQuestionType = z.infer<typeof AssessmentQuestionTableQuestionSchema>