
import { Book, CalendarCheck, CalendarX, } from 'lucide-react'
import { getCourseById, getCourseProgress } from '@/data/student/courses'
import { Progress } from '@/components/ui/progress'
import { auth } from '@/auth'

interface coursecomponentprops {
    children: React.ReactNode,
    params: Promise<{ course: string }>
}
const fetchSessionUserID = async () => {
    const session = await auth();
    return session?.user?.id
}
const fetchProgress = async (courseId: string, userId: string) => {
    const progress = getCourseProgress(courseId, userId)
    return progress
}

const CourseLayout = async ({ children, params }: coursecomponentprops) => {
    const { course: courseId } = await params
    const coursedata = await getCourseById(courseId)
    const uid = await fetchSessionUserID()
    if (!uid) {
        return (
            <div>Error: User not logged in</div>
        )
    }
    const CourseProgress: number = await fetchProgress(courseId, uid)
    return (
        <div className="w-full flex flex-col gap-2">
            <div className="py-10 sm:py-8 mx-8 border-2 rounded-md">
                <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-6 lg:px-2 xl:grid-cols-3">
                    <div className="max-w-3xl flex flex-col h-full items-start justify-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"> {coursedata?.title} </h2>
                        <div className='w-full flex flex-row justify-start items-center gap-4'>
                            <Progress value={CourseProgress} className='w-[60%]' />
                            <div className='w-[20] h-full flex justify-center items-center text-primary font-bold'>
                                {CourseProgress}%
                            </div>
                        </div>
                    </div>
                    <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-3 sm:gap-y-16 xl:col-span-2 items-center justify-center">
                        <li>
                            <div className="flex items-center gap-x-6">
                                <div className='h-16 w-16 text-purple-600 bg-purple-100 dark:bg-purple-500/10 rounded-md inline-flex  flex-shrink-0 items-center justify-center'>
                                    <Book className='h-10 w-10' />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-700 dark:text-gray-200">{coursedata?.modelules}</h3>
                                    <p className="text-sm font-semibold leading-6 text-primary">Total Modules</p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center gap-x-6">
                                <div className='h-16 w-16 text-green-600 bg-green-100 dark:bg-green-500/10 rounded-md inline-flex  flex-shrink-0 items-center justify-center'>
                                    <CalendarCheck className='h-10 w-10' />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-700 dark:text-gray-200">{coursedata?.starDate}</h3>
                                    <p className="text-sm font-semibold leading-6 text-green-600">Start Date</p>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center gap-x-6">
                                <div className='h-16 w-16 text-red-600 bg-red-100 dark:bg-red-500/10 rounded-md inline-flex  flex-shrink-0 items-center justify-center'>
                                    <CalendarX className='h-10 w-10' />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-700 dark:text-gray-200">{coursedata?.endDate}</h3>
                                    <p className="text-sm font-semibold leading-6 text-red-600">End Date</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            {children}
        </div>
    )
}

export default CourseLayout