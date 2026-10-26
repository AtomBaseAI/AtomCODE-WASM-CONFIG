"use client"
import * as z from "zod";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/student-role/assessment/top-bar"
import { TabSwitchAlert } from "@/components/student-role/assessment/tab-switch-alert"
import { UserAssessmentLiveData } from "@/schemas/student/assessment-schema"
import AssessmentMCQView from "../mcq/assessment-mcq-view";
import AssessmentCodeView from "../code/assessment-code-view";


type UserAssessmentLiveDataType = z.infer<typeof UserAssessmentLiveData>
interface Props {
  data: UserAssessmentLiveDataType
  uaid: string
  uid: string
  aid: string
}
export default function UserAssessmentHome({ data, uaid, aid, uid }: Props) {
  const router = useRouter()
  const [questionType, setQuestionType] = useState<string>("MCQ")
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showAlert, setShowAlert] = useState(false)


  // console.log(data)
  useEffect(() => {
    const testInProgress = localStorage.getItem("testInProgress")
    if (!testInProgress) {
      // router.push("/student/assessments/")
      return
    }
    // if (data.mcqstatus === 'submitted' && (data.questionstatus === null || !data.questionstatus)) {
    //   setQuestionType("Code")
    // } else if (data.questionstatus === 'submitted' && (data.mcqstatus === null || !data.mcqstatus)) {
    //   setQuestionType("MCQ")
    // } else {
    //   setQuestionType("MCQ")
    // }
    const storedCount = localStorage.getItem("tabSwitchCount")
    if (storedCount) {
      setTabSwitchCount(Number.parseInt(storedCount))
    }

  }, [router])

  const handleTabSwitch = () => {
    const newCount = tabSwitchCount + 1
    setTabSwitchCount(newCount)
    localStorage.setItem("tabSwitchCount", newCount.toString())
    setShowAlert(true)

    if (newCount >= data.maxtabswitches) {
      endTest("Maximum tab switches reached! Your test has ended.")
    }
  }

  const endTest = (message: string) => {
    alert(message)
    localStorage.removeItem("testInProgress")
    // router.push("/student/assessment/1/1/")
  }

  const handleTimeExpired = () => {
    endTest("Time's up! Your test has ended.")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TabSwitchAlert
        open={showAlert}
        onOpenChange={setShowAlert}
        tabSwitchCount={tabSwitchCount}
        maxTabSwitches={data.maxtabswitches}
        onTabSwitch={handleTabSwitch}
        />
      <TopBar
        onQuestionTypeChange={setQuestionType}
        tabSwitchCount={tabSwitchCount}
        initialTime={parseInt(data.remainingtime)}
        onTimeExpired={handleTimeExpired}
        maxTabSwitches={data.maxtabswitches}
      />
      <main className="h-full w-screen">
        {questionType === "MCQ" ? (
          data.mcq ? (
            <AssessmentMCQView data={data.mcq} status={data.mcqstatus || ""} uaid={uaid} />
          ) : (
            <div>No MCQs available</div>
          )
        ) : questionType === "Code" ? (
          data.code ? (
            <AssessmentCodeView questions={data.code} status={data.questionstatus || ""} aid={aid} uaid={uaid} uid={uid} />
          ) : (
            <div>No Coding Questions available</div>
          )
        ) : null}
      </main>
    </div>
  )
}
