import { auth } from "@/auth";
import Sidebar from "@/components/staff/sidebar";
import Topbar from "@/components/topbar";
import React from "react";
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    // w-full instead of min-w-screen: 100vw includes the vertical scrollbar's
    // width, so min-w-screen forced a permanent ~8px horizontal overflow
    // (horizontal scrollbar + clipped sidebar) as soon as any page scrolled.
    <main className="flex min-h-svh w-full flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={session?.user?.name as string} email={session?.user?.email as string} image={session?.user?.image as string} />
        {/* flex-1 (not h-full): fills exactly the leftover height under the
            topbar so short pages never force a vertical scrollbar */}
        <div className="flex w-full flex-1 flex-col items-center p-4">
          {children}
        </div>
      </div>
    </main>
  )
}
