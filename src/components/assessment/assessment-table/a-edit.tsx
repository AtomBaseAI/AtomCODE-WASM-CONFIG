"use client"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EditAssessment from "@/components/assessment/assessment-edit-form"
import type { AssessmentTableType } from "@/schemas/assessment-schema"

/**
 * Table-row edit action for assessments. Opens the Edit Assessment
 * popup in place — no navigation to the detail page. The row's data
 * is passed straight into the dialog form; the table refreshes after
 * a successful save.
 */
const AEdit = ({ assessment }: { assessment: AssessmentTableType }) => {
    const router = useRouter()

    const assessmentData = {
        id: assessment.id,
        title: assessment.title,
        date: assessment.date,
        maxtime: assessment.maxtime,
        accesskey: assessment.accesskey,
        language: assessment.language,
        maxscore: assessment.maxscore,
        tabswitches: assessment.tabswitches,
        active: assessment.active,
    }

    return (
        <EditAssessment
            data={assessmentData}
            trigger={
                <Button
                    variant="outline"
                    size="icon"
                    className="border-primary bg-transparent hover:bg-purple-700/10"
                    aria-label={`Edit assessment ${assessment.title}`}
                >
                    <Pencil className="size-5 bg-transparent text-primary" />
                </Button>
            }
            onSuccess={() => router.refresh()}
        />
    )
}

export default AEdit
