"use client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarIcon, Hexagon, Plus, Star } from "lucide-react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoaderIcon } from "lucide-react"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormError } from "@/components/auth/form-error"
import { FormSuccess } from "@/components/auth/form-success"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { AddFeedbackSchema } from "@/schemas/feedback-schema"
import { addfeedback } from "@/actions/feedbacks"
import { toast } from "sonner"

const AddFeedback = ({ cid }: { cid: string }) => {

    const form = useForm<z.infer<typeof AddFeedbackSchema>>({
        resolver: zodResolver(AddFeedbackSchema),
        defaultValues: {
            courseId: cid,
            title: '',
            date: undefined,
            link: '',
        }
    })
    const [open, setOpen] = useState(false)
    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof AddFeedbackSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            addfeedback(values)
                .then((data) => {
                    // setSuccess(data.success)
                    // setError(data.error)
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="bg-green-500 text-white hover:bg-green-700 hover:text-white">
                        <Star className="mr-2" />
                        Add Feedback
                    </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Feedback</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Feedback Title</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Feedback 1"
                                                            type="text"
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
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Feedback Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                // disabled={(date) =>
                                                                //     date < new Date() || date.getFullYear() < new Date().getFullYear()
                                                                // }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Feedback Link</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="(Forms Link)"
                                                            type="text"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormError message={error} />
                                    <FormSuccess message={success} />
                                    <Button disabled={isLoading}>
                                        {isLoading && (
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Add
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>


                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddFeedback