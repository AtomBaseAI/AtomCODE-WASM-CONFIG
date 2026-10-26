import * as z from "zod";

export const AssessmentTableSchema = z.object({
    assessmentid: z.string(),
    courseid: z.string(),
    title: z.string(),
    coursetitle: z.string(),
    maxscore: z.number(),
    starttime: z.string(),
    maxtime: z.string(),
    active: z.boolean(),
    mcqcount: z.number(),
    codecount: z.number(),
    assessmentdate: z.string(),
    tabswitches: z.number(),
    status: z.string()
});
export const AssessmentcheckSchema = z.object({
    title: z.string(),
    starttime: z.string(),
    maxtime: z.string(),
    assessmentdate: z.string(),
    status: z.string(),
    accesskey: z.string()
})
export const startUserAssessmentDataSchema = z.object({
    userId: z.string(),
    courseId: z.string(),
    assessmentId: z.string(),
    totalmcqscore: z.number(),
    totalquestionscore: z.number(),
    assessmentmaxscore: z.number(),
    assessmentstarttime: z.string(),
    userassessmentstarttime: z.string(),
    usertabswitches: z.number(),
    maxtabswitches: z.number(),
    maxtime: z.string(),
    status: z.string(),
})


export const UserAssessmentCodeDataSaveSchema = z.object({
    questionId: z.string(),
    assessmentId: z.string(),
    score: z.number(),
    compiles: z.number(),
    errors: z.number(),
    submissiontype: z.string(),
    tabswitches: z.number(),
    status: z.string(),
    usercode: z.string().optional(),
    duration: z.string().optional(),
    testcase1status: z.string(),
    testcase2status: z.string(),
    testcase3status: z.string(),
});
export const UserAssessmentMCQDataSaveSchema = z.object({
    assessmentId: z.string(),
    score: z.number(),
    errors: z.number(),
    submissiontype: z.string(),
    tabswitches: z.number(),
    status: z.string(),
    duration: z.string().optional()
});

export const AssessmentCodeSchema = z.object({
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
    topic: z.string(),
    subtopic: z.string().nullable(),
    inputconstrains: z.string().nullable(),
    referenceimg: z.string().nullable(),
    sourcecode: z.string().nullable(),
    whitelist: z.string().nullable(),
    blacklist: z.string().nullable(),
    questionstatus: z.boolean()
})
export const AssessmentMCQSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    Option1: z.string(),
    Option2: z.string(),
    Option3: z.string(),
    Option4: z.string(),
    CorrectOption: z.number().int(),
    referenceimg: z.string().optional().nullable(),
    codesnippet: z.string().optional(),
    iscodesnippet: z.boolean(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
})



export const UserAssessmentLiveData = z.object({
    userId: z.string(),
    assessmentId: z.string(),
    mcqstatus: z.string().nullable(),
    questionstatus: z.string().nullable(),
    status: z.string(),
    userassessmentstarttime: z.string(),
    maxtabswitches: z.number(),
    usertabswitches: z.number(),
    maxtime: z.string(),
    assessmentstarttime: z.string(),
    remainingtime: z.string(),
    mcq: z.array(AssessmentMCQSchema).optional(),
    code: z.array(AssessmentCodeSchema).optional()
})


export const UserQuestionAssessmentDataSchema = z.object({
    userId: z.string(),
    questionId: z.string(),
    assessmentId: z.string(),
    score: z.number(),
    compiles: z.number(),
    errors: z.number(),
    submissiontype: z.string(),
    tabswitches: z.number(),
    status: z.string(),
    usercode: z.string().optional(),
    duration: z.string().optional(),
    testcase1status: z.string(),
    testcase2status: z.string(),
    testcase3status: z.string(),

});

export const upateUserAssessmentSchemaMCQ = z.object({
    id: z.string(),
    mcqtime: z.number(),
    mcqstatus: z.string(),
    usermcqscore: z.number(),
})

export const upateUserAllAssessmentSchemaCode = z.object({
    id: z.string(),
    userId: z.string(),
    assessmentId: z.string(),
})