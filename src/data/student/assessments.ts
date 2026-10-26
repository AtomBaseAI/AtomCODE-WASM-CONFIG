import { db } from "@/lib/db";
import { formatDate, getISTParts } from '@/lib/utils';

function addMinutesToTime(time: string, minutesToAdd: number): string {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes + minutesToAdd, 0);
    return date.toTimeString().slice(0, 5);
}

function getCurrentISTTime(): { date: string; time: string } {
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    };

    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(now);

    const dateParts: Record<string, string> = {};
    parts.forEach(({ type, value }) => {
        if (type !== 'literal') dateParts[type] = value;
    });

    const date = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    const time = `${dateParts.hour}:${dateParts.minute}`;
    return { date, time };
}

function isTimeInRange(current: string, start: string, end: string): boolean {
    return current >= start && current <= end;
}

export async function getAssessmentsByUserId(userId: string) {
    const userCourses = await db.userCourse.findMany({
        where: { userId, active: true },
        select: {
            course: {
                select: {
                    id: true,
                    title: true,
                    assessments: {
                        select: {
                            id: true,
                            title: true,
                            date: true,
                            courseId: true,
                            maxtime: true,
                            active: true,
                            maxscore: true,
                            tabswitches: true,
                            _count: {
                                select: {
                                    mcqQuestions: true,
                                    codeQuestions: true,
                                },
                            },
                            UserAssessmentData: {
                                where: { userId },
                                select: { status: true }
                            }
                        },
                    },
                },
            },
        },
    });

    const { date: todayDate, time: currentTime } = getCurrentISTTime();

    const assessments = userCourses.flatMap((uc) =>
        uc.course.assessments.map((assessment) => {
            const userAssessment = assessment.UserAssessmentData[0];
            const userStatus = userAssessment?.status || "not started";
            const assessmentDate = getISTParts(assessment.date)!.dayKey;
            const startTime = new Date(assessment.date).toLocaleTimeString('en-GB', {
                timeZone: 'Asia/Kolkata',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            let dynamicStatus: "start" | "retake" | "resume" | "upcoming" | "expired" = "upcoming";

            if (assessmentDate > todayDate) {
                dynamicStatus = "upcoming";
            } else if (assessmentDate < todayDate) {
                dynamicStatus = "expired";
            } else {
                const maxStartTime = addMinutesToTime(startTime, 30);
                const endTime = addMinutesToTime(startTime, parseInt(assessment.maxtime));

                if (isTimeInRange(currentTime, startTime, maxStartTime)) {
                    if (userStatus === "retake") {
                        dynamicStatus = "retake";
                    } else if (userStatus === "started") {
                        dynamicStatus = "resume";
                    } else {
                        dynamicStatus = "start";
                    }
                } else if (currentTime > maxStartTime) {
                    dynamicStatus = "expired";
                }
            }

            return {
                title: assessment.title,
                assessmentdate: formatDate(assessment.date), // IST calendar date
                courseid: assessment.courseId,
                assessmentid: assessment.id,
                coursetitle: uc.course.title,
                maxscore: assessment.maxscore,
                starttime: startTime,
                maxtime: assessment.maxtime,
                active: assessment.active,
                mcqcount: assessment._count.mcqQuestions,
                codecount: assessment._count.codeQuestions,
                tabswitches: assessment.tabswitches,
                status: dynamicStatus,
            };
        })
    );

    return assessments;
}

export async function getAssessmentDataByAssessmentIdUserId(
    assessmentId: string,
    userId: string
) {
    const assessment = await db.assessments.findUnique({
        where: { id: assessmentId },
        select: {
            maxtime: true,
            date: true,
            accesskey: true,
            title: true,
            tabswitches: true,
            _count: {
                select: {
                    mcqQuestions: true,
                    codeQuestions: true,
                },
            },
            maxscore: true,
            UserAssessmentData: {
                where: { userId },
                select: {
                    id: true,
                    status: true,
                    assessmentstarttime: true,
                    usertabswitches: true
                },
            },
        },
    });

    if (!assessment) return null;

    const { date: todayDate, time: currentTime } = getCurrentISTTime();
    const assessmentDate = getISTParts(assessment.date)!.dayKey;
    const startTime = new Date(assessment.date).toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    const userStatus = assessment.UserAssessmentData[0]?.status || "not started";
    const uaid = assessment.UserAssessmentData[0]?.id || null;
    const prestarttime = assessment.UserAssessmentData[0]?.assessmentstarttime || null;
    const pretabswitches = assessment.UserAssessmentData[0]?.usertabswitches || 0;
    let dynamicStatus: "start" | "retake" | "resume" | "upcoming" | "expired" = "upcoming";

    if (assessmentDate > todayDate) {
        dynamicStatus = "upcoming";
    } else if (assessmentDate < todayDate) {
        dynamicStatus = "expired";
    } else {
        const maxStartTime = addMinutesToTime(startTime, 30);
        const endTime = addMinutesToTime(startTime, parseInt(assessment.maxtime));

        if (isTimeInRange(currentTime, startTime, maxStartTime)) {
            if (userStatus === "retake") {
                dynamicStatus = "retake";
            } else if (userStatus === "started") {
                dynamicStatus = "resume";
            } else {
                dynamicStatus = "start";
            }
        }
        else if (currentTime > maxStartTime) {
            dynamicStatus = "expired";
        }
    }

    return {
        accesskey: assessment.accesskey,
        title: assessment.title,
        tabswitches: assessment.tabswitches,
        maxtime: assessment.maxtime,
        starttime: startTime,
        status: dynamicStatus,
        mcqCount: assessment._count.mcqQuestions,
        questionCount: assessment._count.codeQuestions,
        maxscore: assessment.maxscore,
        uaid,
        prestarttime,
        pretabswitches
    };
}

export async function getAssessmentDataByUAID(
    uaid: string,
    aid: string,
    uid: string,
) {
    const userAssessment = await db.userAssessmentData.findUnique({
        where: {
            id: uaid,
        },
        include: {
            assessments: {
                include: {
                    mcqQuestions: true,
                    codeQuestions: true,
                },
            },
        },
    });

    const userAssessmentCodePreData = await db.userAssessmentCodeData.findMany({
        where: {
            assessmentId: aid,
            userId: uid,
        },
        select: {
            questionId: true,
            status: true,
        },
    });

    if (!userAssessment) {
        throw new Error("UserAssessment not found");
    }

    const {
        userId,
        assessmentId,
        mcqstatus,
        questionstatus,
        status,
        userassessmentstarttime,
        maxtabswitches,
        usertabswitches,
        maxtime,
        assessmentstarttime,
    } = userAssessment;

    const codeStatusMap = new Map<string, string>();
    userAssessmentCodePreData.forEach(({ questionId, status }) => {
        codeStatusMap.set(questionId, status);
    });

    const processedCodeQuestions = userAssessment.assessments.codeQuestions.map((question: any) => {
        const status = codeStatusMap.get(question.id);
        return {
            ...question,
            questionstatus: status === "submitted" ? true : false,
        };
    });

    let remainingtime: string | null = null;
    if (assessmentstarttime && maxtime) {
        const [startHours, startMinutes] = assessmentstarttime.split(":").map(Number);
        const [maxHours, maxMinutes] = maxtime.split(":").map(Number);

        const startDate = new Date();
        startDate.setHours(startHours, startMinutes, 0, 0);

        const durationMinutes = maxHours * 60 + maxMinutes;
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

        const { time: currentTimeStr } = getCurrentISTTime();
        const [currHours, currMinutes] = currentTimeStr.split(":").map(Number);
        const currentDate = new Date();
        currentDate.setHours(currHours, currMinutes, 0, 0);

        const diffMs = endDate.getTime() - currentDate.getTime();
        remainingtime = diffMs > 0 ? Math.floor(diffMs / 1000).toString() : "0";
    }

    return {
        userId,
        assessmentId,
        mcqstatus,
        questionstatus,
        status,
        userassessmentstarttime,
        maxtabswitches,
        usertabswitches,
        maxtime,
        assessmentstarttime,
        remainingtime,
        mcq: userAssessment.assessments.mcqQuestions,
        code: processedCodeQuestions
    };
}