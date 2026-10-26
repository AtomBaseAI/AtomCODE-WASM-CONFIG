"use client"
import { Button } from '@/components/ui/button'
import { Check, Loader, LoaderIcon } from 'lucide-react';
import { useState, useTransition } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import { endModule } from '@/actions/submitmodule';



const SubmitCourseModule = ({ cid, umid }: { cid: string, umid: string }) => {
    const router = useRouter()
    const [isLoading, startTransition] = useTransition()
    const [SubmitModuleModel, setSubmitModuleModel] = useState(false)
    const [routeBtnLoading, setRouteBtnLoading] = useState(false)
    const submitModuleData = () => {
        setRouteBtnLoading(true)
        startTransition(() => {
            endModule(umid)
                .then((data) => {
                    if (data.success) {
                        toast.success(data.success)
                        setSubmitModuleModel(false)
                        setTimeout(() => {
                            router.push(`/student/courses/${cid}/module`);
                        }, 2000)

                        setTimeout(() => {
                            setRouteBtnLoading(false)
                        }, 20000)

                    }
                    else {
                        toast.error(data.error)
                        setSubmitModuleModel(false)
                    }
                })
        })
    }

    return (
        <>
            <Button variant="outline" className="bg-green-500 text-white hover:bg-green-500/80 hover:text-white w-full px-5" onClick={() => setSubmitModuleModel(true)} disabled={routeBtnLoading}>
                Submit Module
                {
                    routeBtnLoading ? <Loader className="animate-spin ml-2" /> : <Check className='ml-2' />
                }
            </Button>

            <AlertDialog open={SubmitModuleModel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Module </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure want to submit Module ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSubmitModuleModel(false)} className='bg-red-500 text-white w-full hover:bg-red-400 hover:text-white'>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={submitModuleData} className='w-full' disabled={isLoading}>
                            {isLoading && (
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit Module
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default SubmitCourseModule