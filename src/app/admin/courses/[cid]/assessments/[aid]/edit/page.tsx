import { format } from "date-fns";
import BackBtn from "@/components/backbtn";
import { getAssessmentById } from "@/data/assessments";
import EditAssessment from "@/components/assessment/assessment-edit-form";

const EditAssessmentx = async ({ params }: { params: Promise<{ aid: string}> }) => {
  const { aid } = await params;
  const assessment = await getAssessmentById(aid);

  if (!assessment) {
    return <div className="p-8">Assessment not found.</div>;
  }

  const initialData = {
    id: assessment.id,
    title: assessment.title ?? "",
    date: assessment.date ? new Date(assessment.date) : new Date(),
    starttime: assessment.starttime ?? "",
    maxtime: assessment.maxtime ?? "",
    accesskey: assessment.accesskey ?? 0,
    language: assessment.language ?? "",
    maxscore: assessment.maxscore ?? 0,
    tabswitches: assessment.tabswitches ?? 0,
    active: assessment.active ?? false,
  };

  return (
    <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {initialData.title.toUpperCase()}
          </h2>
        </div>
      </div>

      <div className="w-full p-4 shadow-md border flex flex-col">
        <div className="w-full border p-1">
          <div className="flex w-full justify-between items-center px-2 py-4">
            <h4 className="text-primary font-bold">Assessment Details</h4>
            <div className="flex gap-4">
              <EditAssessment data={initialData} />
              <BackBtn />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-x-6 gap-y-4 px-2 py-4">
            <Detail label="Title" value={initialData.title} />
            <Detail
              label="Date"
              value={format(initialData.date, "dd/MM/yyyy")}
            />
            <Detail label="Start Time" value={initialData.starttime} />
            <Detail label="Duration" value={initialData.maxtime} />
            <Detail label="Access Key" value={initialData.accesskey} />
            <Detail label="Language" value={initialData.language} />
            <Detail label="Max Score" value={initialData.maxscore} />
            <Detail label="Tab Switches" value={initialData.tabswitches} />
            <Detail label="Status" value={initialData.active ? "ACTIVE" : "INACTIVE"} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-row border shadow flex-1 col-span-2">
    <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
      {label}
    </div>
    <div className="flex items-center justify-center  w-[70%] p-1">
      {value}
    </div>
  </div>
);

export default EditAssessmentx;
