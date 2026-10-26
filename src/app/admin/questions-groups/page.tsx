import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAllQuestionGroups } from "@/data/question-groups"
import { GroupsDataTable } from "@/components/question-group/groups-data-table"
import { GroupFormDialog } from "@/components/question-group/group-form-dialog"

export default async function QuestionGroupsPage() {
    const groups = await getAllQuestionGroups()
    const rows = (groups ?? []).map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        createdAt: g.createdAt.toISOString(),
        questionCount: g._count.questions,
    }))

    return (
        <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Question Groups
                    </h2>
                    <p className="text-muted-foreground">
                        All Question Groups
                    </p>
                </div>
                <div className="flex justify-center items-center gap-x-4">
                    <Button variant="outline" className="gap-2" asChild>
                        <Link href="/admin/questions">
                            <ArrowLeft className="size-4" /> All Questions
                        </Link>
                    </Button>
                    <GroupFormDialog mode="create" />
                </div>
            </div>
            <GroupsDataTable data={rows} />
        </div>
    )
}
