"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, LoaderIcon } from "lucide-react"
import { useState, useTransition } from 'react'
import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'
import { toast } from 'sonner'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"

import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { resetModuleForStudent } from "@/actions/analysis"
import { ResetModuleStudentSchema } from "@/schemas/result-analysis-schema"
import *as z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

const CodeRetake = ({ qid, mid, uid, cid }: { qid: string, mid: string, uid: string, cid: string }) => {
    const form = useForm<z.infer<typeof ResetModuleStudentSchema>>({
        resolver: zodResolver(ResetModuleStudentSchema),
        defaultValues: {
            uid: uid,
            cid: cid,
            mid: mid,
            qid: qid
        }
    })
    const [isLoading, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof ResetModuleStudentSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            resetModuleForStudent(values.uid, values.qid, values.mid, values.cid)
                .then((data) => {
                    // setError(data.error)
                    // setSuccess(data.success)
                    if (data.success) {
                        form.reset()
                        setOpen(false)
                        toast.success(data.success);
                    }
                })
                .catch(() => toast.error("Something went wrong!"));
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen} >
                <DialogTrigger asChild>
                    <Button className='bg-yellow-500 hover:bg-yellow-600 text-white h-10 w-[24%]' ><AlertTriangle className='mr-2 h-6 w-6' /> Retake </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Module</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        This action is irreversable, Are you sure want to Reset ?
                    </DialogDescription>
                    <div className="grid gap-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="uid"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="hidden"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormError message={error} />
                                    <FormSuccess message={success} />
                                    <span className='grid w-full grid-cols-2 gap-2'>
                                        <DialogClose asChild>
                                            <Button className='w-full'>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isLoading} className='w-full bg-yellow-500 hover:bg-yellow-600'>
                                            {isLoading && (
                                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Reset
                                        </Button>
                                    </span>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CodeRetake