"use client"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EditCourseForm from "@/components/course/course-edit-form"
import type { CourseTableType } from "@/schemas/course-schema"

/**
 * Table-row edit action for courses. Opens the Edit Course popup
 * in place — no navigation to the detail page. The row's data is
 * passed straight into the dialog form; the table refreshes after
 * a successful save.
 */
const CEdit = ({ course }: { course: CourseTableType }) => {
    const router = useRouter()

    const courseData = {
        id: course.id,
        title: course.title,
        startdate: course.startdate,
        enddate: course.enddate,
        language: course.language,
    }

    return (
        <EditCourseForm
            course={courseData}
            trigger={
                <Button
                    variant="outline"
                    size="icon"
                    className="border-primary bg-transparent hover:bg-purple-700/10"
                    aria-label={`Edit course ${course.title}`}
                >
                    <Pencil className="size-5 bg-transparent text-primary" />
                </Button>
            }
            onSuccess={() => router.refresh()}
        />
    )
}

export default CEdit
