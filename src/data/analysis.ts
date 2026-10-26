import { db } from "@/lib/db";

export const getmoduleresults = async (cid: string) => {
    try {
        const modules = await db.module.findMany({
            where: {
                courseId: cid,
            },
            include: {
                userModuleData: {
                    select: {
                        modulestatus: true,
                    },
                }
            }
        });
        const totalStudentsCount = await db.userCourse.count({
            where: { courseId: cid },
        });
        const moduleResults = modules.map(module => {
            const studentsEnrolled = totalStudentsCount
            const studentsCompleted = module.userModuleData.filter(umd => umd.modulestatus === 'submitted').length;
            const studentsInProgress = module.userModuleData.filter(umd => umd.modulestatus === 'started').length;
            const studentsRetake = module.userModuleData.filter(umd => umd.modulestatus === 'retake').length;
            const studentsNotStarted = totalStudentsCount - module.userModuleData.length
            let courseId: string = cid
            return {
                id: module.id,
                title: module.title,
                moduledate: module.moduledate,
                studentsEnrolled,
                studentsCompleted,
                studentsInProgress,
                studentsNotStarted,
                studentsRetake,
                courseId
            };
        });

        return moduleResults;
    } catch (error) {
        console.error("Error fetching module results:", error);
        return [];
    }
};

export const getStudentsDataByCourseIdByModule = async (courseId: string, moduleId: string) => {
    try {
        const students = await db.userCourse.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        rollnumber: true,
                        name: true,
                        department: true,
                        batch: true,
                        section: true,
                        userModuleData: {
                            where: {
                                courseId,
                                moduleId,
                            },
                            select: {
                                modulestatus: true,
                                totalmcqscore: true,
                                usermcqscore: true,
                                totalquestionscore: true,
                                userquestionscore: true,
                                mcqtime: true,
                                questiontime: true,
                                mcqstatus: true,
                                questionstatus: true,
                            },
                        },
                    },
                },
            },
        });

        const result = students.map((student) => {
            const userModuleData = student.user.userModuleData?.[0] || {};
            // console.log(userModuleData);

            return {
                userid: student.userId,
                rollnumber: student.user.rollnumber,
                name: student.user.name,
                batch: student.user.batch,
                department: student.user.department,
                section: student.user.section,
                status: userModuleData?.modulestatus ?? "not started",
                mcqstatus: userModuleData?.mcqstatus ?? "not submitted",
                questionstatus: userModuleData?.questionstatus ?? "not submitted",
                maxScore: (userModuleData.totalquestionscore ?? 0) + (userModuleData.totalmcqscore ?? 0),
                maxmcqscore: userModuleData?.totalmcqscore ?? 0,
                maxcodescore: userModuleData?.totalquestionscore ?? 0,
                mcqScore: userModuleData?.usermcqscore ?? 0,
                codeScore: userModuleData?.userquestionscore ?? 0,
                totalScore: (userModuleData.userquestionscore ?? 0) + (userModuleData.usermcqscore ?? 0),
                time: (userModuleData.mcqtime ?? 0) + (userModuleData.questiontime ?? 0),
                cid: courseId,
                mid: moduleId,
            };
        });

        return result;
    } catch (error) {
        console.error("Error fetching students data:", error);
        return [];
    }
};


export const getPerformanceAnalysisInsights = async (courseId: string, moduleId: string, userId: string) => {
    try {
        // All five lookups are independent — run them in parallel
        const [codeQuestionsData, courseModuleData, course, module, student] = await Promise.all([
            db.userCodeQuestionData.findMany({
                where: {
                    userId,
                    moduleId
                },
                include: {
                    codeQuestion: {
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    }
                }
            }),
            db.userModuleData.findFirst({
                where: {
                    userId,
                    moduleId,
                    courseId
                },
                select: {
                    mcqtime: true,
                    mcqstatus: true,
                    usermcqscore: true,
                    totalmcqscore: true,
                    questiontime: true,
                    questionstatus: true,
                    userquestionscore: true,
                    totalquestionscore: true,
                    errors: true,
                    compiles: true,
                    modulemaxscore: true,
                    modulestatus: true
                }
            }),
            db.course.findUnique({
                where: { id: courseId },
                select: { title: true }
            }),
            db.module.findUnique({
                where: { id: moduleId },
                select: { title: true, language: true }
            }),
            db.user.findUnique({
                where: { id: userId },
                select: { name: true, rollnumber: true }
            }),
        ]);

        const codeData = codeQuestionsData.map((data) => ({
            questionid: data.codeQuestion.id,
            questiontitle: data.codeQuestion.title,
            questiondesc: data.codeQuestion.description,
            time: data.duration ? parseInt(data.duration) : 0,
            errors: data.errors,
            compiles: data.compiles,
            score: data.score,
            usercode: data.usercode,
            testcase1data: data.testcase1status,
            testcase2data: data.testcase2status,
            testcase3data: data.testcase3status
        }));

        return {
            name: student?.name,
            rollnumber: student?.rollnumber,
            coursetitle: course?.title,
            moduletitle: module?.title,
            modulelang: module?.language,
            mcqquestionscount: courseModuleData?.totalmcqscore,
            mcqscore: courseModuleData?.usermcqscore,
            mcqtime: courseModuleData?.mcqtime,
            totalcodequestionscount: courseModuleData?.totalquestionscore ? courseModuleData.totalquestionscore / 10 : 0,
            totalcodequestionscore: courseModuleData?.userquestionscore,
            totalcodequestionstime: courseModuleData?.questiontime,
            totalcodequestionserrors: courseModuleData?.errors || 0,
            codedata: codeData,
            status: courseModuleData?.modulestatus
        };
    } catch (error) {
        console.error("Error fetching performance analysis insights:", error);
        return null;
    }
};
