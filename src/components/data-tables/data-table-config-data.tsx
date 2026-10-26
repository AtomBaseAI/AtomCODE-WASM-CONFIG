import {
  BookA,
  CalendarClock,
  Users,
  Clock,
  CheckCircle2,
  CircleDotDashed,
  MinusCircle
} from "lucide-react"

export const departments = [

  {
    value: "cse",
    label: "CSE",
    icon: BookA,
  },
  {
    value: "it",
    label: "IT",
    icon: BookA,
  },
  {
    value: "iot",
    label: "IOT",
    icon: BookA,
  },
  {
    value: "cys",
    label: "Cyber Security",
    icon: BookA,
  },
  {
    value: "aids",
    label: "AI & DS",
    icon: BookA,
  },
  {
    value: "aiml",
    label: "AI & ML",
    icon: BookA,
  },
  {
    value: "mech",
    label: "Mechanical",
    icon: BookA,
  },
  {
    value: "civil",
    label: "Civil",
    icon: BookA,
  },
  {
    value: "eee",
    label: "EEE",
    icon: BookA,
  },
  {
    value: "ece",
    label: "ECE",
    icon: BookA,
  },
]


export const sections = [

  {
    value: "a",
    label: "A",
    icon: Users,
  },
  {
    value: "b",
    label: "B",
    icon: Users,
  },
  {
    value: "c",
    label: "C",
    icon: Users,
  },

  {
    value: "d",
    label: "D",
    icon: Users,
  },
  {
    value: "e",
    label: "E",
    icon: Users,
  },
  {
    value: "f",
    label: "F",
    icon: Users,
  },
]


export const bathces = [
  {
    label: "2021-2025",
    value: "2021-2025",
    icon: CalendarClock,
  },
  {
    label: "2022-2026",
    value: "2022-2026",
    icon: CalendarClock,
  },
  {
    label: "2023-2027",
    value: "2023-2027",
    icon: CalendarClock,
  },
  {
    label: "2024-2028",
    value: "2024-2028",
    icon: CalendarClock,
  },
]

export const modulefilters = [
  {
    value: "retake",
    label: "Retake",
    icon: CircleDotDashed,
    bg: "bg-orange-500/60",
  },
  {
    value: "submitted",
    label: "Submitted",
    icon: CheckCircle2,
    bg: "bg-green-500/60",
  },
  {
    value: "started",
    label: "In Progress",
    icon: Clock,
    bg: "bg-blue-500/60",
  },
  {
    value: "not started",
    label: "Not Started",
    icon: MinusCircle,
    bg: "bg-red-500/60",
  },
]
import {
  SignalHigh,
  SignalLow,
  SignalMedium,
  Terminal
} from "lucide-react"

export const languages = [

  {
    value: "java",
    label: "Java",
    icon: Terminal,
  },
  {
    value: "cpp",
    label: "C++",
    icon: Terminal,
  },
  {
    value: "c",
    label: "C",
    icon: Terminal,
  },
  {
    value: "python",
    label: "Python",
    icon: Terminal,
  },
]