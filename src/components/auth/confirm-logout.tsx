"use client"

import * as React from "react"
import { Loader, LogOut, Power } from "lucide-react"
import { logout } from "@/actions/logout"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

/**
 * Logout trigger + confirmation dialog, shared by every role's topbar
 * (admin, staff, student — see src/components/topbar.tsx).
 *
 * Clicking the power icon opens a simple BUTTON-BASED confirmation
 * (no typed phrase needed):
 *   Cancel → stays signed in, dialog closes
 *   Logout → runs the logout server action (clear session, redirect /login)
 *
 * The dialog stays open with a spinner until the sign-out completes, and
 * cannot be dismissed mid-logout (Escape / Cancel are guarded), so the user
 * never ends up in a half-signed-out state looking at private data.
 */
const ConfirmLogout = () => {
  const [open, setOpen] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Server action: signOut({ redirect: false }) + redirect("/login").
      // Navigation is performed by the action's redirect itself.
      await logout()
    } catch {
      // If the action itself fails (no redirect happened), restore the
      // dialog so the user can retry.
      setIsLoggingOut(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Never close mid-logout (Escape key etc.) — avoids a
        // half-signed-out state with the dialog gone.
        if (!isLoggingOut) setOpen(next)
      }}
    >
      <button
        type="button"
        aria-label="Log out"
        aria-haspopup="dialog"
        className="relative p-2 text-gray-400 hover:bg-red-400 hover:text-white focus:bg-gray-100 focus:text-gray-600 rounded-full"
        onClick={() => setOpen(true)}
      >
        <span className="h-6 w-6">
          <Power fill="none" />
        </span>
      </button>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? You will need to sign in again to
            access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid w-full grid-cols-2 gap-2">
          <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader className="animate-spin" />
            ) : (
              <LogOut fill="none" />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmLogout
