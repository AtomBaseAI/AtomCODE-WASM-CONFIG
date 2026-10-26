"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, PieChart, Package, Layers, ShieldCheck, Users, ShipWheel, Minimize, Maximize, Code, Code2, Terminal } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { enterFullscreen, exitFullscreen, fullscreenCheck } from '@/hooks/fullscreen'

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const [fullscreen, setFullscreen] = useState(fullscreenCheck())

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(fullscreenCheck())

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (fullscreen) {
      exitFullscreen()
    } else {
      const element = document.documentElement
      enterFullscreen(element)
    }
  }


  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <aside className="sticky top-0 left-0 z-50 flex h-svh w-14 flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg sm:w-20">
      {/* min-h-0 + flex-1: the nav scrolls internally on very short viewports
          instead of pushing the bottom cluster (settings icon) off-screen */}
      <div className="flex min-h-0 flex-1 flex-col justify-between">
        <nav className="my-4 flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto">

          <span onClick={() => router.push("/staff/dashboard")} className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/staff/dashboard') ? 'text-primary border-primary' : ''}`}>
            <span className='h-6 w-6'>
              <LayoutDashboard fill='none' />
            </span>
          </span>

          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <span onClick={() => router.push("/staff/courses")} className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/staff/courses') ? 'text-primary border-primary' : ''}`}>
                  <span className='h-6 w-6'>
                    <Layers fill='none' />
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Courses</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <span onClick={() => router.push("/staff/results")} className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/staff/results') ? 'text-primary border-primary' : ''}`}>
                  <span className='h-6 w-6'>
                    <PieChart fill='none' />
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <span onClick={() => router.push("/staff/workspace")} className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/staff/workspace') ? 'text-primary border-primary' : ''}`}>
                  <span className='h-6 w-6'>
                    <Terminal fill='none' />
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Workspace</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <span onClick={() => router.push("/staff/ide")} className={`inline-flex items-center justify-center border-l-4 border-transparent py-3 transition-colors cursor-pointer ${isActive('/staff/ide') ? 'text-primary border-primary' : ''}`}>
                  <span className='h-6 w-6'>
                    <Code2 fill='none' />
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Open IDE</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </nav>


        {/* Auto height (was fixed h-30 < content): the fixed 120px box made
            the fullscreen/theme/settings cluster overflow the h-screen aside,
            growing the page (vertical scrollbar) and clipping the gear icon */}
        <div className="flex w-full flex-col items-center pb-3 ">
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-primary bg-transparent hover:bg-transparent my-1 border-0 shadow-none text-black dark:text-white  cursor-pointer"
                  size="icon"
                  onClick={toggleFullscreen}>
                  {fullscreen ? (
                    <Minimize className='h-6 w-6 text-primary' />
                  ) : (
                    <Maximize className='h-6 w-6' />
                  )}
                  <span className="sr-only">Toggle fullscreen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='z-50'>Fullscreen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                <span onClick={() => router.push('/staff/settings')} className={`inline-flex items-center justify-center border-l-4 border-transparent py-2 my-1 w-full transition-colors  cursor-pointer ${isActive('/staff/settings') ? 'text-primary border-primary' : ''}`}>
                  <span className='h-6 w-6'>
                    <Settings fill='none' />
                  </span>
                </span>
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
