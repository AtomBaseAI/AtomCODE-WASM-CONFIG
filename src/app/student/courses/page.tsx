import { Book, CalendarCheck, CalendarX, Terminal, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { getAllUserCourses } from '@/data/student/courses'
import { auth } from '@/auth'
import { Progress } from '@/components/ui/progress'

const getSessionUserID = async () => {
  const session = await auth();
  return session?.user?.id
}

const Courses = async () => {
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
  const coursesData = await getAllUserCourses(uid);
  return (
    <>
      <div className='w-full flex flex-col gap-2'>
        {coursesData.length === 0 ? (
          <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
            <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-primary" >
              <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
                <Book className="h-10 w-10 text-yellow-400" />
                No Courses Enrolled !
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full mx-auto justify-start justify-items-start flex flex-wrap gap-x-6 gap-y-6">
            {coursesData.map((course, index) => (
              <React.Fragment key={index}>
                {
                  course.courseStatus ?
                    (
                      <Link href={`/student/courses/${course.courseId}/module`}>
                        <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-primary" >
                          <div className="py-5 px-6 sm:px-8">
                            <div className='flex w-full max-h-50 flex-row items-center justify-center py-4 gap-1  border-b-2'>
                              <div className='w-1/4 flex justify-center items-center '>
                                {
                                  course.courseLanguage === 'c' ? (
                                    <img src={`/Lang/c.svg`} alt='logo' className='h-10 w-10 object-cover' />
                                  ) : course.courseLanguage === 'cpp' ? (
                                    <>
                                      <img src={`/Lang/cpp.svg`} alt='logo' className='h-10 w-10 object-cover' />
                                    </>
                                  ) : course.courseLanguage === 'java' ? (
                                    <>
                                      <img src={`/Lang/java.svg`} alt='logo' className='h-10 w-10 object-cover' />
                                    </>
                                  ) : course.courseLanguage === 'python' ? (
                                    <>
                                      <img src={`/Lang/python.svg`} alt='logo' className='h-10 w-10 object-cover' />
                                    </>
                                  ) : (
                                    <Terminal className='text-primary border-2 h-10 w-10 border-primary' />
                                  )
                                }
                              </div>
                              <div className='w-3/4 flex items-center justify-start h-14'>
                                <h2 className="text-sm sm:text-2xl font-semibold">{course.courseName}</h2>
                              </div>
                            </div>
                            <div className='w-full flex flex-row items-center justify-center h-full py-4 '>
                              <div className='flex flex-col items-center justify-center w-1/2'>
                                <CalendarCheck className='text-green-600 my-2' />
                                <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                                  {course.courseStartDate}
                                  <span className='text-xs font-semibold'>Start Date</span>
                                </div>
                              </div>
                              <div className='flex flex-col items-center justify-center w-1/2'>
                                <CalendarX className='text-red-600 my-2' />
                                <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                                  {course.courseEndDate}
                                  <span className='text-xs font-semibold'>End Date</span>
                                </div>
                              </div>
                            </div>
                            {/* <div className="w-full rounded-xl  flex items-center justify-center order-2 md:col-start-1 md:col-end-2 md:max-w-xs lg:order-none my-3">
                              Active
                            </div> */}
                            <div className='w-full flex flex-row justify-start items-center gap-4 mt-2 mb-2'>
                              <Progress value={course.courseProgres} className='w-full' />
                              <div className='w-[20] h-full flex justify-center items-center text-primary font-bold'>
                                {course.courseProgres}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-red-500" >
                        <div className="py-5 px-6 sm:px-8">
                          <div className='flex w-full max-h-50 flex-row items-center justify-center py-4 gap-1  border-b-2'>
                            <div className='w-1/4 flex justify-center items-center '>
                              <Terminal className='text-primary border-2 h-10 w-10 border-primary' />
                            </div>
                            <div className='w-3/4 flex items-center justify-start h-14'>
                              <h2 className="text-sm sm:text-2xl font-semibold">{course.courseName}</h2>
                            </div>
                          </div>
                          <div className='w-full flex flex-row items-center justify-center h-full py-4 '>
                            <div className='flex flex-col items-center justify-center w-1/2'>
                              <CalendarCheck className='text-green-600 my-2' />
                              <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                                {course.courseStartDate}
                                <span className='text-xs font-semibold'>Start Date</span>
                              </div>
                            </div>
                            <div className='flex flex-col items-center justify-center w-1/2'>
                              <CalendarX className='text-red-600 my-2' />
                              <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                                {course.courseEndDate}
                                <span className='text-xs font-semibold'>End Date</span>
                              </div>
                            </div>
                          </div>
                          <div className="w-full rounded-xl  flex items-center justify-center order-2 md:col-start-1 md:col-end-2 md:max-w-xs lg:order-none my-3">
                            Active
                          </div>
                        </div>
                      </div>
                    )
                }
              </React.Fragment>
            ))
            }
          </div>
        )}
      </div>
    </>
  )
}

export default Courses