import BackBtn from '@/components/backbtn'
import { columns } from '@/components/staff/results/result-matrix/rc-columns';
import { ResultMatrixTable } from '@/components/results/completion/result-matrix table/rc-data-table';
import { courseCompletionData } from '@/data/results';
import { ResultTableStudentType } from '@/schemas/result-matrix-schema';
import React from 'react'
import CompletionExportButton from '@/export/result-export/completion-export-button';

const CourseCompletion = async ({ params }: { params: Promise<{ cid }> }) => {
  const { cid } = await params
  // const courseid = parseInt(cid, 10)
  const CourseCompletionDatax = await courseCompletionData(cid)
  if (CourseCompletionDatax === null) {
    return (
      <>
        No Data Available !
      </>
    )
  }
  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full justify-center items-center">
        <div className="flex flex-wrap items-center justify-between gap-2 space-y-2 w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Result Matrix
            </h2>

            <p className="text-muted-foreground">
              {CourseCompletionDatax?.coursename}
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            <CompletionExportButton data={CourseCompletionDatax?.data as ResultTableStudentType[]} courseName={CourseCompletionDatax?.coursename} />
            <BackBtn />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 md:gap-8 h-full w-full">
          <div className="border shadow-sm rounded-lg p-2">
            <ResultMatrixTable data={CourseCompletionDatax?.data as ResultTableStudentType[]} columns={columns} />
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseCompletion