import * as z from "zod";


export const ModuleAnalysisSchema = z.object({
    id: z.string(),
    title: z.string(),
    courseId: z.string(),
    moduledate: z.date(),
    studentsEnrolled: z.number(),
    studentsCompleted: z.number(),
    studentsInProgress: z.number(),
    studentsNotStarted: z.number(),
    studentsRetake: z.number(),
})

export const ResultAnalysisStudentSchema = z.object({
    rollnumber: z.string(),
    name: z.string(),
    department: z.string(),
    section: z.string(),
    batch: z.string(),
    status: z.string(),
    totalScore: z.number(),
    mcqScore: z.number(),
    codeScore: z.number(),
    time: z.number(),
    cid: z.string(),
    mid: z.string(),
    userid: z.string(),
    maxScore: z.number(),
    maxmcqscore: z.number(),
    maxcodescore: z.number(),
    mcqstatus: z.string(),
    questionstatus: z.string(),
});
export const ResetModuleStudentSchema = z.object({
    uid: z.string(),
    cid: z.string(),
    qid: z.string(),
    mid: z.string()
})

export type ModuleAnalysisSchemaType = z.infer<typeof ModuleAnalysisSchema>

export type ResultAnalysisStudentType = z.infer<typeof ResultAnalysisStudentSchema>;