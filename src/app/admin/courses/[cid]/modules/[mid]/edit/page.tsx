
import { Button } from "@/components/ui/button"
import { format } from 'date-fns';
import EditCourseForm from "@/components/course/course-edit-form";
import BackBtn from "@/components/backbtn";
import { getModuleById } from "@/data/modules";
import EditModule from "@/components/module/module-edit-form";

const EditModulex = async ({ params }: { params: Promise<{ mid: string}> }) => {

  const { mid } = await params
  // const moduleId = parseInt(mid, 10);
  const moduleog = await getModuleById(mid)
  const modulex = {
    id: moduleog?.id ?? '',
    title: moduleog?.title ?? '',
    courseId: moduleog?.courseId ?? '',
    moduledate: moduleog?.moduledate ?? new Date(),
    modulestatus: moduleog?.modulestatus ?? '',
    maxscore: moduleog?.maxscore ?? 0,
    concepturl: moduleog?.concepturl ?? ''
  }
  const formattedDates = {
    FStartDate: moduleog?.moduledate ? new Date(moduleog?.moduledate) : null,
  }
  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{moduleog?.title.toLocaleUpperCase()}</h2>
          </div>
        </div>

        <div className="w-full p-4 shadow-md border flex flex-col">
          <div className="w-full border p-1">
            <div className="flex w-full justify-between items-center px-2 py-4">
              <h4 className="text-primary font-bold">Module Details</h4>
              <div className="flex gap-4">
                {/* <EditCourseForm course={coursex} /> */}
                <EditModule modulez={modulex} />
                <BackBtn />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-x-6 gap-y-4 px-2 py-4">
              <div className="flex flex-row border shadow flex-1 col-span-2">
                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                  Title
                </div>
                <div className="flex items-center justify-center  w-[70%] p-1">
                  {moduleog?.title}
                </div>
              </div>
              <div className="flex flex-row border shadow flex-1 col-span-2">
                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                  Module Date
                </div>
                <div className="flex items-center justify-center  w-[70%] p-1">
                  {formattedDates.FStartDate ? format(formattedDates.FStartDate, 'dd/MM/yyyy') : 'N/A'}
                </div>
              </div>
              <div className="flex flex-row border shadow flex-1 col-span-2">
                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                  Module Status
                </div>
                <div className="flex items-center justify-center  w-[70%] p-1">
                  {moduleog?.modulestatus.toLocaleUpperCase()}
                </div>
              </div>
              <div className="flex flex-row border shadow flex-1 col-span-2">
                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                  Language
                </div>
                <div className="flex items-center justify-center  w-[70%] p-1">
                  {moduleog?.language.toLocaleUpperCase()}
                </div>
              </div>
              <div className="flex flex-row border shadow flex-1 col-span-2">
                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                  Concept URL
                </div>
                <div className="flex items-center justify-center  w-[70%] p-1">
                  {moduleog?.concepturl}
                </div>
              </div>
            </div>
            <div className="flex h-[40vh] w-full">
              {moduleog?.concepturl ? <iframe src={moduleog?.concepturl} className="w-full h-full" title="Concept URL" /> : 'N/A'}
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default EditModulex