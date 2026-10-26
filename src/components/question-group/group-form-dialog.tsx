"use client"

import * as z from "zod"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { LoaderIcon, Pencil, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
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
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    AddQuestionGroupSchema,
} from "@/schemas/question-group-schema"

interface GroupFormDialogProps {
    mode: "create" | "edit"
    group?: { id: string; title: string; description: string | null }
}

/**
 * Create / edit dialog for question groups.
 * Talks to /api/question-groups (POST) and /api/question-groups/[id] (PATCH).
 */
export function GroupFormDialog({ mode, group }: GroupFormDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | undefined>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [, startTransition] = useTransition()

    const isEdit = mode === "edit" && !!group

    const form = useForm<z.infer<typeof AddQuestionGroupSchema>>({
        resolver: zodResolver(AddQuestionGroupSchema),
        defaultValues: {
            title: group?.title ?? "",
            description: group?.description ?? "",
        },
    })

    const openChangeHandler = (next: boolean) => {
        setOpen(next)
        if (next) {
            setError("")
            form.reset({
                title: group?.title ?? "",
                description: group?.description ?? "",
            })
        }
    }

    const handleSubmit = (values: z.infer<typeof AddQuestionGroupSchema>) => {
        setError("")
        setIsSubmitting(true)

        const request = isEdit
            ? fetch(`/api/question-groups/${group!.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      title: values.title,
                      description: values.description || "",
                  }),
              })
            : fetch("/api/question-groups", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      title: values.title,
                      description: values.description || "",
                  }),
              })

        request
            .then(async (res) => {
                const data = await res.json().catch(() => null)
                if (!res.ok) {
                    setError(data?.error ?? "Something went wrong!")
                    return
                }
                toast.success(
                    isEdit ? "Question group updated!" : "Question group created!"
                )
                setOpen(false)
                form.reset({ title: "", description: "" })
                startTransition(() => router.refresh())
            })
            .catch(() => setError("Network error — please try again."))
            .finally(() => setIsSubmitting(false))
    }

    return (
        <Dialog open={open} onOpenChange={openChangeHandler}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button
                        variant="outline"
                        size="icon"
                        className="border-primary bg-transparent hover:bg-purple-700/10"
                        aria-label={`Edit group ${group!.title}`}
                    >
                        <Pencil className="size-5 text-primary" />
                    </Button>
                ) : (
                    <Button className="gap-2">
                        <Plus className="size-4" /> New Group
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Question Group" : "New Question Group"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? "Update the question group details"
                            : "Create a new question group"}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="grid gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isSubmitting}
                                            placeholder="e.g. Loops & Iterations"
                                            type="text"
                                            autoComplete="off"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            disabled={isSubmitting}
                                            placeholder="(optional)"
                                            className="resize-none min-h-[90px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && (
                            <p className="text-sm text-destructive" role="alert">
                                {error}
                            </p>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                                {isSubmitting && (
                                    <LoaderIcon className="size-4 animate-spin" />
                                )}
                                {isEdit ? "Save Changes" : "Create Group"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default GroupFormDialog
