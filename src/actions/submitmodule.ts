"use server"
import { db } from "@/lib/db";
import { startUserModelDataSchema, upateUserModelSchemaCode, upateUserModelSchemaMCQ, UserModuleDataSchema } from "@/schemas/student/usersavemodule-schema";
import { revalidatePath } from "next/cache";

import * as z from 'zod';


export const startModule = async (data: z.infer<typeof startUserModelDataSchema>) => {
  await db.userModuleData.create({
    data: {
      userId: data.userId,
      courseId: data.courseId,
      moduleId: data.moduleId,
      modulemaxscore: data.modulemaxscore,
      modulestatus: data.modulestatus,
      totalmcqscore: data.totalmcqscore,
      totalquestionscore: data.totalquestionscore
    }
  });

  revalidatePath('/student/courses');
  return { success: "Starting Module" };
};


export const mcqdataUpdateModule = async (data: z.infer<typeof upateUserModelSchemaMCQ>) => {
  const checkdata = await db.userModuleData.findUnique({
    where: {
      id: data.id
    }
  })
  if (checkdata === null) {
    return { error: "Invalid Submission" };
  }
  await db.userModuleData.update({
    where: {
      id: data.id
    },
    data: {
      mcqtime: data.mcqtime,
      mcqstatus: data.mcqstatus,
      usermcqscore: data.usermcqscore,
    }
  }),
    revalidatePath('/student/practice');
  return { success: "MCQ's Submitted" };
}


export const codedataUpdateModule = async (data: z.infer<typeof upateUserModelSchemaCode>) => {
  const existingrecords = await db.userCodeQuestionData.findMany({
    where: {
      userId: data.userId,
      moduleId: data.moduleId
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
  const checkdata = await db.userModuleData.findUnique({
    where: {
      id: data.id
    }
  })
  if (checkdata === null) {
    return { error: "Invalid Submission" };
  }
  await db.userModuleData.update({
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
    revalidatePath('/student/practice');
  return { success: "Code Submitted" };
}


//end module
export const endModule = async (umid: string) => {
  const checkdata = await db.userModuleData.findUnique({
    where: {
      id: umid
    }
  })
  if (checkdata === null) {
    return { error: "Invalid Submission" };
  }
  await db.userModuleData.update({
    where: {
      id: umid
    },
    data: {
      modulestatus: 'submitted'
    }
  }),

    revalidatePath('/student/courses');
  return { success: "Module Submitted" };
}





//old records

export const submitModule = async (values: z.infer<typeof UserModuleDataSchema>) => {
  const validatedFields = UserModuleDataSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Submission" };
  }
  const {
    userId,
    courseId,
    moduleId,
    totalmcqscore,
    usermcqscore,
    totalquestionscore,
    userquestionscore,
    mcqtime,
    questiontime,
    errors,
    compiles,
    modulestatus
  } = validatedFields.data;

  const existingRecord = await db.userModuleData.findFirst({
    where: {
      userId,
      moduleId
    }
  });

  // if (existingRecord) {
  //   return { warning: "Module Already Submitted!" };
  // }

  // await db.userModuleData.create({
  //   data: {
  //     userId,
  //     courseId,
  //     moduleId,
  //     totalmcqscore,
  //     usermcqscore,
  //     totalquestionscore,
  //     userquestionscore,
  //     mcqtime,
  //     questiontime,
  //     errors,
  //     compiles,
  //     modulestatus
  //   }
  // });

  // revalidatePath('/student/courses');
  // return { success: "Module Submitted" };
};
