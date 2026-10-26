import { auth } from "@/auth";
import UserEdit from "@/components/student-role/settings/user-edit";
import UserPassword from "@/components/student-role/settings/user-password";
import { getUserById } from "@/data/student/user";
import { Edit, Github, ImagePlus, Key, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link";


const getSessionUserID = async () => {
  const session = await auth();
  return session?.user?.id
}
const Settings = async () => {
  const uid = await getSessionUserID();
  if (uid === undefined) {
    return null;
  }
  const student = await getUserById(uid)
  const studentx = {
    id: uid,
    name: student?.name as string,
    department: student?.department as string,
    batch: student?.batch as string,
    phone: student?.phone as string,
    rollnumber: student?.rollnumber as string,
    github: student?.github as string,
    linkedin: student?.linkedin as string,
    email: student?.email as string,
    section: student?.section as string
  };
  return (
    <>
      {/* flex-1 instead of rigid h-[80vh]: centers the card in the actual
          leftover space under the topbar — no forced page overflow */}
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <div className="w-full max-w-md sm:w-2/3 lg:w-1/3 shadow rounded-lg overflow-hidden dark:border dark:border-slate-700">
          <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="flex flex-row absolute top-2 right-2 w-1/2 items-center justify-end gap-2">
              <div className="cursor-not-allowed p-2 rounded-md bg-primary border border-white hover:bg-primary/80 hover:border-slate-300">
                <ImagePlus className="h-6 w-6 text-white hover:text-gray-200/80" />
              </div>
              <UserEdit student={studentx} />
              <UserPassword uid={studentx.id} />
            </div>
            <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 flex justify-center">
              <Image
                src="https://ik.imagekit.io/atominc/academy-mini-bg-z-grad.webp"
                alt="Profile picture"
                width={150}
                height={150}
                className="rounded-full border-4 border-white shadow-lg dark:bg-slate-600/90 bg-slate-200/90"
              />
            </div>
          </div>
          <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-300 mt-6">{studentx.name}</h1>
            <p className="text-xl text-gray-600">{studentx.rollnumber}</p>
            <div className="mt-2 flex justify-center items-center text-gray-500">
              <span>{studentx.batch} {studentx.department.toUpperCase()} {studentx.section.toUpperCase()}</span>
            </div>
            {(studentx.github !== null || studentx.linkedin !== null) && (
              <div className="mt-6 flex justify-center space-x-4 w-full flex-row h-10">
                {studentx.github !== null && (
                  <Link href={studentx.github as string} target="_blank" className="w-1/2 h-2/3 flex flex-row justify-center items-center cursor-pointer">
                    <Github className="h-5 w-5 mr-2" /> Github
                  </Link>
                )}
                {studentx.linkedin !== null && (
                  <Link href={studentx.linkedin as string} target="_blank" className="w-1/2 h-2/3 flex flex-row justify-center items-center cursor-pointer">
                    <Linkedin className="h-5 w-5 mr-2" /> LinkedIn
                  </Link>
                )}
              </div>
            )
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings