"use client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarIcon, FileVideo, Hexagon, Plus, Star } from "lucide-react"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormError } from "@/components/auth/form-error"
import { FormSuccess } from "@/components/auth/form-success"
import { AddModuleReferenceSchema } from "@/schemas/references-schema"
import { addmodulereference } from "@/actions/references"
import { toast } from "sonner"

const AddModuleReference = ({ mid }: { mid: string }) => {

    const form = useForm<z.infer<typeof AddModuleReferenceSchema>>({
        resolver: zodResolver(AddModuleReferenceSchema),
        defaultValues: {
            moduleId: mid,
            title: '',
            type: '',
            link: '',
        }
    })
    const [open, setOpen] = useState(false)
    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof AddModuleReferenceSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            addmodulereference(values)
                .then((data) => {
                    // setError(data.error)
                    setSuccess(data.success)
                    if (data.success) {
                        setOpen(false)
                        toast.success(data.success);
                        form.reset()
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
                        <FileVideo className="mr-2" />
                        Add References
                    </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add References</DialogTitle>
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
                                                    <FormLabel>Reference Title</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Reference 1"
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
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="pdf">PDF</SelectItem>
                                                            <SelectItem value="yt">Youtube Link</SelectItem>
                                                        </SelectContent>
                                                    </Select>
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
                                                    <FormLabel>Reference Link</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="(Reference Link)"
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

export default AddModuleReference