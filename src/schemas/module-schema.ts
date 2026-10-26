import * as z from "zod"
import { QuestionTableSchema } from './question-schema';

export const AddModuleSchema = z.object({
    courseId: z.string(),
    title: z.string().min(1, {
        message: "Module Name is required"
    }),
    moduledate: z.date(),
    modulestatus: z.string().min(1, {
        message: "Module Status is required"
    }),
    maxscore: z.coerce.number(),
    language: z.string(),
    concepturl: z.string().optional()
});

export const DeleteModuleSchema = z.object({
    id: z.string()
})

export const ModuleTableSchema = z.object({
    id: z.string(),
    courseId: z.string(),
    title: z.string(),
    moduledate: z.date(),
    modulestatus: z.string(),
    questionscount: z.number(),
    mcqcount: z.number(),
    maxscore: z.number()
})

export const ModuleQuestionTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    moduledate: z.date(),
    modulestatus: z.string(),
    language: z.string(),
    questions: z.array(QuestionTableSchema)
})

export const ModuleQuestionTableQuestionSchema = z.object({
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


export const ModuleUpdateSchema = z.object({
    id: z.string(),
    courseId: z.string(),
    title: z.string(),
    moduledate: z.date(),
    modulestatus: z.string(),
    maxscore: z.coerce.number(),
    concepturl: z.string().optional()
})

export const DeleteModuleQuestionSchema = z.object({
    id: z.string(),
    mid: z.string()
})

export type ModuleTableType = z.infer<typeof ModuleTableSchema>
export type ModuleQuestionTableType = z.infer<typeof ModuleQuestionTableSchema>
export type ModuleQuestionTableQuestionType = z.infer<typeof ModuleQuestionTableQuestionSchema>

