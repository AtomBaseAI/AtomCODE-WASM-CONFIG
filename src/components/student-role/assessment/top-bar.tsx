"use client"

import { useState, useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Timer } from "@/components/student-role/assessment/timer"
import { AlertCircle, Check, LoaderIcon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import dynamic from 'next/dynamic';
const OnlineStatus = dynamic(() => import("@/hooks/NetworkDector"), { ssr: false });
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { Input } from "@/components/ui/input"

interface TopBarProps {
  onQuestionTypeChange: (type: string) => void
  tabSwitchCount: number
  initialTime: number
  onTimeExpired: () => void
  maxTabSwitches: number
}

export function TopBar({ onQuestionTypeChange, tabSwitchCount, initialTime, onTimeExpired, maxTabSwitches }: TopBarProps) {
  const [questionType, setQuestionType] = useState<string>("MCQ")
  const [isLoading, startTransition] = useTransition()
  const [SubmitTestModel, setSubmitTestModel] = useState(false)
  const handleQuestionTypeChange = (value: string) => {
    setQuestionType(value)
    onQuestionTypeChange(value)
  }


  const [inputValue, setInputValue] = useState("")
  const isSubmitEnabled = inputValue === "END TEST"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      setInputValue("")
      setSubmitTestModel(false)
      console.log(tabSwitchCount)
    }
    //totaltimetaken
    //totalusertabswitches
  }

  return (
    <>
      <header className="sticky top-0 z-10 w-screen border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-2 flex h-[5vh] items-center justify-between">
          <div className="flex items-center flex-row gap-2">
            <Select value={questionType} onValueChange={handleQuestionTypeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCQ">MCQ</SelectItem>
                <SelectItem value="Code">Code</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle className="my-4 border shadow-sm cursor-pointer [&_svg]:h-5 [&_svg]:w-5" />
          </div>

          <div className="flex items-center justify-end gap-4 w-2/3 h-full">
            <div className="border shadow-sm h-9 w-[1/4] p-2 px-3 rounded-sm flex justify-center items-center">
              <OnlineStatus />
            </div>
            <div className="h-9 w-[1/4] flex items-center gap-1.5 text-sm font-medium border shadow-sm p-2 px-3 rounded-sm">
              <AlertCircle className={`h-4 w-4 ${tabSwitchCount > 3 ? "text-red-500" : "text-amber-500"}`} />
              <span className={`${tabSwitchCount > 3 ? "text-red-500" : ""}`}>
                Tab Switches: {tabSwitchCount}/{maxTabSwitches}
              </span>
            </div>
            <div className="border shadow-sm h-9 w-[1/4] p-2 px-3 rounded-sm">
              <Timer initialTime={initialTime} onTimeExpired={onTimeExpired} />
            </div>
            <Button onClick={() => setSubmitTestModel(true)} className="h-9 w-[1/4]">
              <Check className="h-5 w-5 mr-2" />
              Submit Test
            </Button>
          </div>
        </div>
      </header>
      <AlertDialog open={SubmitTestModel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 py-4">
                <p>
                  Are you sure want to submit Assessment ?
                </p>
                <div className="space-y-2">
                  <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Type END TEST to confirm"
                    className="w-full"
                    autoFocus
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSubmitTestModel(false)} className='bg-red-500 text-white w-full hover:bg-red-400 hover:text-white'>Close</AlertDialogCancel>
            <AlertDialogAction className='w-full' disabled={!isSubmitEnabled || isLoading} onClick={handleSubmit}>
              {isLoading && (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
