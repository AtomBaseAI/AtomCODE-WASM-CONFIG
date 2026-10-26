"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "sonner"
import { Camera, ClipboardCheck, LoaderIcon, Lock } from "lucide-react"
import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { startAssessment } from "@/actions/assessment"

const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Incomplete Code!",
    }),
})

interface PrepareAssessmentProps {
    aid: string
    cid: string
    data: any
    uid: string
}

const PrepareAssessment = ({ data, aid, cid, uid }: PrepareAssessmentProps) => {
    const router = useRouter()
    const [submitloading, setSubmitloading] = useState(false)
    const [showPermissionModal, setShowPermissionModal] = useState(false)
    const [permissionsStatus, setPermissionsStatus] = useState({ clipboard: false, camera: false })
    const [isAllowedToStart, setIsAllowedToStart] = useState(false)
    const [isLoading, startTransition] = useTransition()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    useEffect(() => {
        if (!data || !data.starttime || !data.maxtime || !data.status) {
            console.warn("data incomplete or not loaded yet", data)
            return
        }


        if (data.status === "start") {
            setIsAllowedToStart(true)
        } else if (data.status === "retake") {
            setIsAllowedToStart(true)
        } else if (data.status === "resume") {
            setIsAllowedToStart(true)
        } else {
            setIsAllowedToStart(false)
        }
    }, [data])

    async function StartTest(values: z.infer<typeof FormSchema>) {
        setSubmitloading(true)

        if (!data?.accesskey) {
            toast.error("Access key not available. Please contact support.")
            setSubmitloading(false)
            return
        }

        if (values.pin !== data.accesskey.toString()) {
            toast.error("Invalid Access Code")
            setSubmitloading(false)
            return
        }

        await checkPermissions()
        setShowPermissionModal(true)
        setSubmitloading(false)
    }

    async function checkPermissions() {
        let clipboard = false
        let camera = false

        try {
            const camPerm = await navigator.permissions.query({ name: "camera" as PermissionName })
            camera = camPerm.state === "granted"

            const clipPerm = await navigator.permissions.query({ name: "clipboard-read" as PermissionName })
            clipboard = clipPerm.state === "granted"
        } catch (err) {
            console.warn("Permission API error", err)
        }

        setPermissionsStatus({ clipboard, camera })
    }

    async function requestPermissionsAndProceed() {
        try {
            localStorage.removeItem("testStartTime")
            localStorage.removeItem("tabSwitchCount")
            localStorage.removeItem("testInProgress")
            if (!permissionsStatus.camera) {
                await navigator.mediaDevices.getUserMedia({ video: true })
            }

            if (!permissionsStatus.clipboard) {
                await navigator.clipboard.readText()
            }
            // setStarttimex(Date.now().toString())
            const starttimeNow = Date.now().toString()


            if (data.status === 'start') {
                const assessmentdata = {
                    userId: uid,
                    courseId: cid,
                    assessmentId: aid,
                    totalmcqscore: data.mcqCount,
                    totalquestionscore: data.questionCount * 10,
                    assessmentmaxscore: data.maxscore,
                    assessmentstarttime: data.starttime,
                    userassessmentstarttime: starttimeNow,
                    usertabswitches: 0,
                    maxtabswitches: data.tabswitches,
                    maxtime: data.maxtime,
                    status: 'started',
                }

                // accesskey: assessment.accesskey,
                // title: assessment.title,
                // tabswitches: assessment.tabswitches,
                // maxtime: assessment.maxtime,
                // starttime: assessment.starttime,
                // status: dynamicStatus,
                // mcqCount: assessment._count.mcqQuestions,
                // questionCount: assessment._count.codeQuestions,
                // maxscore:assessment.maxscore,
                // uaid,
                // prestarttime,
                // pretabswitches
                //new
                startTransition(() => {
                    startAssessment(assessmentdata)
                        .then((datax) => {
                            if (datax.success) {
                                localStorage.setItem("testStartTime", starttimeNow)
                                localStorage.setItem("tabSwitchCount", "0")
                                localStorage.setItem("testInProgress", "true")
                                toast.success("Permissions granted. Starting test...")
                                router.push(`/student/assessment/${cid}/${aid}/${datax.uaid}`)

                            }
                            else {
                                toast.error("error while starting module")
                            }
                        })
                })

                //current
                // localStorage.setItem("testStartTime", starttimex)
                // localStorage.setItem("tabSwitchCount", "0")
                // localStorage.setItem("testInProgress", "true")

                // toast.success("Permissions granted. Starting test...")
                // router.push(`/student/assessment/${cid}/${aid}/1`)
            } else if (data.status === 'resume') {
                localStorage.setItem("testStartTime", data.prestarttime)
                localStorage.setItem("tabSwitchCount", data.pretabswitches)
                localStorage.setItem("testInProgress", "true")

                toast.success("Permissions granted. Resuming test...")
                router.push(`/student/assessment/${cid}/${aid}/${data.uaid}`)
            } else if (data.status === 'retake') {
                localStorage.setItem("testStartTime", data.prestarttime)
                localStorage.setItem("tabSwitchCount", "0")
                localStorage.setItem("testInProgress", "true")

                toast.success("Permissions granted. Retaking test...")
                router.push(`/student/assessment/${cid}/${aid}/${data.uaid}`)
            }

        } catch (err) {
            toast.error("Permission denied. Please allow access to continue.")
            console.error(err)
        } finally {
            setShowPermissionModal(false)
        }
    }

    const getButtonState = () => {
        if (data.status === "completed") {
            return { label: "Test Completed", disabled: true, className: "bg-green-600" }
        }
        if (data.status === "resume") {
            return { label: "Continue", disabled: false, className: "bg-green-600" }
        }
        if (!isAllowedToStart) {
            return { label: "Expired", disabled: true, className: "bg-red-500" }
        }

        if (data.status === "retake") {
            return { label: "Retake Test", disabled: false, className: "bg-yellow-500 hover:bg-yellow-600" }
        }

        return { label: "Start Test", disabled: false, className: "bg-primary hover:bg-primary/90" }
    }

    const buttonState = getButtonState()

    return (
        <>
            <div className="w-full h-screen flex flex-col gap-2 justify-center items-center">
                {/* Instructions Card */}
                <div className="shadow-lg rounded-md overflow-hidden w-[30rem] border hover:border-primary">
                    <div className="py-5 px-3 sm:px-8 flex flex-col justify-center items-center gap-5">
                        <span className="w-full">
                            <h2 className="w-full text-lg font-bold text-primary text-center">{data.title}</h2>
                        </span>
                        <ul className="text-sm text-left space-y-2">
                            <p className="w-full text-sm font-semibold mb-2 text-left">Important Instructions: </p>
                            <li>• The test will run for <strong>{data.maxtime} hours</strong></li>
                            <li>• You are allowed a maximum of <strong>{data.tabswitches} tab switches</strong></li>
                            <li>• Leaving the page / exiting fullscreen will count as tab switch</li>
                            <li>• Exceeding the tab switch limit will end your test</li>
                            <li>• Your progress will be saved automatically</li>
                        </ul>
                    </div>
                </div>

                {/* Access Code Form */}
                <div className="shadow-lg rounded-md overflow-hidden w-[30rem] border hover:border-primary">
                    <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
                        <h3>{data.status === "retake" ? "Retake Access Key" : "Access Key"}</h3>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(StartTest)} className="w-2/3 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <InputOTP maxLength={6} {...field} disabled={submitloading || buttonState.disabled}>
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={0} />
                                                        <InputOTPSlot index={1} />
                                                    </InputOTPGroup>
                                                    <InputOTPSeparator />
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={2} />
                                                        <InputOTPSlot index={3} />
                                                    </InputOTPGroup>
                                                    <InputOTPSeparator />
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={4} />
                                                        <InputOTPSlot index={5} />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className={`w-full ${buttonState.className}`} disabled={submitloading || buttonState.disabled}>
                                    {submitloading ? (
                                        <>
                                            <LoaderIcon className="h-6 w-6 animate-spin mr-2" /> Validating
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-6 w-6 mr-2" /> {buttonState.label}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>

            {/* Permissions Modal */}
            <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Permissions Required</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <p>Before starting the test, we need the following permissions:</p>
                        <div className="w-full h-10 flex flex-row justify-center items-center gap-1">
                            <div className={`rounded-md h-full w-1/2 flex flex-row justify-center items-center text-white ${permissionsStatus.clipboard ? "bg-green-500" : "bg-red-500"}`}>
                                <ClipboardCheck className='h-6 w-6 mr-2' />
                                <p>
                                    {
                                        permissionsStatus.clipboard ? "Granted" : "Not Granted"
                                    }
                                </p>
                            </div>
                            <div className={`rounded-md h-full w-1/2 flex flex-row justify-center items-center text-white ${permissionsStatus.camera ? "bg-green-500" : "bg-red-500"}`}>
                                <Camera className='h-6 w-6 mr-2' />
                                <p>
                                    {
                                        permissionsStatus.camera ? "Granted" : "Not Granted"
                                    }
                                </p>
                            </div>
                        </div>
                        <Button onClick={requestPermissionsAndProceed} className="w-full mt-4">
                            Grant & Start Test
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default PrepareAssessment
