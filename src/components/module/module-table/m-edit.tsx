"use client"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EditModule from "@/components/module/module-edit-form"
import type { ModuleTableType } from "@/schemas/module-schema"

/**
 * Table-row edit action for modules. Opens the Edit Module popup
 * in place — no navigation to the detail page. The row's data is
 * passed straight into the dialog form; the table refreshes after
 * a successful save.
 */
const MEdit = ({ module }: { module: ModuleTableType }) => {
    const router = useRouter()

    const moduleData = {
        id: module.id,
        courseId: module.courseId,
        title: module.title,
        moduledate: module.moduledate,
        modulestatus: module.modulestatus,
        maxscore: module.maxscore,
        concepturl: module.concepturl ?? "",
    }

    return (
        <EditModule
            modulez={moduleData}
            trigger={
                <Button
                    variant="outline"
                    size="icon"
                    className="border-primary bg-transparent hover:bg-purple-700/10"
                    aria-label={`Edit module ${module.title}`}
                >
                    <Pencil className="size-5 bg-transparent text-primary" />
                </Button>
            }
            onSuccess={() => router.refresh()}
        />
    )
}

export default MEdit
