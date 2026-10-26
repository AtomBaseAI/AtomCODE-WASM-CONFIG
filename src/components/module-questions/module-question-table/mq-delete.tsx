import *as z from 'zod'
import { Button } from '@/components/ui/button'
import { LoaderIcon, Trash } from 'lucide-react'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'
import { useParams } from 'next/navigation'
import { DeleteModuleQuestionSchema } from '@/schemas/module-schema'
import { deletemodulequestionx } from '@/actions/module'
import { ConfirmDeleteInput, isConfirmDeleteText } from '@/components/ui/confirm-delete'
import { toast } from 'sonner'




const DeleteModuleQuestion = ({ qid, mid }: { qid: string, mid: string }) => {

    const form = useForm<z.infer<typeof DeleteModuleQuestionSchema>>({
        resolver: zodResolver(DeleteModuleQuestionSchema),
        defaultValues: {
            id: qid,
            mid: mid
        }
    })

    const [isLoading, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [confirmText, setConfirmText] = useState("")
    const handleSubmit = (values: z.infer<typeof DeleteModuleQuestionSchema>) => {
        setError("")
        setSuccess("")
        if (!isConfirmDeleteText(confirmText)) {
            setError("Type the confirmation phrase to enable delete")
            return
        }
        startTransition(() => {
            deletemodulequestionx(values.id, values.mid)
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

            <Dialog open={open} onOpenChange={(o) => { setConfirmText(""); setOpen(o) }} >
                <DialogTrigger asChild>
                    <Button variant='outline' size='icon' className="border-destructive bg-transparent hover:bg-red-400/20">
                        <Trash className="size-5 bg-transparent text-destructive" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Question</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        This action is irreversable, Are you sure want to delete ?
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
                                            name="mid"
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
                                    <ConfirmDeleteInput value={confirmText} onValueChange={setConfirmText} />
                                    <span className='grid w-full grid-cols-2 gap-2'>
                                        <DialogClose asChild>
                                            <Button className='w-full'>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isLoading || !isConfirmDeleteText(confirmText)} variant='destructive' className='w-full'>
                                            {isLoading && (
                                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Delete
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

export default DeleteModuleQuestion