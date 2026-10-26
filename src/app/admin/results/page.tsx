import { getAllCourses } from "@/data/courses"
import { CourseTableSchema } from "@/schemas/course-schema"
import { Book, DownloadCloud, PieChart, Trophy } from "lucide-react"
import Link from "next/link"
import React from "react"
import { z } from "zod"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

async function fetchCourses() {
  const courses = await getAllCourses()
  return z.array(CourseTableSchema).parse(courses)
}


const Results = async () => {
  const coursesData = await fetchCourses()
  // console.log(coursesData)
  return (
    <div className='w-full flex flex-col gap-2 mx-8 px-8'>
      <div className="h-full w-full mx-auto flex flex-wrap flex-row justify-start gap-x-4 gap-y-4">
        {
          coursesData.length === 0 ? (
            <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
              <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-primary" >
                <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
                  <Book className="h-10 w-10 text-yellow-400" />
                  No Courses Available !
                </div>
              </div>
            </div>
          ) : (
            coursesData.map((course, index) => (
              <React.Fragment key={index}>
                <div className="w-[24%] h-[8rem] shadow-lg rounded-md overflow-hidden order-first lg:order-none border hover:border-primary" >
                  <div className="px-6 sm:px-8 h-2/3">
                    <div className='flex w-full h-full flex-row items-center justify-center'>
                      <div className='w-full flex items-center justify-start h-14'>
                        <h2 className="text-sm sm:text-2xl font-semibold">{course.title}</h2>
                      </div>
                    </div>
                  </div>
                  <div className='w-full flex flex-row  justify-center h-1/3 border-t-2'>
                    <TooltipProvider>
                      <Tooltip >
                        <TooltipTrigger asChild>
                          <Link href={`/admin/results/${course.id}/leaderboard`} className='flex flex-row items-center justify-center w-full h-full border-r-2 dark:bg-yellow-600/10 hover:dark:bg-yellow-600/20 bg-yellow-300/10 hover:bg-yellow-300/20 text-sm font-bold '>
                            <Trophy className="h-5 w-5  text-yellow-500" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side='bottom' className='bg-yellow-500'>
                          <p className='z-50'>Leaderboard</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip >
                        <TooltipTrigger asChild>
                          <Link href={`/admin/results/${course.id}/analysis`} className='flex flex-col items-center justify-center w-full h-full  border-r-2 dark:bg-primary/15 hover:dark:bg-primary/25 bg-primary/10 hover:bg-primary/20 text-sm font-bold'>
                            <PieChart className="h-5 w-5  text-purple-600" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side='bottom' className='bg-purple-500'>
                          <p className='z-50'>Performance</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip >
                        <TooltipTrigger asChild>
                          <Link href={`/admin/results/${course.id}/completion`} className='flex flex-col items-center justify-center w-full h-full  dark:bg-green-600/10 bg-green-300/10 hover:dark:bg-green-600/20 hover:bg-green-300/20 text-sm font-bold'>
                            <DownloadCloud className="h-5 w-5  text-green-600" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side='bottom' className='bg-green-500'>
                          <p className='z-50'>Result Matrix</p>
                        </TooltipContent>
                      </Tooltip>

                    </TooltipProvider>
                  </div>
                </div>
              </React.Fragment>
            ))
          )
        }
      </div>
    </div >
  )
}

export default Results