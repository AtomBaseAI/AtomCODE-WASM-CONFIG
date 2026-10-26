"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ClockIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type TimePickerProps = {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const TimePicker = ({ value, onChange, disabled }: TimePickerProps) => {
  const [open, setOpen] = useState(false)

  const times = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    const formatted = `${hour.toString().padStart(2, "0")}:${minute}`
    return formatted
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("justify-start w-full", !value && "text-muted-foreground")}
        >
          {value || "Pick a time"}
          <ClockIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 max-h-60 overflow-auto p-1">
        {times.map((t) => (
          <div
            key={t}
            className="px-2 py-1 rounded cursor-pointer hover:bg-accent"
            onClick={() => {
              onChange(t)
              setOpen(false)
            }}
          >
            {t}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
