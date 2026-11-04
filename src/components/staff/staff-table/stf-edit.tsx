"use client"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EditStaffForm from "@/components/staff/staff-edit-form"
import type { StaffTableType } from "@/schemas/staff-schema"

/**
 * Table-row edit action for staff. Opens the Edit Staff popup
 * in place — no navigation to the detail page. The row's data is
 * passed straight into the dialog form; the table refreshes after
 * a successful save.
 */
const STFEdit = ({ staff }: { staff: StaffTableType }) => {
    const router = useRouter()

    const staffData = {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        staffnumber: staff.staffnumber ?? "",
        phone: staff.phone ?? "",
        department: staff.department ?? "",
    }

    return (
        <EditStaffForm
            staff={staffData}
            trigger={
                <Button
                    variant="outline"
                    size="icon"
                    className="border-primary bg-transparent hover:bg-purple-700/10"
                    aria-label={`Edit staff ${staff.name}`}
                >
                    <Pencil className="size-5 bg-transparent text-primary" />
                </Button>
            }
            onSuccess={() => router.refresh()}
        />
    )
}

export default STFEdit
