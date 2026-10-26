"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useEffect, useState, useTransition } from "react"
import { LoaderIcon, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormError } from "@/components/auth/form-error"
import { FormSuccess } from "@/components/auth/form-success"
import { updateassessment } from "@/actions/assessment"
import type * as z from "zod"
import { RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "@/components/time-picker"
import { UpdateAssessmentSchema } from "@/schemas/assessment-schema"
import { DateTimePicker } from "@/components/date-time-picker"
import { formatDateTime } from '@/lib/utils'

type AssessmentData = {
    id: string
    language: string
    title: string
    date: Date
    maxtime: string
    accesskey: number
    maxscore: number
    tabswitches: number
    active: boolean
}

const EditAssessment = ({ data }: { data: AssessmentData }) => {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isLoading, startTransition] = useTransition()

    const form = useForm<z.input<typeof UpdateAssessmentSchema>, any, z.output<typeof UpdateAssessmentSchema>>({
        resolver: zodResolver(UpdateAssessmentSchema),
        defaultValues: {
            ...data,
        },
    })

    const handleSubmit = (values: z.infer<typeof UpdateAssessmentSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            updateassessment(values)
                .then((res) => {
                    if (res.success) {
                        // form.reset()
                        setOpen(false)
                        toast.success(res.success)
                    }
                })
                .catch(() => toast.error("Something went wrong!"))
        })
    }
    useEffect(() => {
        form.reset({
            ...data,
        })
    }, [data, form])
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-green-500 text-white hover:bg-green-700 hover:text-white">
                    <Pencil className="mr-2" />
                    Edit Assessment
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] max-h-[calc(100vh-2rem)] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Assessment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <div className="grid gap-4">
                                {/* Title */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assessment Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Date & Time */}
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Assessment Date & Time</FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={isLoading}
                                                    placeholder="Select assessment date & time"
                                                />
                                            </FormControl>
                                            {field.value && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Current:{" "}
                                                    {formatDateTime(field.value)}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Max Time */}
                                <FormField
                                    control={form.control}
                                    name="maxtime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (HH:MM)</FormLabel>
                                            <FormControl>
                                                <TimePicker value={field.value} onChange={field.onChange} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Access Key */}
                                <FormField
                                    control={form.control}
                                    name="accesskey"
                                    render={({ field }) => {
                                        const formattedKey = field.value
                                            ? String(field.value)
                                                .padStart(6, "0")
                                                .replace(/(\d{2})(\d{2})(\d{2})/, "$1-$2-$3")
                                            : "00-00-00"

                                        const regenerate = () => {
                                            const newKey = Math.floor(100000 + Math.random() * 900000)
                                            field.onChange(newKey)
                                        }

                                        return (
                                            <FormItem>
                                                <FormLabel>Access Key</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Input value={formattedKey} disabled className="cursor-not-allowed" />
                                                    </FormControl>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button type="button" variant="outline" size="icon" onClick={regenerate}>
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Regenerate Key</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />

                                {/* Max Score */}
                                <FormField
                                    control={form.control}
                                    name="maxscore"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Score</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tab Switches */}
                                <FormField
                                    control={form.control}
                                    name="tabswitches"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Allowed Tab Switches</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Active Status */}
                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assessment Status</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val === "true")}
                                                defaultValue={String(field.value)}
                                                disabled={isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="true">Active</SelectItem>
                                                    <SelectItem value="false">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormError message={error} />
                                <FormSuccess message={success} />

                                <Button disabled={isLoading} className="w-full">
                                    {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Assessment
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditAssessment
