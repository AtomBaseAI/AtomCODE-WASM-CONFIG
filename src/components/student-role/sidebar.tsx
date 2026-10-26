"use client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Book, Laptop, LayoutDashboard, Settings, FlaskConical } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (path: string) => pathname.startsWith(path)
  return (
    <aside className="sticky top-0 left-0 z-50 flex h-svh w-14 flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg sm:w-20">
      {/* min-h-0 + flex-1: the nav scrolls internally on very short viewports
          instead of pushing the bottom cluster (settings icon) off-screen */}
      <div className="flex min-h-0 flex-1 flex-col justify-between">
        <nav className="my-4 flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto">
          <Link href='/student/dashboard' className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/student/dashboard') ? 'text-primary border-primary' : ''}`} >
            <LayoutDashboard fill='none' className='h-6 w-6' />
          </Link>
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href="/student/courses" className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/student/courses') ? 'text-primary border-primary' : ''}`} >
                  <Book fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Courses</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href="/student/lab" className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/student/lab') ? 'text-primary border-primary' : ''}`} >
                  <Laptop fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Labs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href="/student/assessments" className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/student/assessments') ? 'text-primary border-primary' : ''}`} >
                  <FlaskConical fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Assessments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


        </nav>
        {/* Auto height (was fixed h-30 < content): the fixed 120px box made
            the theme/settings cluster overflow the h-screen aside, growing the
            page (vertical scrollbar) and clipping the gear icon */}
        <div className="flex w-full flex-col items-center pb-3 ">
          <TooltipProvider>
            <Tooltip >
              {/* TooltipTrigger needs a real DOM child to attach its ref — the
                  AnimatedThemeToggler owns its internal ref, so bridge a span */}
              <TooltipTrigger asChild>
                <span className="my-1 inline-flex cursor-pointer">
                  <ThemeToggle />
                </span>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href='/student/settings' className={`w-full inline-flex items-center justify-center border-l-4 border-transparent py-2 my-1 transition-colors cursor-pointer ${isActive('/student/settings') ? 'text-primary border-primary' : ''}`} >
                  <Settings fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>
    </aside>

  )
}

export default Sidebar