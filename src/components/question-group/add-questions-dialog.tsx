"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FolderPlus, LoaderIcon, Search, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { GroupQuestionRow } from "@/schemas/question-group-schema"

interface AddQuestionsDialogProps {
    groupId: string
    groupTitle: string
    /** Questions that can be moved into this group (not already in it). */
    available: GroupQuestionRow[]
}

/**
 * Multi-select picker that moves existing questions into the group.
 * Questions already belonging to another group show a badge and are moved.
 */
export function AddQuestionsDialog({
    groupId,
    groupTitle,
    available,
}: AddQuestionsDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | undefined>("")

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return available
        return available.filter(
            (qst) =>
                qst.title.toLowerCase().includes(q) ||
                qst.lang.toLowerCase().includes(q)
        )
    }, [available, query])

    const openChangeHandler = (next: boolean) => {
        setOpen(next)
        if (next) {
            setQuery("")
            setSelected([])
            setError("")
        }
    }

    const toggle = (qid: string, checked: boolean) => {
        setSelected((prev) =>
            checked ? [...prev, qid] : prev.filter((id) => id !== qid)
        )
    }

    const handleSubmit = async () => {
        if (selected.length === 0) return
        setError("")
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/question-groups/${groupId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionIds: selected }),
            })
            const data = await res.json().catch(() => null)
            if (!res.ok) {
                setError(data?.error ?? "Something went wrong!")
                return
            }
            toast.success(data?.success ?? "Questions added to the group")
            setOpen(false)
            router.refresh()
        } catch {
            setError("Network error — please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={openChangeHandler}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <FolderPlus className="size-4" /> Add Questions
                </Button>
            </DialogTrigger>
            <DialogContent
                aria-describedby={undefined}
                className="sm:max-w-[620px]"
            >
                <DialogHeader>
                    <DialogTitle>
                        Add questions to &quot;{groupTitle}&quot;
                    </DialogTitle>
                    <DialogDescription className="text-left text-muted-foreground">
                        Pick one or more questions. A question can live in only
                        one group — moving it here removes it from its previous
                        group.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title or language"
                        aria-label="Search questions to add"
                        className="h-9 pl-8"
                    />
                </div>

                <ScrollArea className="max-h-96 rounded-md border">
                    {filtered.length ? (
                        <ul className="divide-y">
                            {filtered.map((qst) => {
                                const checked = selected.includes(qst.id)
                                return (
                                    <li key={qst.id}>
                                        <label
                                            htmlFor={`pick-${qst.id}`}
                                            className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                id={`pick-${qst.id}`}
                                                checked={checked}
                                                onCheckedChange={(v) =>
                                                    toggle(qst.id, v === true)
                                                }
                                                aria-label={`Select ${qst.title}`}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate font-medium">
                                                    {qst.title}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {qst.lang} · {qst.difficulty}{" "}
                                                    · {qst.maxscore} marks
                                                </span>
                                            </span>
                                            {qst.groupTitle && (
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0"
                                                >
                                                    {qst.groupTitle}
                                                </Badge>
                                            )}
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                            <SearchX className="size-8" />
                            <span className="text-sm">
                                {available.length === 0
                                    ? "Every question is already in this group."
                                    : "No questions match your search."}
                            </span>
                        </div>
                    )}
                </ScrollArea>

                {error && (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}

                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                        {selected.length} selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || selected.length === 0}
                            className="gap-2"
                        >
                            {isSubmitting && (
                                <LoaderIcon className="size-4 animate-spin" />
                            )}
                            Add {selected.length || ""} question
                            {selected.length === 1 ? "" : "s"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddQuestionsDialog
