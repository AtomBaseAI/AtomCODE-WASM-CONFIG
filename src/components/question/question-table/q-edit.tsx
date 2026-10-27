"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderIcon, Pencil } from "lucide-react"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import EditQuestionForm from "@/components/question/question-edit-form"
import type { QuestionUpdateSchema } from "@/schemas/question-schema"

type QuestionUpdateData = z.infer<typeof QuestionUpdateSchema>

/**
 * Table-row edit action for code questions. Opens the edit popup
 * (EditQuestionForm dialog) in place — no navigation to the detail
 * page. Question data + group options are fetched on click.
 */
const QEdit = ({ qid }: { qid: string }) => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [question, setQuestion] = useState<QuestionUpdateData | null>(null)
    const [groups, setGroups] = useState<{ id: string; title: string }[]>([])

    const handleOpen = async () => {
        setOpen(true)
        setLoading(true)
        try {
            const [qRes, gRes] = await Promise.all([
                fetch(`/api/questions/${qid}`),
                fetch("/api/question-groups"),
            ])
            if (!qRes.ok) throw new Error("Failed to load question")
            const qData = await qRes.json()
            setQuestion(qData.question)
            if (gRes.ok) {
                const gData = await gRes.json()
                setGroups(
                    (gData.groups ?? []).map(
                        (g: { id: string; title: string }) => ({
                            id: g.id,
                            title: g.title,
                        })
                    )
                )
            }
        } catch {
            setOpen(false)
            toast.error("Could not load the question.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                className="border-primary bg-transparent hover:bg-purple-700/10"
                aria-label="Edit question"
                disabled={loading}
                onClick={handleOpen}
            >
                {loading ? (
                    <LoaderIcon className="size-5 animate-spin text-primary" />
                ) : (
                    <Pencil className="size-5 bg-transparent text-primary" />
                )}
            </Button>
            {question && (
                <EditQuestionForm
                    question={question}
                    groups={groups}
                    open={open}
                    onOpenChange={(next) => {
                        setOpen(next)
                        if (!next) {
                            // Refresh the table so the row reflects edits
                            router.refresh()
                        }
                    }}
                />
            )}
        </>
    )
}

export default QEdit
