import { z } from 'zod';

export const UserMCQDataSchema = z.object({
    userId: z.string(),
    moduleId: z.string(),
    score: z.number(),
    errors: z.number(),
    submissiontype: z.string(),
    tabswitches: z.number(),
    status: z.string(),
    duration: z.string().optional()
});