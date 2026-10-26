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
export const difficulties = [
  {
    label: "Easy",
    value: "easy",
    icon: SignalLow,

  },
  {
    label: "Medium",
    value: "medium",
    icon: SignalMedium,
  },
  {
    label: "Hard",
    value: "hard",
    icon: SignalHigh,
  }
]
