"use client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Pencil, Plus } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoaderIcon } from "lucide-react"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormDescription,
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
import { StudentUpdateSchema } from "@/schemas/student/user-schema"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatestudent } from "@/actions/user"
const UserEdit = ({ student }: { student: z.infer<typeof StudentUpdateSchema> }) => {
    const router = useRouter();
    const form = useForm<z.infer<typeof StudentUpdateSchema>>({
        resolver: zodResolver(StudentUpdateSchema),
        defaultValues: {
            id: student.id,
            name: student.name,
            phone: student.phone || undefined,
            batch: student.batch || undefined,
            department: student.department || undefined,
            rollnumber: student.rollnumber || undefined,
            github: student.github || undefined,
            section: student.section || undefined,
            linkedin: student.linkedin || undefined,
        }
    })
    const [open, setOpen] = useState(false)
    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof StudentUpdateSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            updatestudent(values)
                .then((data) => {
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
                    <div className="cursor-pointer p-2 rounded-md bg-primary border border-white hover:bg-primary/80 hover:border-slate-300">
                        <Edit className="h-6 w-6 text-white hover:text-gray-200/80" />
                    </div>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[825px] max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                {/* <form > */}
                                <div className="grid gap-2 grid-cols-2">
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="atomuser"
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
                                            name="rollnumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Rollnumber</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="1101"
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
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="9876543210"
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
                                            name="batch"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Batch</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a Batch" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="2021-2025">2021-2025</SelectItem>
                                                            <SelectItem value="2022-2026">2022-2026</SelectItem>
                                                            <SelectItem value="2023-2027">2023-2027</SelectItem>
                                                            <SelectItem value="2024-2028">2024-2028</SelectItem>
                                                            <SelectItem value="2025-2029">2025-2029</SelectItem>
                                                            <SelectItem value="2026-2030">2026-2030</SelectItem>
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
                                            name="department"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Department</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a Department" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="cse">CSE</SelectItem>
                                                            <SelectItem value="it">IT</SelectItem>
                                                            <SelectItem value="iot">IOT</SelectItem>
                                                            <SelectItem value="cys">Cyber Security</SelectItem>
                                                            <SelectItem value="aids">AI & DS</SelectItem>
                                                            <SelectItem value="aiml">AI & ML</SelectItem>
                                                            <SelectItem value="mech">Mechanical</SelectItem>
                                                            <SelectItem value="civil">Civil</SelectItem>
                                                            <SelectItem value="eee">EEE</SelectItem>
                                                            <SelectItem value="ece">ECE</SelectItem>
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
                                            name="section"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Section</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a Section" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="a">A</SelectItem>
                                                            <SelectItem value="b">B</SelectItem>
                                                            <SelectItem value="c">C</SelectItem>
                                                            <SelectItem value="d">D</SelectItem>
                                                            <SelectItem value="e">E</SelectItem>
                                                            <SelectItem value="f">F</SelectItem>
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
                                            name="github"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Github URL</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="https://github.com/..."
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
                                            name="linkedin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn Profile</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="https://profile.linkedin.com/..."
                                                            type="text"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                </div>
                                <div className="my-4">
                                    <FormError message={error} />
                                    <FormSuccess message={success} />
                                </div>
                                <div className="w-full mx-auto grid gap-2 grid-cols-2 mt-5">
                                    <div className="p-1 bg-red-500 rounded-md hover:bg-red-400 flex justify-center items-center text-gray-50 font-medium cursor-pointer" onClick={() => { setOpen(!open) }}>Cancel</div>
                                    <Button disabled={isLoading}>
                                        {isLoading && (
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Save
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

export default UserEdit


// UserEdit