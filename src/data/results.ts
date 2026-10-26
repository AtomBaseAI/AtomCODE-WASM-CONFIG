import { db } from "@/lib/db";

// Completion-matrix types (consolidated here from the removed
// src/schemas/result-completion-schema.ts — results.ts is their only consumer)
interface ModuleData {
  modulename: string;
  mcqscore: number;
  codescore: number;
  totalscore: number;
  errors: number;
  compiles: number;
  time: number;
  maxscore: number;
}

interface UserAggregate {
  userId: string;
  rollnumber: string | null;
  name: string | null;
  totalModules: number;
  totalScore: number;
  mcqScore: number;
  codeScore: number;
  totalTime: number;
  totalErrors: number;
  totalCompiles: number;
  rank?: number;
}

interface StudentData {
  studentname: string | null;
  rollnumber: string | null;
  department: string | null;
  batch: string | null;
  section: string | null;
  email: string;
  completionpercentage: number;
  moduledata: ModuleData[];
}

interface CourseCompletionData {
  coursename: string;
  totalmodules: number;
  data: StudentData[];
}

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return parts.join(" ");
};

export const leaderboardData = async (courseId: string) => {
  try {
    // Fetch all UserModuleData entries for the given courseId
    const userModuleData = await db.userModuleData.findMany({
      where: { courseId },
      select: {
        userId: true,
        usermcqscore: true,
        userquestionscore: true,
        mcqtime: true,
        questiontime: true,
        errors: true,
        compiles: true,
        user: {
          select: {
            rollnumber: true,
            name: true,
          },
        },
      },
    });

    if (!userModuleData) {
      return null;
    }

    // Aggregate data for each user
    const userAggregates = userModuleData.reduce<Record<string, UserAggregate>>((acc, data) => {
      if (!acc[data.userId]) {
        acc[data.userId] = {
          userId: data.userId,
          rollnumber: data.user.rollnumber,
          name: data.user.name,
          totalModules: 0,
          totalScore: 0,
          mcqScore: 0,
          codeScore: 0,
          totalTime: 0,
          totalErrors: 0,
          totalCompiles: 0,
        };
      }
      acc[data.userId].totalModules += 1;
      acc[data.userId].totalScore += (data.usermcqscore ?? 0) + (data.userquestionscore ?? 0);
      acc[data.userId].mcqScore += data.usermcqscore ?? 0;
      acc[data.userId].codeScore += data.userquestionscore ?? 0;
      acc[data.userId].totalTime += (data.mcqtime ?? 0) + (data.questiontime ?? 0);
      acc[data.userId].totalErrors += data.errors ?? 0;
      acc[data.userId].totalCompiles += data.compiles ?? 0;

      return acc;
    }, {});

    // Convert object to array and sort
    const leaderboard = Object.values(userAggregates).sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.totalErrors !== b.totalErrors) {
        return a.totalErrors - b.totalErrors;
      }
      return a.totalTime - b.totalTime;
    });

    // Assign ranks
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    return leaderboard.map(user => ({
      Rank: user.rank,
      Rollnumber: user.rollnumber,
      StudentName: user.name,
      TotalModules: user.totalModules,
      TotalScore: user.totalScore,
      McqScore: user.mcqScore,
      CodeScore: user.codeScore,
      TotalTime: formatTime(user.totalTime),
      TotalErrors: user.totalErrors,
      TotalCompiles: user.totalCompiles,
    }));
  } catch (error) {
    console.error(error);
    return null;
  }
};



export const courseCompletionData = async (courseId: string): Promise<CourseCompletionData | null> => {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
        modules: {
          select: {
            id: true,
            title: true,
            maxscore: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    const userModuleData = await db.userModuleData.findMany({
      where: { courseId },
      select: {
        userId: true,
        moduleId: true,
        usermcqscore: true,
        userquestionscore: true,
        mcqtime: true,
        questiontime: true,
        errors: true,
        compiles: true,
        user: {
          select: {
            name: true,
            rollnumber: true,
            batch: true,
            department: true,
            section: true,
            email: true,
          },
        },
        module: {
          select: {
            title: true,
            maxscore: true,
          },
        },
      },
    });

    if (!userModuleData) {
      return null;
    }

    const totalModulesCount = course.modules.length;

    const userAggregates = userModuleData.reduce<Record<string, StudentData>>((acc, data) => {
      if (!acc[data.userId]) {
        acc[data.userId] = {
          studentname: data.user.name,
          rollnumber: data.user.rollnumber,
          batch: data.user.batch,
          department: data.user.department,
          section: data.user.section,
          email: data.user.email,
          completionpercentage: 0,
          moduledata: course.modules.map(module => ({
            modulename: module.title,
            mcqscore: 0,
            codescore: 0,
            totalscore: 0,
            errors: 0,
            maxscore: module.maxscore,
            compiles: 0,
            time: 0,
          })),
        };
      }

      const moduleIndex = course.modules.findIndex(module => module.id === data.moduleId);
      if (moduleIndex !== -1) {
        acc[data.userId].moduledata[moduleIndex] = {
          modulename: data.module.title,
          mcqscore: data.usermcqscore ?? 0,
          codescore: data.userquestionscore ?? 0,
          totalscore: (data.usermcqscore ?? 0) + (data.userquestionscore ?? 0),
          maxscore: data.module.maxscore,
          errors: data.errors ?? 0,
          compiles: data.compiles ?? 0,
          time: (data.mcqtime ?? 0) + (data.questiontime ?? 0),
        };
      }

      return acc;
    }, {});

    for (const userId in userAggregates) {
      const user = userAggregates[userId];
      const completedModulesCount = user.moduledata.filter(module => module.totalscore > 0).length;
      const completionPercentage = (completedModulesCount / totalModulesCount) * 100;
      user.completionpercentage = Math.round(completionPercentage);
    }

    const result: CourseCompletionData = {
      coursename: course.title,
      totalmodules: totalModulesCount,
      data: Object.values(userAggregates),
    };

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};