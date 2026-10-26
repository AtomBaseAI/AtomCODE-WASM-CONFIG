import BackBtn from "@/components/backbtn"
import EditStaffForm from "@/components/staff/staff-edit-form"
import ResetPasswordStaff from "@/components/staff/staff-reset-model"
import { getStaffById } from "@/data/staffs"

const EditStudent = async ({ params }: { params: Promise<{ sid: string}> }) => {

    const { sid } = await params
    const staff = await getStaffById(sid)
    const staffx = {
        id: sid,
        name: staff?.name as string,
        department: staff?.department as string,
        phone: staff?.phone as string,
        staffnumber: staff?.staffnumber as string,
        email: staff?.email as string

    };
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{staff?.name}</h2>
                        <p className="text-muted-foreground">
                            {staff?.staffnumber}
                        </p>
                    </div>
                </div>

                <div className="w-full p-4 shadow-md border flex flex-col">
                    <div className="w-full border p-1">
                        <div className="flex w-full justify-between items-center px-2 py-4">
                            <h4 className="text-primary font-bold">Account Details</h4>
                            <div className="flex gap-4">
                                <EditStaffForm staff={staffx} />
                                <ResetPasswordStaff uid={sid} />
                                <BackBtn />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-x-6 gap-y-4 px-2 py-4">

                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Staff ID
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {staffx.staffnumber}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Name
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {staffx.name}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Email
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {staffx.email}
                                </div>
                            </div>

                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Phone
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {
                                        staffx.phone !== null && staffx.phone !== undefined && staffx.phone !== "" ? staffx.phone : "Not Available"
                                    }
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Department
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {staffx.department.toUpperCase()}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EditStudent