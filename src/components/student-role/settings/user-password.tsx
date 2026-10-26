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
    FormLabel,
    FormMessage
} from "@/components/ui/form"

import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'
import { toast } from 'sonner'
import { StudentPasswordResetSchema } from '@/schemas/student/user-schema'
import { resetpasswordstudent } from '@/actions/user'
const UserPassword = ({ uid }: { uid: string }) => {
    const form = useForm<z.infer<typeof StudentPasswordResetSchema>>({
        resolver: zodResolver(StudentPasswordResetSchema),
        defaultValues: {
            id: uid,
            password: undefined,
            confirmpassword: undefined
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
                    <div className="cursor-pointer p-2 rounded-md bg-primary border border-white hover:bg-primary/80 hover:border-slate-300">
                        <Key className="h-6 w-6 text-white hover:text-gray-200/80" />
                    </div>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                    </DialogHeader>
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
                                                    <FormLabel>New Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder='******'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-1 mb-3">
                                        <FormField
                                            control={form.control}
                                            name="confirmpassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder='******'
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

export default UserPassword