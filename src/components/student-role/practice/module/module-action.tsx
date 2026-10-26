"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, ChevronsRight, FileText, FileVideo, LoaderIcon, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { enterFullscreen, exitFullscreen, fullscreenCheck } from "@/hooks/fullscreen"
import { useEffect, useState, useTransition } from "react"
import { isBefore, isEqual } from 'date-fns';
import { formatDate } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { startModule } from "@/actions/submitmodule"

interface Reference {
    link: string;
    title: string;
    type: string;
}

interface MergedModuleType {
    id: string;
    userId: string | null;
    courseId: string | null;
    title: string;
    modulestatus: string;
    moduledate: Date;
    totalmcqscore: number | null;
    usermcqscore: number | null;
    totalquestionscore: number | null;
    userquestionscore: number | null;
    mcqtime: number | null;
    questiontime: number | null;
    errors: number | null;
    compiles: number | null;
    maxscore: number | null;
    questionscount: number,
    mcqcount: number,
    modulereference: Reference[];
}

const ModuleAction = ({ Module, uid, cid }: { Module: MergedModuleType | null, uid: string, cid: string }) => {
    // const [modu]
    const currentDate = new Date();
    const isUnlocked = Module?.moduledate ? isBefore(new Date(Module.moduledate), currentDate) || isEqual(new Date(Module.moduledate), currentDate) : false;
    const [isLoading, startTransition] = useTransition()
    const navigate = useRouter()
    const [loadingRoute, setLoadingRoute] = useState(false)
    const prepareTest = () => {
        enterFullscreen(document.documentElement)
    }
    const routeAtom = () => {
        setLoadingRoute(true)
        if (Module?.modulestatus === '' || Module?.modulestatus === null) {
            const submitData = {
                userId: uid,
                courseId: cid,
                moduleId: Module?.id,
                modulestatus: "started",
                modulemaxscore: Module?.maxscore !== null ? Module?.maxscore : undefined,
                totalmcqscore: Module.mcqcount,
                totalquestionscore: Module.questionscount * 10
            }

            startTransition(() => {
                startModule(submitData)
                    .then((data) => {
                        if (data.success) {
                            toast.success(data.success)
                            setTimeout(() => {
                                navigate.push(`/student/practice/${cid}/${Module?.id}`)
                            }, 2000)
                            setTimeout(() => {
                                setLoadingRoute(false)
                            }, 20000)

                        }
                        else {
                            toast.error("error while starting module")
                            setLoadingRoute(false)
                        }
                    })
            })
        }
        else if (Module?.modulestatus === 'started') {
            toast.success("Resuming Module")
            setTimeout(() => {
                navigate.push(`/student/practice/${cid}/${Module?.id}`)
            }, 2000)
            setTimeout(() => {
                setLoadingRoute(false)
            }, 20000)
        }
        else if (Module?.modulestatus === 'retake') {
            toast.warning("Retaking Module")
            setTimeout(() => {
                navigate.push(`/student/practice/${cid}/${Module?.id}`)
            }, 2000)
            setTimeout(() => {
                setLoadingRoute(false)
            }, 20000)
        }
    }
    const exitFs = () => {
        if (fullscreenCheck()) {
            exitFullscreen()
        }
    }
    useEffect(() => {
        exitFs()
    }, [])
    return (
        <>
            <div className='w-8/12 h-full overflow-hidden shadow-lg p-2 border-2 flex flex-col items-center justify-start'>
                <div className='bg-primary w-full min-h-[2.5rem] shrink-0 rounded-md px-4 py-2 font-semibold text-white dark:text-gray-100 flex items-center'>
                    <span className="line-clamp-1">{Module?.title}</span>
                </div>
                <div className='flex-1 min-h-0 overflow-y-auto w-full my-4'>
                    <Tabs
                        defaultValue="test"
                        className="w-full">
                        <TabsList className='w-full'>
                            <TabsTrigger value="test" className='w-full'>Practice</TabsTrigger>
                            {(Module?.modulereference && Module?.modulereference.length > 0) &&
                                <TabsTrigger value="references" className='w-full'>References</TabsTrigger>
                            }
                            <TabsTrigger value="result" className='w-full'>Result</TabsTrigger>
                        </TabsList>
                        <TabsContent value="test">
                            {isUnlocked ?
                                (<>
                                    <div className="h-[30rem] w-full flex items-center justify-center">
                                        <Card className='w-[350px] rounded-md'>
                                            {Module?.modulestatus === 'submitted' ?
                                                (
                                                    <CardContent className="flex flex-col p-4 items-center justify-center h-full w-full gap-4 mb-4">
                                                        <div className="mt-3 p-1 bg-green-500 rounded-full text-white">
                                                            <CheckCircle className='h-6 w-6' />
                                                        </div>
                                                        <p className="text-sm font-medium leading-none">
                                                            Module Completed !
                                                        </p>
                                                    </CardContent>
                                                ) : (
                                                    <>
                                                        <CardHeader>
                                                            <CardTitle>{Module?.title} </CardTitle>
                                                            <CardDescription>
                                                                {Module?.moduledate
                                                                    ? formatDate(Module.moduledate)
                                                                    : "No Date Available"}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="grid gap-4">
                                                            <div>
                                                                <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-1 last:mb-0 last:pb-0">
                                                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                                                    <div className="space-y-0">
                                                                        <p className="text-sm font-medium leading-none w-full flex justify-center">
                                                                            <span className="w-1/2 text-left">
                                                                                MCQ Questions
                                                                            </span>
                                                                            <span className="w-1/2 text-left">
                                                                                :&nbsp;&nbsp;&nbsp;  {Module?.mcqcount}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                                                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm font-medium leading-none w-full flex justify-center">
                                                                            <span className="w-1/2 text-left">
                                                                                Code Questions
                                                                            </span>
                                                                            <span className="w-1/2 text-left">
                                                                                :&nbsp;&nbsp;&nbsp;  {Module?.questionscount}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    {Module?.modulestatus === '' ? (
                                                                        <Button className="w-full bg-green-600 hover:bg-green-500" onClick={prepareTest}
                                                                            disabled={loadingRoute || (Module?.mcqcount === 0 && Module?.questionscount === 0)}>
                                                                            {loadingRoute ? (
                                                                                <>
                                                                                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                                                                    Starting Module
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ChevronsRight className="mr-2 h-4 w-4" />
                                                                                    Start Module
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    ) : Module?.modulestatus === 'retake' ? (
                                                                        <Button className="w-full bg-orange-600 hover:bg-orange-500" onClick={prepareTest}
                                                                            disabled={loadingRoute}>
                                                                            {loadingRoute ? (
                                                                                <>
                                                                                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                                                                    Retaking Module
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ChevronsRight className="mr-2 h-4 w-4" />
                                                                                    Retake Module
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    ) : Module?.modulestatus === 'started' ? (
                                                                        <Button className="w-full bg-orange-600 hover:bg-orange-500" onClick={prepareTest}
                                                                            disabled={loadingRoute}>
                                                                            {loadingRoute ? (
                                                                                <>
                                                                                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                                                                    Resuming Module
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ChevronsRight className="mr-2 h-4 w-4" />
                                                                                    Resume Module
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    ) : null}
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Starting Module </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Do not disable/exit the fullscreen during the test , else test will be auto submitted !
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel onClick={exitFs} className='bg-red-500 text-white w-full hover:bg-red-400 hover:text-white'>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={routeAtom} disabled={isLoading} className='w-full'>Start</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </CardFooter>
                                                    </>
                                                )
                                            }
                                        </Card>
                                    </div>
                                </>) : (<>
                                    <div className="h-[30rem] w-full flex items-center justify-center">
                                        <Card className='w-[450px] rounded-md'>
                                            <CardContent className="flex flex-col p-4 items-center justify-center h-full w-full gap-4 mb-4">
                                                <div className="mt-3 p-1 bg-yellow-500 rounded-full text-white">
                                                    <Lock className='h-6 w-6' />
                                                </div>
                                                <p className="text-sm font-medium leading-none">
                                                    Practice Locked !
                                                </p>
                                                <p className="text-sm font-medium"> (Unlocks on <span className="text-green-600 font-bold"> {Module?.moduledate
                                                    ? formatDate(Module.moduledate)
                                                    : "No Date Available"}</span>)</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                </>)}

                        </TabsContent>
                        <TabsContent value="result">
                            <div className="h-[30rem] w-full flex items-center justify-center">
                                <Card className='w-[450px] rounded-md'>
                                    {Module?.modulestatus === 'submitted' ?
                                        (
                                            <CardContent className="flex flex-col p-4 items-center justify-center h-full w-full gap-4 mb-4">
                                                <div className="flex flex-row justify-center items-center mt-3 gap-2">
                                                    <div className=" p-1 bg-green-500 rounded-full text-white">
                                                        <CheckCircle className='h-6 w-6' />
                                                    </div>
                                                    Result Analysis
                                                </div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[100px]">Module</TableHead>
                                                            <TableHead>Your Score</TableHead>
                                                            <TableHead>Max Score</TableHead>
                                                            <TableHead className="text-right">Time Taken</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="font-medium">MCQ</TableCell>
                                                            <TableCell>{Module?.usermcqscore}</TableCell>
                                                            <TableCell>{Module?.totalmcqscore}</TableCell>
                                                            <TableCell className="text-right">{Module?.mcqtime}s</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="font-medium">Code</TableCell>
                                                            <TableCell>{Module?.userquestionscore}</TableCell>
                                                            <TableCell>{Module?.totalquestionscore}</TableCell>
                                                            <TableCell className="text-right">{Module?.questiontime}s</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        ) : (
                                            <>
                                                <CardContent className="flex flex-col p-4 items-center justify-center h-full w-full gap-4 mb-4">
                                                    <div className="mt-3 p-1 bg-yellow-500 rounded-full text-white">
                                                        <Lock className='h-6 w-6' />
                                                    </div>
                                                    <p className="text-sm font-medium leading-none">
                                                        Result Analysis Locked !
                                                    </p>
                                                </CardContent>
                                            </>
                                        )
                                    }
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="references">
                            <div className="h-[30rem] w-full flex items-center justify-center flex-wrap gap-x-[4%] gap-y-[4%]">
                                {Module?.modulereference.map((reference, index) => (
                                    <Card className='w-[24%] h-[32%] rounded-md hover:border hover:border-primary' key={index}>
                                        <a href={reference.link} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col">
                                            <div className="w-full h-[80%] flex justify-center items-center">
                                                {
                                                    reference.type === 'yt' ? (
                                                        <FileVideo className="h-10 w-10 text-primary" />
                                                    ) : (
                                                        <FileText className="h-10 w-10 text-primary" />
                                                    )
                                                }
                                            </div>
                                            <div className="w-full px-4 h-[20%]  flex justify-start items-center border-t">
                                                <p className="line-clamp-1 text-wrap">{reference.title}</p>
                                            </div>
                                        </a>
                                    </Card>
                                ))
                                }
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    )
}

export default ModuleAction