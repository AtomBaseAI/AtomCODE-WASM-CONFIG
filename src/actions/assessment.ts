"use server"
import { db } from "@/lib/db";
import { startUserAssessmentDataSchema, upateUserAllAssessmentSchemaCode, upateUserAssessmentSchemaMCQ, UserQuestionAssessmentDataSchema } from "@/schemas/student/assessment-schema";
import {
  AddAssessmentSchema,
  DeleteAssessmentSchema,
  UpdateAssessmentSchema,
} from "@/schemas/assessment-schema";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/action-guards";

import * as z from 'zod';


export const startAssessment = async (data: z.infer<typeof startUserAssessmentDataSchema>) => {
  const newrecord = await db.userAssessmentData.create({
    data: {
      userId: data.userId,
      courseId: data.courseId,
      assessmentId: data.assessmentId,
      totalmcqscore: data.totalmcqscore,
      totalquestionscore: data.totalquestionscore,
      assessmentmaxscore: data.assessmentmaxscore,
      assessmentstarttime: data.assessmentstarttime,
      userassessmentstarttime: data.userassessmentstarttime,
      usertabswitches: data.usertabswitches,
      maxtabswitches: data.maxtabswitches,
      maxtime: data.maxtime,
      status: data.status
    }
  });

  revalidatePath('/student/assessments');
  return { success: true, uaid: newrecord.id };
};

export const mcqdataUpdateAssessment = async (data: z.infer<typeof upateUserAssessmentSchemaMCQ>) => {
  const checkdata = await db.userAssessmentData.findUnique({
    where: {
      id: data.id
    }
  })
  if (checkdata === null) {
    return { error: "Invalid Submission" };
  }
  await db.userAssessmentData.update({
    where: {
      id: data.id
    },
    data: {
      mcqtime: data.mcqtime,
      mcqstatus: data.mcqstatus,
      usermcqscore: data.usermcqscore,
    }
  }),
    revalidatePath('/student/assessment');
  return { success: "MCQ's Submitted" };
}


//code submit userassessmentcode
export const submitassessmentquestion = async (values: z.infer<typeof UserQuestionAssessmentDataSchema>) => {
  const validatedFields = UserQuestionAssessmentDataSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid Submission" }
  }
  const {
    userId,
    questionId,
    assessmentId,
    score,
    compiles,
    errors,
    submissiontype,
    status,
    usercode,
    duration,
    testcase1status,
    testcase2status,
    testcase3status,
  } = validatedFields.data;
  const existingrecord = await db.userAssessmentCodeData.findUnique({
    where: {
      userId_questionId: {
        userId: userId,
        questionId: questionId
      },
    },
  })
  if (existingrecord && existingrecord.status === 'retake') {
    await db.userAssessmentCodeData.update({
      where: {
        id: existingrecord.id
      },
      data: {
        score,
        compiles,
        errors,
        status,
        usercode,
        duration,
        testcase1status,
        testcase2status,
        testcase3status,
      }
    })

    await revalidatePath('/student/assessment');
    return { success: "Code Retake Submitted !" }
  } else if (existingrecord?.status === 'submitted') {
    return { error: "Code already Submitted !" }
  }
  await db.userAssessmentCodeData.create({
    data: {
      userId,
      questionId,
      assessmentId,
      score,
      compiles,
      errors,
      submissiontype,
      status,
      usercode,
      duration,
      testcase1status,
      testcase2status,
      testcase3status,
    }
  })

  await revalidatePath('/student/assessment');
  return { success: "Code Submitted !" }
}

//submit all questions




export const submitassessmentallquestions = async (data: z.infer<typeof upateUserAllAssessmentSchemaCode>) => {
  const existingrecords = await db.userAssessmentCodeData.findMany({
    where: {
      userId: data.userId,
      assessmentId: data.assessmentId
    },

  })

  // score,
  // compiles,
  // errors,
  // duration,
  const totalquestionscore = existingrecords.reduce((total, record) => total + record.score, 0);
  const totalcompiles = existingrecords.reduce((total, record) => total + record.compiles, 0);
  const totalerrors = existingrecords.reduce((total, record) => total + record.errors, 0);
  const totalquestiontime = existingrecords.reduce((total, record) => total + parseInt(record?.duration || '0'), 0);
  // console.log(totalcompiles)
  const checkdata = await db.userAssessmentData.findUnique({
    where: {
      id: data.id
    }
  })
  if (checkdata === null) {
    return { error: "Invalid Submission" };
  }
  await db.userAssessmentData.update({
    where: {
      id: data.id
    },
    data: {
      questiontime: totalquestiontime,
      questionstatus: 'submitted',
      userquestionscore: totalquestionscore,
      errors: totalerrors,
      compiles: totalcompiles,
    }
  }),
    revalidatePath('/student/assessment');
  return { success: "Code Submitted" };
}


// Add Assessment
export const addassessment = async (values: z.infer<typeof AddAssessmentSchema>) => {
  await db.assessments.create({
    data: {
      ...values,
    },
  })

  revalidatePath("/admin/courses")
  return { success: "Assessment Added!" }
}

// Delete Assessment
export const deleteassessment = async (values: z.infer<typeof DeleteAssessmentSchema>) => {
  const aid = values.id
  await db.assessments.delete({
    where: {
      id: aid,
    },
  })

  revalidatePath("/admin/courses")
  return { success: "Assessment Deleted!" }
}

// Update Assessment
export const updateassessment = async (values: z.infer<typeof UpdateAssessmentSchema>) => {
  const aid = values.id
  await db.assessments.update({
    where: {
      id: aid,
    },
    data: {
      ...values,
    },
  })

  revalidatePath("/admin/courses")
  return { success: "Assessment Updated!" }
}

// Optional: Add Questions to Assessment
export const addassessmentquestions = async (assessmentId: string, questionIds: string[]) => {
  await db.assessments.update({
    where: {
      id: assessmentId,
    },
    data: {
      codeQuestions: {
        connect: questionIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath("/admin/courses")
  return { success: "Questions added to assessment successfully!" }
}

// Optional: Remove Question from Assessment
export const deleteassessmentquestion = async (questionId: string, assessmentId: string) => {
  await db.assessments.update({
    where: {
      id: assessmentId,
    },
    data: {
      codeQuestions: {
        disconnect: { id: questionId },
      },
    },
  })

  revalidatePath("/admin/courses")
  return { success: "Question removed from assessment successfully!" }
}

export const deleteassessmentsbulk = async (ids: string[]) => {
  const session = await requireAdmin();
  if (!session) return { error: "Only admins can delete assessments." };

  const validIds = (ids ?? []).filter(
    (id) => typeof id === "string" && id.trim().length > 0
  );
  if (validIds.length === 0) return { error: "No assessments selected." };

  // Assessments referenced by student attempts cannot be deleted (FK
  // restrict) — delete what we can and report the rest as skipped.
  let deleted = 0;
  let skipped = 0;
  for (const id of validIds) {
    try {
      await db.assessments.delete({ where: { id } });
      deleted++;
    } catch {
      skipped++;
    }
  }

  revalidatePath("/admin/courses");
  revalidatePath("/student/assessments");

  if (deleted === 0) {
    return {
      error:
        "None of the selected assessments could be deleted — they still contain questions or student attempts.",
    };
  }
  return { success: `${deleted} assessment(s) deleted.`, skipped: skipped > 0 ? skipped : undefined };
}

/**
 * Bulk-remove code questions from an assessment (the questions themselves
 * stay in the question bank — mirrors the row-level disconnect behaviour).
 */
export const deleteassessmentquestionsbulk = async (
  assessmentId: string,
  questionIds: string[]
) => {
  const session = await requireAdmin();
  if (!session) return { error: "Only admins can manage assessment questions." };

  const validIds = (questionIds ?? []).filter(
    (id) => typeof id === "string" && id.trim().length > 0
  );
  if (validIds.length === 0) return { error: "No questions selected." };

  const assessment = await db.assessments.findUnique({
    where: { id: assessmentId },
    select: { codeQuestions: { select: { id: true } } },
  });
  if (!assessment) return { error: "Assessment not found." };

  const connectedIds = assessment.codeQuestions
    .map((q) => q.id)
    .filter((id) => validIds.includes(id));
  if (connectedIds.length === 0) {
    return { error: "Selected questions are not part of this assessment." };
  }

  await db.assessments.update({
    where: { id: assessmentId },
    data: {
      codeQuestions: {
        disconnect: connectedIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/admin/courses");
  return { success: `${connectedIds.length} question(s) removed from the assessment.` };
}


