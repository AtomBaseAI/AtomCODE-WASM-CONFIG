import { z } from "zod"
import Link from "next/link"
import { FolderOpen } from "lucide-react"
import { getAllQuestions } from "@/data/questions"
import { QuestionTableSchema } from "@/schemas/question-schema"
import { QuestionDataTable } from "@/components/question/question-table/q-data-table"
import { columns } from "@/components/question/question-table/q-columns"
import { Button } from "@/components/ui/button"

async function fetchQuestions() {
  const questions = await getAllQuestions()
  const rows = (questions ?? []).map((q) => ({
    ...q,
    groupTitle: q.questionGroup?.title ?? null,
  }))
  return z.array(QuestionTableSchema).parse(rows)
}

export default async function QuestionsData() {
  const question = await fetchQuestions()

  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
            <p className="text-muted-foreground">
              Browse and manage all questions — new questions are created
              inside a{" "}
              <Link
                href="/admin/questions-groups"
                className="text-primary hover:underline"
              >
                question group
              </Link>
              .
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/admin/questions-groups">
                <FolderOpen className="size-4" /> Question Groups
              </Link>
            </Button>
          </div>
        </div>
        <QuestionDataTable data={question} columns={columns} />
      </div>
    </>
  )
}
