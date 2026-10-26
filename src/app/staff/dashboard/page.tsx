import React, { Suspense } from 'react';
import { Layers, Users, CalendarRange, Hexagon, FileVideo, Star, Book } from 'lucide-react';
import { getCoursesWithMetadata } from '@/data/staff/courses';
import { auth } from '@/auth';
import { formatDate } from '@/lib/utils';
// import { getStaffsCount } from '@/data/staffs';

const getSession = async () => {
  const session = await auth();
  return session;
}

async function fetchCourses(staffID: string) {
  const courses = await getCoursesWithMetadata(staffID)
  return courses;
}
const Dashboard = async () => {
  const staffsession = await getSession();
  if (staffsession?.user?.id === undefined) {
    return null;
  }
  const staffID = staffsession?.user.id;
  const courses = await fetchCourses(staffID)
  // console.log(courses)
  if (courses.length === 0) {
    return (
      <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
        <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-primary" >
          <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
            <Book className="h-10 w-10 text-yellow-400" />
            No Courses Enrolled !
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="w-full flex flex-row flex-wrap gap-2 justify-start items-start px-3">
        {courses.map((course) => (
          <div key={course.id} className='w-[18rem] h-[14rem] flex flex-col justify-center items-center shadow-md rounded-md border hover:border-purple-600'>
              <div className=' w-full flex flex-col justify-center items-center'>
                <div className='w-[90%] h-[20%] flex justify-start items-center flex-row mb-2'>
                  <div className='h-full flex justify-center items-center'>
                    <span className="h-10 w-10 text-purple-600 bg-purple-100 dark:bg-purple-950/20 rounded-md mr-2 flex justify-center items-center">
                      <Layers fill="none" className='h-5 w-5 ' />
                    </span>
                  </div>
                  <h2 className='text-primary font-bold line-clamp-2'>
                    {course.coursetitle}
                  </h2>
                </div>
                <div className='w-[90%] h-[85%] flex flex-col justify-start items-center gap-3'>


                  <div className='w-full flex flex-row justify-center items-center'>
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <span className="h-10 w-10 text-orange-600 bg-orange-100 dark:bg-orange-950/20 rounded-md mr-2 flex justify-center items-center">
                        <Users className='w-5 h-5' />
                      </span>
                      <p className='font-semibold'>
                        {course.studentscount}
                      </p>
                    </div>
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <span className="h-10 w-10 text-cyan-600 bg-cyan-100 dark:bg-cyan-950/20 rounded-md mr-2 flex justify-center items-center">
                        <Hexagon className='w-5 h-5' />
                      </span>
                      <p className='font-semibold'>
                        {course.modulescount}
                      </p>
                    </div>
                  </div>

                  <div className='w-full flex flex-row justify-center items-center'>
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <span className="h-10 w-10 text-rose-600 bg-rose-100 dark:bg-rose-950/20 rounded-md mr-2 flex justify-center items-center">
                        <FileVideo className='w-5 h-5' />
                      </span>
                      <p className='font-semibold'>
                        {course.referencescount}
                      </p>
                    </div>
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <span className="h-10 w-10 text-lime-600 bg-lime-100 dark:bg-lime-950/20 rounded-md mr-2 flex justify-center items-center">
                        <Star className='w-5 h-5' />
                      </span>
                      <p className='font-semibold'>
                        {course.feedbackscount}
                      </p>
                    </div>
                  </div>


                  <div className='w-full flex flex-row justify-center items-center'>
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <span className="h-9 w-9 text-green-600 bg-green-100 dark:bg-green-950/20 rounded-md mr-2 flex justify-center items-center">
                        <CalendarRange className='w-4 h-4' />
                      </span>
                      <p className='font-normal text-sm'>
                        {formatDate(course.startdate)}
                      </p>
                    </div>
                    <div className="w-1/2 flex flex-row justify-start items-center">
                      <span className="h-9 w-9 text-red-600 bg-red-100 dark:bg-red-950/20 rounded-md mr-2 flex justify-center items-center">
                        <CalendarRange className='w-4 h-4' />
                      </span>
                      <p className='font-normal text-sm'>
                        {formatDate(course.enddate)}
                      </p>
                    </div>
                  </div>


                </div>
              </div>
            </div>
        ))
        }
      </div>
    </>
  );
};

export default Dashboard;
