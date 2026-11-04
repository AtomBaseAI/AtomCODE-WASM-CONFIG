"use client"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EditStudentForm from "@/components/student/student-edit-form"
import type { StudentTableType } from "@/schemas/student-schema"

/**
 * Table-row edit action for students. Opens the Edit Student popup
 * in place — no navigation to the detail page. The row's data is
 * passed straight into the dialog form; the table refreshes after
 * a successful save.
 */
const SEdit = ({ student }: { student: StudentTableType }) => {
    const router = useRouter()

    const studentData = {
        id: student.id,
        name: student.name,
        email: student.email,
        rollnumber: student.rollnumber ?? "",
        phone: student.phone ?? "",
        batch: student.batch ?? "",
        department: student.department ?? "",
        section: student.section ?? "",
        github: student.github ?? "",
        linkedin: student.linkedin ?? "",
        isActive: student.isActive,
    }

    return (
        <EditStudentForm
            student={studentData}
            trigger={
                <Button
                    variant="outline"
                    size="icon"
                    className="border-primary bg-transparent hover:bg-purple-700/10"
                    aria-label={`Edit student ${student.name}`}
                >
                    <Pencil className="size-5 bg-transparent text-primary" />
                </Button>
            }
            onSuccess={() => router.refresh()}
        />
    )
}

export default SEdit
