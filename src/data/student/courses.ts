import { db } from "@/lib/db";

const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
};

export const getAllUserCourses = async (userId: string) => {
    try {
        const courses = await db.userCourse.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        startdate: true,
                        enddate: true,
                        language: true
                    }
                }
            }
        });

        const formattedCourses = await Promise.all(courses.map(async (course) => {
            const courseProgress = await getCourseProgress(course.course.id, userId);
            return {
                courseId: course.course.id,
                courseName: course.course.title,
                courseStartDate: formatDate(`${course.course.startdate}`),
                courseEndDate: formatDate(`${course.course.enddate}`),
                courseLanguage: course.course.language,
                courseStatus: course.active,
                courseProgres: courseProgress,
            };
        }));

        return formattedCourses;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};
export const getCourseById = async (id: string) => {
    try {
        const course = await db.course.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                startdate: true,
                enddate: true,
                _count: {
                    select: { modules: true },
                },
            },
        },)
        const courseData = {
            id: course?.id,
            title: course?.title,
            starDate: formatDate(`${course?.startdate}`),
            endDate: formatDate(`${course?.enddate}`),
            modelules: course?._count.modules,
        }
        return courseData
    }
    catch {
        return null
    }
}

export const getCoursesCount = () => {
    try {
        const ccount = db.course.count()
        return ccount
    }
    catch {
        return null
    }
}

export const getCourseProgress = async (courseId: string, userId: string) => {
    try {
        const totalModulesCount = await db.module.count({
            where: { courseId }
        });

        if (totalModulesCount === 0) {
            return 0;
        }

        const completedModulesCount = await db.userModuleData.count({
            where: {
                courseId,
                userId,
                modulestatus: 'submitted',
            }
        });

        const completionPercentage = (completedModulesCount / totalModulesCount) * 100;
        const roundedCompletionPercentage = Math.round(completionPercentage);

        return roundedCompletionPercentage;
    } catch (error) {
        console.error("Error calculating course progress:", error);
        return 0;
    }
};