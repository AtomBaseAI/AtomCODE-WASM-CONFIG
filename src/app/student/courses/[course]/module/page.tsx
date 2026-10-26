import { auth } from "@/auth";
import ModuleView from "@/components/student-role/practice/module/module-view"
import { getAllFeedbacksByCourseId } from "@/data/feedbacks";
import { getUserModuleResultByUserIdCourseId } from "@/data/student/module-result";
import { getAllModulesByCourseId } from "@/data/student/modules";
import { AlertTriangle } from "lucide-react";



const fetchSessionUserID = async () => {
    const session = await auth();
    return session?.user?.id
}


const CourseModules = async ({ params }: { params: Promise<{ course: string }> }) => {

    const { course } = await params
    // const courseId = parseInt(course, 10)
    const uid = await fetchSessionUserID()
    const ModulesData = await getAllModulesByCourseId(course)
    const FeedbackData = await getAllFeedbacksByCourseId(course)
    if (!uid) {
        return (
            <div>Error: User not logged in</div>
        )
    }
    const ModulesResults = await getUserModuleResultByUserIdCourseId(uid, course)
    if (ModulesData?.length === 0) {
        return (
            <>
                <div className="py-10 sm:py-8 mx-8 border-2 rounded-md">
                    <div className="mx-6 w-full h-[42rem] flex flex-col gap-8 overflow-hidden flex-grow justify-center items-center">
                        <AlertTriangle className="text-yellow-500" />
                        No Modules Available !
                    </div>
                </div>
            </>
        )
    }
    return (
        <>
            <ModuleView ModulesData={ModulesData} CourseFeedbackData={FeedbackData} ModulesResults={ModulesResults} uid={uid} cid={course} />
        </>
    )
}

export default CourseModules