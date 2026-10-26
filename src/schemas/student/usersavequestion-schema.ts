import { z } from 'zod';

export const UserQuestionDataSchema = z.object({
    userId: z.string(),
    questionId: z.string(),
    moduleId: z.string(),
    score: z.number(),
    compiles: z.number(),
    errors: z.number(),
    submissiontype: z.string(),
    tabswitches: z.number(),
    status: z.string(),
    usercode: z.string().optional(),
    duration: z.string().optional(),  
    testcase1status:z.string(),
    testcase2status:z.string(),
    testcase3status:z.string(),
});