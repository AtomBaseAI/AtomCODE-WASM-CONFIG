import * as z from "zod"


export const AddQuestionSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required"
    }),
    description: z.string().min(1, {
        message: "Description  is required"
    }),
    sampleinput1: z.string().min(1, {
        message: "Sample Testcase input 1  is required"
    }),
    sampleinput2: z.string().min(1, {
        message: "Sample Testcase input 2  is required"
    }),
    sampleoutput1: z.string().min(1, {
        message: "Sample Testcase output 1  is required"
    }),
    sampleoutput2: z.string().min(1, {
        message: "Sample Testcase output 2  is required"
    }),
    input1: z.string().min(1, {
        message: "Input 1  is required"
    }),
    input2: z.string().min(1, {
        message: "Input 2  is required"
    }),
    input3: z.string().min(1, {
        message: "Input 3  is required"
    }),
    output1: z.string().min(1, {
        message: "Output 1  is required"
    }),
    output2: z.string().min(1, {
        message: "Output 2  is required"
    }),
    output3: z.string().min(1, {
        message: "Output 3  is required"
    }),
    sourcecode: z.string().min(1, {
        message: "Sourcecode is required"
    }),

    referenceimg: z.string().optional(),

    maxscore: z.number().min(1, {
        message: "maxscore is required"
    }),
    difficulty: z.string().min(1, {
        message: "Difficulty is required"
    }),
    lang: z.string().min(1, {
        message: "Languague is required"
    }),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
    inputconstrains: z.string().optional(),
    blacklist: z.string().optional(),
    whitelist: z.string().optional(),
    questionGroupId: z.string().nullable().optional()
});

export const DeleteQuestionSchema = z.object({
    id: z.string()
})

export const QuestionTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    maxscore: z.number(),
    difficulty: z.string(),
    lang: z.string(),
    topic: z.string().nullable(),
    subtopic: z.string().nullable(),
    groupTitle: z.string().nullable().optional()
    // inputconstrains: z.string().nullable(),
    // blacklist: z.string().nullable(),
    // whitelist: z.string().nullable()

})


export const QuestionUpdateSchema = z.object({
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
    sourcecode: z.string(),
    referenceimg: z.string().optional(),
    maxscore: z.number(),
    difficulty: z.string(),
    lang: z.string(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
    inputconstrains: z.string().optional(),
    blacklist: z.string().optional(),
    whitelist: z.string().optional(),
    questionGroupId: z.string().nullable().optional()
})




export type QuestionTableType = z.infer<typeof QuestionTableSchema>

