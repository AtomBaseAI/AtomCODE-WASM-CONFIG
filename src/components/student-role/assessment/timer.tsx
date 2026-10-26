"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TimerProps {
  initialTime: number // in seconds
  onTimeExpired?: () => void
}

export function Timer({ initialTime, onTimeExpired }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1
          if (newTime <= 0 && onTimeExpired) {
            onTimeExpired()
          }
          return newTime
        })
      }, 1000)
    } else if (timeRemaining === 0) {
      setIsRunning(false)
      if (onTimeExpired) {
        onTimeExpired()
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, onTimeExpired])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium w-full">
      <div className="h-full w-[20%] flex justify-center items-center">
        <Clock className="h-4 w-4" />
      </div>
      <div className="h-full w-[4rem] flex justify-center items-center">
        <span className={`${timeRemaining < 300 ? "text-red-500" : ""}`}>{formatTime(timeRemaining)}</span>
      </div>
    </div>
  )
}
