"use client"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate, getISTParts, istTodayLocalStart, istWallClock } from "@/lib/utils"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
}

export function DateTimePicker({ value, onChange, disabled, placeholder = "Select date & time" }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState<string>("10:30:00")

  // Extract time from existing date value — read as app-timezone (IST)
  // wall clock, NOT the browser's local system timezone.
  React.useEffect(() => {
    if (value) {
      const parts = getISTParts(value)
      if (parts) {
        const pad = (n: number) => n.toString().padStart(2, "0")
        setTime(`${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`)
      }
    }
  }, [value])

  // Combine the picked LOCAL calendar day (what the admin clicked in the
  // calendar) with the typed time, interpreted as Asia/Kolkata wall clock —
  // stores the exact IST instant regardless of the browser's timezone.
  const combineDateTime = (pickedDate: Date, timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number)
    return istWallClock(
      pickedDate.getFullYear(),
      pickedDate.getMonth() + 1,
      pickedDate.getDate(),
      hours,
      minutes,
      seconds,
    )
  }

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && onChange) {
      const combined = combineDateTime(selectedDate, time)
      onChange(combined)
    }
    setOpen(false)
  }

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (value && onChange) {
      const combined = combineDateTime(value, newTime)
      onChange(combined)
    }
  }

  // "Today" anchored to the app timezone (Asia/Kolkata): disable every
  // calendar day before the current IST calendar day.
  const today = istTodayLocalStart()

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={disabled} className="w-full justify-between font-normal bg-transparent">
              {value ? formatDate(value) : "Select date"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              disabled={(date) => date < today}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-32">
        <Input
          type="time"
          step="1"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={disabled}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}
