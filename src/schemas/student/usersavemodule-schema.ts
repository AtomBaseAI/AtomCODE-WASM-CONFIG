import { z } from 'zod';


export const startUserModelDataSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  moduleId: z.string(),
  modulestatus: z.string(),
  modulemaxscore: z.number().optional(),
  totalmcqscore: z.number(),
  totalquestionscore: z.number(),
})

export const upateUserModelSchemaMCQ = z.object({
  id: z.string(),
  mcqtime: z.number(),
  mcqstatus: z.string(),
  usermcqscore: z.number(),
})


export const upateUserModelSchemaCode = z.object({
  id: z.string(),
  userId: z.string(),
  moduleId: z.string(),
})

export const submitUserModelDataSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  courseId: z.string(),
  moduleId: z.string(),
  modulestatus: z.string(),
})

export const UserModuleDataSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  courseId: z.string(),
  moduleId: z.string(),
  mcqtime: z.number().optional(),
  mcqstatus: z.string().optional(),
  usermcqscore: z.number().optional(),
  totalmcqscore: z.number().optional(),
  questiontime: z.number().optional(),
  questionstatus: z.string().optional(),
  userquestionscore: z.number().optional(),
  totalquestionscore: z.number().optional(),
  errors: z.number().optional(),
  compiles: z.number().optional(),
  modulemaxscore: z.number().optional(),
  modulestatus: z.string(),
});
