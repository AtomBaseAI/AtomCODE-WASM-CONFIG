import { auth } from '@/auth';
import UserAssessmentHome from '@/components/student-role/assessment/client/assessment-home'
import { getAssessmentDataByUAID } from '@/data/student/assessments';
import { UserAssessmentLiveData } from '@/schemas/student/assessment-schema';
import { CircleSlash, FlaskConical, Link } from 'lucide-react';
import React from 'react'

const getAssessmentData = async (uaid: string, aid: string, uid: string) => {
  const assessmentData = await getAssessmentDataByUAID(uaid, aid, uid);
  return UserAssessmentLiveData.parse(assessmentData)
}
const getSessionUserID = async () => {
  const session = await auth();
  return session?.user?.id
}
const Assessment = async ({ params }: { params: Promise<{ uaid: string, aid: string }> }) => {

  const { uaid, aid } = await params
  const uid = await getSessionUserID()
  if (uid === null || uid === undefined) {
    return (
      <>
        <div className="w-full h-screen flex flex-col gap-2 justify-center items-center">
          <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-red-500" >
            <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-4">
              <CircleSlash className="h-10 w-10 text-red-400" />
              Session Expired !
            </div>
          </div>
          <Link href='/student/dashboard' className=" w-[20rem] bg-primary hover:bg-primary/80 h-9 rounded-md text-white font-semibold flex justify-center items-center"> Home </Link>
        </div>
      </>
    )
  }
  const AssessmentRecord = await getAssessmentData(uaid, aid, uid)
  // console.log(AssessmentRecord)
  const renderContent = () => {
    if (!AssessmentRecord) {
      return (
        <div className="shadow-lg rounded-md overflow-hidden w-[20rem] border hover:border-primary">
          <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
            <FlaskConical className="h-10 w-10 text-red-400" />
            Assessment Session Expired!
          </div>
        </div>
      )
    }

    if (AssessmentRecord.status === 'submitted') {
      return (
        <div className="shadow-lg rounded-md overflow-hidden w-[20rem] border hover:border-primary">
          <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
            <FlaskConical className="h-10 w-10 text-green-400" />
            Assessment Submitted !
          </div>
        </div>
      )
    }
    return null
  }
  return (
    <div>
      {
        AssessmentRecord && (AssessmentRecord.status === 'started' || AssessmentRecord.status === 'retake') ? (
          <>
            <UserAssessmentHome data={AssessmentRecord} uaid={uaid} aid={aid} uid={uid} />
          </>
        ) : (
          <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
            {renderContent()}
          </div>
        )
      }
    </div>
  )
}

export default Assessment