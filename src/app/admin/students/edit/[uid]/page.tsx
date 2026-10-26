import BackBtn from "@/components/backbtn"
import EditStudentForm from "@/components/student/student-edit-form"
import ResetPasswordStudent from "@/components/student/student-reset-model"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStudentById } from "@/data/students"

const EditStudent = async ({ params }: { params: Promise<{ uid: string}> }) => {

    const { uid } = await params
    const student = await getStudentById(uid)
    const studentx = {
        id: uid,
        name: student?.name as string,
        department: student?.department as string,
        batch: student?.batch as string,
        phone: student?.phone as string,
        rollnumber: student?.rollnumber as string,
        github: student?.github as string,
        linkedin: student?.linkedin as string,
        email: student?.email as string,
        isActive: student?.isActive as boolean,
        section: student?.section as string

    };
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{student?.name}</h2>
                        <p className="text-muted-foreground">
                            {student?.rollnumber}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={student?.image || undefined} alt="profile" />
                            <AvatarFallback>{student?.name}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="w-full p-4 shadow-md border flex flex-col">
                    <div className="w-full border p-1">
                        <div className="flex w-full justify-between items-center px-2 py-4">
                            <h4 className="text-primary font-bold">Account Details</h4>
                            <div className="flex gap-4">
                                <EditStudentForm student={studentx} />
                                <ResetPasswordStudent uid={uid} />
                                <BackBtn />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-x-6 gap-y-4 px-2 py-4">
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Name
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {studentx.name}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Email
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {studentx.email}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Rollnumber
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {studentx.rollnumber}
                                </div>
                            </div>

                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Phone
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {
                                        studentx.phone !== null && studentx.phone !== undefined && studentx.phone !== "" ? studentx.phone : "Not Available"
                                    }
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Batch
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {studentx.batch}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Department
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {studentx.department.toUpperCase()}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Section
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {studentx.section.toUpperCase()}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1 line-clamp-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Github
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {
                                        studentx.github !== null && studentx.github !== undefined && studentx.github !== "" ? studentx.github : "Not Available"
                                    }
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    LinkedIn
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {
                                        studentx.linkedin !== null && studentx.linkedin !== undefined && studentx.linkedin !== "" ? studentx.linkedin : "Not Available"
                                    }
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1 line-clamp-1">
                                <div className="h-full bg-primary/90 text-white rounded-md  w-[30%] text-center p-1">
                                    Account
                                </div>
                                {
                                    studentx.isActive ?
                                        (
                                            <div className="flex items-center justify-center  w-[70%] bg-green-500/80 text-white font-semibold text-sm p-1">
                                                Active
                                            </div>
                                        )
                                        :
                                        (
                                            <div className="flex items-center justify-center  w-[70%] bg-red-500/80 text-white font-semibold text-sm p-1">
                                                Disabled
                                            </div>
                                        )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EditStudent