
import { Book, BookAIcon, Clock, Trophy } from 'lucide-react'
import CalenderLayout from '@/components/student-role/custom-calender'
import { auth } from '@/auth';
import { getAllUserCourses } from '@/data/student/courses';

const getSessionUserID = async () => {
  const session = await auth();
  return session?.user?.id
}
const fetchUserCourse = async () => {
  const uid = await getSessionUserID();
  if (!uid) {
    throw new Error('Session Expired, Login again !');
  }
  const courses = await getAllUserCourses(uid);
  // console.log({ courses })
  return courses

}
const Dashboard = async () => {
  const userCourses = await fetchUserCourse();
  // console.log(userCourses)
  const courseCount = userCourses.length;

  return (
    <>
      <div className="w-full flex flex-col gap-2 justify-center items-center">
        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 w-[92%]">
          <div className="flex items-center p-8 shadow-md rounded-md border hover:border-purple-600">
            <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 dark:bg-purple-500/10 rounded-md mr-6">
              <Book className='h-6 w-6' />
            </div>
            <div>
              <span className="block text-2xl font-bold">{courseCount}</span>
              <span className="block text-gray-500">Courses Enrolled</span>
            </div>
          </div>
          <div className="flex items-center p-8 shadow-md rounded-md border hover:border-purple-600">
            <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16  text-purple-600 bg-purple-100 dark:bg-purple-500/10 rounded-md mr-6">
              <Clock className='h-6 w-6' />
            </div>
            <div>
              <span className="block text-2xl font-bold">{courseCount}</span>
              <span className="block text-gray-500">Courses Active</span>
            </div>
          </div>
          <div className="flex items-center p-8 shadow-md rounded-md border hover:border-green-600">
            <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 dark:bg-green-600/10 rounded-md mr-6">
              <Trophy className='h-6 w-6' />
            </div>
            <div>
              <span className="inline-block text-2xl font-bold">0</span>
              <span className="block text-gray-500">Courses Completed</span>
            </div>
          </div>

        </section>
        <section className='w-[92%]'>
          <CalenderLayout Courses={userCourses} />
        </section>
      </div>
    </>
  )
}

export default Dashboard