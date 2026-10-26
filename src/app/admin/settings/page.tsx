import { auth } from "@/auth";
import AdminPassword from "@/components/settings/admin-password";
import Image from "next/image"


const getSessionAdmin = async () => {
  const session = await auth();
  return session;
}
const Settings = async () => {
  const adminsession = await getSessionAdmin();
  if (adminsession?.user?.id === undefined) {
    return null;
  }
  const adminx = {
    id: adminsession?.user?.id,
    name: adminsession?.user?.name,
    email: adminsession?.user?.email
  };

  return (
    <>
      {/* flex-1 instead of rigid h-[80vh]: centers the card in the actual
          leftover space under the topbar — no forced page overflow */}
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <div className="w-full max-w-md sm:w-2/3 lg:w-1/3 shadow rounded-lg overflow-hidden dark:border dark:border-slate-700">
          <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="flex flex-row absolute top-2 right-2 w-1/2 items-center justify-end gap-2">
              <AdminPassword uid={adminx.id} />
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-300 mt-6">{adminx.name}</h1>
            <div className="mt-2 flex justify-center items-center text-gray-500">
              <span>{adminx.email}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings