import { auth } from '@/auth';
import PrepareAssessment from '@/components/student-role/assessment/client/assessment-prepare';
import { getAssessmentDataByAssessmentIdUserId } from '@/data/student/assessments';
import { CircleSlash } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import { z } from "zod"

const getSessionUserID = async () => {
    const session = await auth();
    return session?.user?.id
}
const getAssessmentData = async (uid: string, aid: string) => {
    const assessmentData = await getAssessmentDataByAssessmentIdUserId(aid, uid);
    return assessmentData
}
const AssessmentKey = async ({ params }: { params: Promise<{ cid: string, aid: string }> }) => {

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
    const { cid, aid } = await params
    const AssessmentData = await getAssessmentData(uid, aid)
    // console.log(AssessmentData)
    return (
        <>
            <PrepareAssessment cid={cid} aid={aid} uid={uid} data={AssessmentData} />
        </>
    )
}

export default AssessmentKey