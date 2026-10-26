import { auth } from '@/auth'
import SubmitCourseModule from '@/components/student-role/submit-module'
import { Button } from '@/components/ui/button'
import { getUserModuleResultByUserIdCourseIdModuleId } from '@/data/student/module-result'
import { getCourseModuleByModuleID } from '@/data/student/modules'
import { AlertCircle, ChevronLeft, ChevronRight, CircleSlash, Code, Lock, Puzzle } from 'lucide-react'
import Link from 'next/link'

const getSessionUserID = async () => {
    const session = await auth();
    return session?.user?.id
}

const getCourseModuleSubmissionData = async (uid: string, cid: string, mid: string) => {
    const usermoduledata = await getUserModuleResultByUserIdCourseIdModuleId(uid, cid, mid);
    return usermoduledata;
}
const getCourseModuleData = async (moduleId: string) => {
    const moduleData = await getCourseModuleByModuleID(moduleId);
    return moduleData;
}

const PrepareModules = async ({ params }: { params: Promise<{ cid: string, mid: string }> }) => {
    const uid = await getSessionUserID()
    if (uid === null || uid === undefined) {
        return (
            <>
                <div className="w-full h-screen flex flex-col gap-2 justify-center items-center">
                    <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-red-500" >
                        <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-4">
                            <CircleSlash className="h-10 w-10 text-red-400" />
                            Session Expired !
                        </div>
                    </div>
                    <Link href='/student/dashboard' className=" w-[20rem] bg-primary hover:bg-primary/80 h-9 rounded-md text-white font-semibold flex justify-center items-center"> Home </Link>
                </div>
            </>
        )
    }
    const { mid, cid } = await params
    // const ModuleID = parseInt(mid, 10)
    // const CourseID = parseInt(cid, 10)
    const moduleData = await getCourseModuleData(mid);
    const userModuleData = await getCourseModuleSubmissionData(uid, cid, mid)
    // console.log(moduleData)
    // console.log(userModuleData)
    if (moduleData === null) {
        return (
            <>
                <div className="w-full h-screen flex flex-col gap-2 justify-center items-center">
                    <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-red-500" >
                        <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-4">
                            <CircleSlash className="h-10 w-10 text-red-400" />
                            Practice Not Found !
                        </div>
                    </div>
                    <Link href='/student/dashboard' className=" w-[20rem] bg-primary hover:bg-primary/80 h-9 rounded-md text-white font-semibold flex justify-center items-center"> Home </Link>
                </div>
            </>
        )
    }
    return (
        <>
            <main className="flex min-h-screen min-w-screen flex-row">
                <div className="w-full h-screen flex flex-col items-center justify-center flex-grow">
                    <div className="h-full w-full flex flex-col mx-4 items-center justify-center gap-y-8">
                        <div className="flex w-1/3 items-center h-[3rem] dark:bg-gray-900/30 shadow-lg rounded-sm">
                            <div className='w-full flex flex-row justify-center items-center text-lg font-bold'>
                                <h1> {moduleData?.courseName}  </h1>
                                <ChevronRight className="mx-1 text-primary text-2xl" strokeWidth={2.5} />
                                <h1> {moduleData?.moduleName}  </h1>
                            </div>
                        </div>
                        <div className='h-1/3 w-1/2 flex items-center justify-center flex-row gap-5'>
                            {userModuleData?.totalmcqscore !== 0 && (
                                <div className='h-full w-[15rem] items-center justify-center flex-col '>
                                    <div className='w-full h-2/4 border-collapse border-2 rounded-sm flex flex-col justify-center items-center'>
                                        <div className='h-1/2 w-full flex justify-center items-center gap-1 flex-col'>
                                            <h2> MCQ's </h2>
                                            <h4 className='font-bold text-2xl'> {userModuleData?.totalmcqscore} </h4>
                                        </div>
                                        <div className='h-1/2 w-full flex justify-center items-center gap-1 flex-col'>
                                            <h2>
                                                Marks
                                            </h2>
                                            <h4 className='font-bold text-2xl'>{userModuleData?.totalmcqscore}</h4>
                                        </div>
                                    </div>
                                    {
                                        userModuleData?.mcqstatus !== 'submitted' ? (
                                            <Link href={`/student/practice/${cid}/${mid}/${userModuleData?.id}/mcq`}>
                                                <Button variant="outline" className="bg-green-500 text-white hover:bg-green-700 hover:text-white w-full">
                                                    <Puzzle className="mr-2" />
                                                    Start MCQ
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className='h-9 w-full flex justify-center items-center flex-row bg-primary/50 cursor-not-allowed text-white'>
                                                <Puzzle className="mr-2" /> MCQ Submitted
                                            </div>
                                        )
                                    }
                                </div>
                            )
                            }
                            <div className='h-full w-[15rem] items-center justify-center flex-col '>
                                <div className='w-full h-2/4 border-collapse border-2 rounded-sm flex flex-col justify-center items-center'>
                                    <div className='h-1/2 w-full flex justify-center items-center gap-1 flex-col'>
                                        <h2> Programs </h2>
                                        <h4 className='font-bold text-2xl'> {userModuleData?.totalquestionscore ? (userModuleData.totalquestionscore / 10) : 0} </h4>
                                    </div>
                                    <div className='h-1/2 w-full flex justify-center items-center gap-1 flex-col'>
                                        <h2>
                                            Marks
                                        </h2>
                                        <h4 className='font-bold text-2xl'>{userModuleData?.totalquestionscore}</h4>
                                    </div>
                                </div>
                                {
                                    userModuleData?.questionstatus === 'submitted' ? (
                                        <div className='h-9 w-full flex justify-center items-center flex-row bg-primary/50 cursor-not-allowed text-white'>
                                            <Code className="mr-2" /> Code Submitted
                                        </div>
                                    ) : (
                                        <Link href={`/student/practice/${cid}/${mid}/${userModuleData?.id}/code/`}>
                                            <Button variant="outline" className="bg-green-500 text-white hover:bg-green-700 hover:text-white w-full">
                                                <Code className="mr-2" />
                                                Start Code
                                            </Button>
                                        </Link>
                                    )
                                }
                            </div>
                        </div>
                        <div className='flex gap-3'>
                            <Link href={`/student/courses/${cid}/module`}>
                                <Button variant="outline" className="bg-primary text-white hover:bg-primary/80 hover:text-white w-full px-5">
                                    <ChevronLeft className="mr-1" />
                                    Back
                                </Button>
                            </Link>
                            {userModuleData?.mcqstatus === 'submitted' && userModuleData?.questionstatus === 'submitted' &&
                                <>
                                    <SubmitCourseModule cid={cid} umid={userModuleData.id} />
                                </>
                            }
                        </div>
                    </div>
                </div>
            </main >
        </>
    )
}

export default PrepareModules