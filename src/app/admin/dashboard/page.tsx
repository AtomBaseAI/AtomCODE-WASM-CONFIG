import React, { Suspense } from 'react';
import { Layers, Users, ShipWheel, Package, LoaderIcon } from 'lucide-react';
import { getQuestionsCount } from '@/data/questions';
import { getStudentsCount } from '@/data/students';
import { getCoursesCount } from '@/data/courses';
import { getStaffsCount } from '@/data/staffs';
import Link from 'next/link';

const Dashboard = async () => {
  const [questioncount, studentcount, coursecount, staffcount] = await Promise.all([
    getQuestionsCount(),
    getStudentsCount(),
    getCoursesCount(),
    getStaffsCount(),
  ]);

  return (
    <>
      <div className="w-full flex flex-col gap-2 justify-center items-center">
        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 w-[92%]">
          <Link href='/admin/courses'>
            <div className="flex items-center p-8 shadow-md rounded-md border hover:border-purple-600">
              <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 dark:bg-purple-950/20 rounded-md mr-6">
                <span className="h-6 w-6">
                  <Layers fill="none" />
                </span>
              </div>
              <div>
                <Suspense fallback={<LoaderIcon className='h-3 w-3 animate-spin' />}>
                  <span className="block text-2xl font-bold">{coursecount}</span>
                </Suspense>
                <span className="block text-gray-500">Total Courses</span>
              </div>
            </div>
          </Link>
          <Link href='/admin/students'>
            <div className="flex items-center p-8 shadow-md rounded-md border hover:border-purple-600">
              <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 dark:bg-purple-950/20 rounded-md mr-6">
                <span className="h-6 w-6">
                  <Users fill="none" />
                </span>
              </div>
              <div>
                <Suspense fallback={<LoaderIcon className='h-3 w-3 animate-spin' />}>
                  <span className="block text-2xl font-bold">{studentcount}</span>
                </Suspense>
                <span className="block text-gray-500">Total Students</span>
              </div>
            </div>
          </Link>
          <Link href='/admin/staffs'>
            <div className="flex items-center p-8 shadow-md rounded-md border hover:border-purple-600">
              <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 dark:bg-purple-950/20 rounded-md mr-6">
                <span className="h-6 w-6">
                  <ShipWheel fill="none" />
                </span>
              </div>
              <div>
                <Suspense fallback={<LoaderIcon className='h-3 w-3 animate-spin' />}>
                  <span className="block text-2xl font-bold">{staffcount}</span>
                </Suspense>
                <span className="block text-gray-500">Total Staffs</span>
              </div>
            </div>
          </Link>
          <Link href='/admin/questions'>
            <div className="flex items-center p-8 shadow-md rounded-md border hover:border-purple-600">
              <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 dark:bg-purple-950/20 rounded-md mr-6">
                <span className="h-6 w-6">
                  <Package fill="none" />
                </span>
              </div>
              <div>
                <Suspense fallback={<LoaderIcon className='h-3 w-3 animate-spin' />}>
                  <span className="block text-2xl font-bold">{questioncount}</span>
                </Suspense>
                <span className="block text-gray-500">Total Questions</span>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
