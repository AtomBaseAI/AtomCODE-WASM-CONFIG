"use client"

import { useEffect } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface TabSwitchAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tabSwitchCount: number
  maxTabSwitches: number
  onTabSwitch: () => void
}

export function TabSwitchAlert({
  open,
  onOpenChange,
  tabSwitchCount,
  maxTabSwitches,
  onTabSwitch,
}: TabSwitchAlertProps) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onTabSwitch()
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        onTabSwitch()
      }
    }

    const handleWindowBlur = () => {
      onTabSwitch()
    }

    const handleWindowFocus = () => {
      // Optional: log or track user returning to window
      console.log("User returned to the window.")
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common tab-switch or new tab/close tab keys
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const forbiddenKeys = ["Tab", "t", "w", "r", "n"]

      if (isCtrlOrCmd && forbiddenKeys.includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        onTabSwitch()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("focus", handleWindowFocus)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("focus", handleWindowFocus)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onTabSwitch])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Tab Switch Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              We detected that you switched tabs or left the window. Please remain on this page during your assessment.
            </p>
            <p className="font-medium">
              Tab switch count: {tabSwitchCount}/{maxTabSwitches}
            </p>
            {tabSwitchCount >= maxTabSwitches - 1 && (
              <p className="text-red-500 font-semibold">
                Warning: You have reached {tabSwitchCount} tab switches. One more switch will end your test.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-orange-500 text-white w-full hover:bg-orange-600">
            Continue
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
