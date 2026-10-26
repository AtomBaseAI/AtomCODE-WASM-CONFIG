import AssessmentCard from "@/components/student-role/assessment/client/assessmentcard"
import { FlaskConical, User } from "lucide-react"
import { auth } from '@/auth'
import { z } from "zod"
import { AssessmentTableSchema } from "@/schemas/student/assessment-schema"
import { getAssessmentsByUserId } from "@/data/student/assessments"

async function fetchAssessments(uid: string) {
  const assessments = await getAssessmentsByUserId(uid)
  return z.array(AssessmentTableSchema).parse(assessments)
}

const getSessionUserID = async () => {
  const session = await auth();
  return session?.user?.id
}


const Assesments = async () => {
  const uid = await getSessionUserID()
  if (uid === null || uid === undefined) {
    return (
      <>
        <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
          <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-primary" >
            <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
              <User className="h-10 w-10 text-red-400" />
              Not Logged in !
            </div>
          </div>
        </div>
      </>
    )
  }
  const assessmentData = await fetchAssessments(uid)
  return (
    <div className='w-full flex flex-col gap-2'>
      {assessmentData.length === 0 ? (
        <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
          <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-primary" >
            <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
              <FlaskConical className="h-10 w-10 text-yellow-400" />
              No Assessments Enrolled !
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full mx-auto justify-start justify-items-start flex flex-wrap gap-x-6 gap-y-6">
          {assessmentData.map((assessment, index) => (
            <AssessmentCard key={index} data={assessment} />
          ))
          }
        </div>
      )}
    </div>
  )
}

export default Assesments