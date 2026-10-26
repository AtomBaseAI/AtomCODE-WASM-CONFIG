
import { Button } from "@/components/ui/button"
import { getCourseById } from "@/data/courses"
import { format } from 'date-fns';
import EditCourseForm from "@/components/course/course-edit-form";
import BackBtn from "@/components/backbtn";

const EditCourse = async ({ params }: { params: Promise<{ cid: string}> }) => {

    const { cid } = await params
    const course = await getCourseById(cid)
    const coursex = {
        id: cid,
        title: course?.title || '',
        startdate: course?.startdate ?? new Date(),
        enddate: course?.enddate ?? new Date(),
        language: course?.language || ''
    };
    const formattedDates = {
        FStartDate: course?.startdate ? new Date(course?.startdate) : null,
        FEndDate: course?.enddate ? new Date(course?.enddate) : null
    }
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{course?.title}</h2>
                    </div>
                </div>

                <div className="w-full p-4 shadow-md border flex flex-col">
                    <div className="w-full border p-1">
                        <div className="flex w-full justify-between items-center px-2 py-4">
                            <h4 className="text-primary font-bold">Course Details</h4>
                            <div className="flex gap-4">
                                <EditCourseForm course={coursex} />
                                <BackBtn />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-x-6 gap-y-4 px-2 py-4">
                            <div className="flex flex-row border shadow flex-1 col-span-2">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Title
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {coursex.title}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1 col-span-2">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Start Date
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {formattedDates.FStartDate ? format(formattedDates.FStartDate, 'dd/MM/yyyy') : 'N/A'}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1 col-span-2">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    End Date
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {formattedDates.FEndDate ? format(formattedDates.FEndDate, 'dd/MM/yyyy') : 'N/A'}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1 col-span-2">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Language
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {coursex.language}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EditCourse