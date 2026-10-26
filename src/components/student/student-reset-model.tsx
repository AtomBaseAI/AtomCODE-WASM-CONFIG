"use client"
import *as z from 'zod'
import { Button } from '@/components/ui/button'
import { Key, LoaderIcon, Trash } from 'lucide-react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form"

import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'
import { StudentPasswordResetSchema } from '@/schemas/student-schema'
import { deletestudent, resetpasswordstudent } from '@/actions/student'
import { toast } from 'sonner'
const ResetPasswordStudent = ({ uid }: { uid: string }) => {
    const form = useForm<z.infer<typeof StudentPasswordResetSchema>>({
        resolver: zodResolver(StudentPasswordResetSchema),
        defaultValues: {
            id: uid,
            password: undefined
        }
    })
    const [isLoading, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof StudentPasswordResetSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            resetpasswordstudent(values)
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
                    <Button variant='outline' className="border-destructive bg-transparent hover:bg-red-400/20 flex justify-center items-center text-destructive">
                        <Key className="size-5 bg-transparent text-destructive" /> Reset Password
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Default Password will be updated : User@Atom
                    </DialogDescription>
                    <div className="grid gap-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="id"
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
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="password"
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
                                        <Button disabled={isLoading} variant='destructive' className='w-full'>
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

export default ResetPasswordStudent