import { auth } from "@/auth";
import StaffPassword from "@/components/settings/staff-password";
import Image from "next/image"
import { db } from "@/lib/db";
import { genSaltSync, hashSync } from "bcrypt-ts";

const getSessionstaff = async () => {
  const session = await auth();
  return session;
}

// Staff-specific own-password reset as an inline server action.
// (canonical @/actions/staff resetpasswordstaff is the admin flow: it resets a
// staff account to the default password and ignores the submitted value)
const resetOwnPassword = async (
  values: { id: string; password: string; confirmpassword: string }
) => {
  "use server";
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(values.password, salt);
  await db.staff.update({
    where: { id: values.id },
    data: { password: hashedPassword },
  });
  return { success: "Password Updated !" };
};
const Settings = async () => {
  const staffsession = await getSessionstaff();
  if (staffsession?.user?.id === undefined) {
    return null;
  }
  const staffx = {
    id: staffsession?.user?.id,
    name: staffsession?.user?.name,
    email: staffsession?.user?.email
  };

  return (
    <>
      {/* flex-1 instead of rigid h-[80vh]: centers the card in the actual
          leftover space under the topbar — no forced page overflow */}
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
        <div className="w-full max-w-md sm:w-2/3 lg:w-1/3 shadow rounded-lg overflow-hidden dark:border dark:border-slate-700">
          <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="flex flex-row absolute top-2 right-2 w-1/2 items-center justify-end gap-2">
              <StaffPassword uid={staffx.id} resetAction={resetOwnPassword} />
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-300 mt-6">{staffx.name}</h1>
            <div className="mt-2 flex justify-center items-center text-gray-500">
              <span>{staffx.email}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings