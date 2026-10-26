"use client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Plus } from "lucide-react"
import { useState, useTransition } from "react"

import { Switch } from "@/components/ui/switch";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StaffUpdateSchema } from "@/schemas/staff-schema";
import { updatestaff } from "@/actions/staff";
const EditStaffForm = ({ staff }: { staff: z.infer<typeof StaffUpdateSchema> }) => {
    const router = useRouter();
    const form = useForm<z.infer<typeof StaffUpdateSchema>>({
        resolver: zodResolver(StaffUpdateSchema),
        defaultValues: {
            id: staff.id,
            staffnumber: staff.staffnumber || undefined,
            email: staff.email,
            name: staff.name,
            phone: staff.phone || undefined,
            department: staff.department || undefined,
        }
    })
    const [open, setOpen] = useState(false)
    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof StaffUpdateSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            updatestaff(values)
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant='outline' size='icon' className="border-primary bg-transparent hover:bg-purple-700/10 flex w-auto p-1 gap-1 text-primary justify-center items-center pr-3">
                        <Pencil className="size-5 bg-transparent text-primary" /> Edit
                    </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[825px] max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
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
                                            name="staffnumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Staff ID</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            // defaultValue={student.rollnumber}
                                                            placeholder="CS01"
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
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            // defaultValue={student.email}
                                                            placeholder="user@atom.com"
                                                            type="email"
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
                                                            // defaultValue={student.email}
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

export default EditStaffForm