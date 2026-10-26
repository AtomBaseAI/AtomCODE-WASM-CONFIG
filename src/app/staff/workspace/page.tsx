import { auth } from '@/auth';
import ModuleSelector from '@/components/workspace/module-selector';
import { getAllCoursesModules } from '@/data/staff/courses';
import { Book } from 'lucide-react';
import React from 'react'


const getSession = async () => {
    const session = await auth();
    return session;
}

async function fetchCourses(staffID: string) {
    const courses = await getAllCoursesModules(staffID)
    return courses;
}

const WorkSpace = async () => {
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
        <div className="w-full h-[80vh] flex flex-col gap-2 justify-center items-center">

            <ModuleSelector courses={courses} />
        </div>
    )
}

export default WorkSpace