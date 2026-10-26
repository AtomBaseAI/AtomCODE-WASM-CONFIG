'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import {
    AlarmClock, CalendarCheck, Clock,
    Code, FlaskConical, Puzzle, ShieldAlert
} from 'lucide-react'
import { AssessmentTableSchema } from '@/schemas/student/assessment-schema'

type AssessmentType = z.infer<typeof AssessmentTableSchema>

const getStatusDetails = (data: AssessmentType) => {
    let border = 'border-purple-500'
    let label = 'Upcoming'
    let isClickable = false
    let cursor = 'cursor-not-allowed'

    switch (data.status) {
        case 'start':
            border = 'border-green-500'
            label = 'Start'
            isClickable = true
            cursor = 'cursor-pointer'
            break
        case 'resume':
            border = 'border-green-500'
            label = 'Continue'
            isClickable = true
            cursor = 'cursor-pointer'
            break
        case 'retake':
            border = 'border-orange-500'
            label = 'Retake'
            isClickable = true
            cursor = 'cursor-pointer'
            break
        case 'expired':
            border = 'border-red-500'
            label = 'Expired'
            break
        default:
            // status is 'upcoming'
            border = 'border-purple-500'
            label = 'Upcoming'
    }

    return { status: data.status, isClickable, border, label, cursor }
}

const AssessmentCard = ({ data }: { data: AssessmentType }) => {
    const router = useRouter()
    const { status, isClickable, border, label, cursor } = getStatusDetails(data)

    const handleClick = () => {
        if (isClickable) {
            router.push(`/student/assessment/${data.courseid}/${data.assessmentid}`)
        }
    }

    return (
        <div
            className={`shadow-lg rounded-md overflow-hidden w-1/4 order-first lg:order-none border border-${border} ${cursor}`}
            onClick={handleClick}
        >
            <div className="py-5 px-6 sm:px-8">
                <div className='flex w-full max-h-50 flex-row items-center justify-center py-4 gap-1 border-b-2'>
                    <div className='w-1/4 flex justify-center items-center'>
                        <FlaskConical className='h-10 w-10 text-primary' />
                    </div>
                    <div className='w-3/4 flex flex-col items-center justify-start h-14'>
                        <h2 className="w-full text-left text-lg font-semibold text-primary line-clamp-1">{data.title}</h2>
                        <p className='w-full text-sm text-left'>{data.coursetitle}</p>
                    </div>
                </div>

                <div className='w-full flex flex-row items-center justify-center h-full py-2 pt-4'>
                    <div className='flex flex-col items-center justify-center w-1/3'>
                        <CalendarCheck className='text-primary my-2' />
                        <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                            {data.assessmentdate}
                            <span className='text-xs font-semibold text-primary'>Date</span>
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-center w-1/3'>
                        <AlarmClock className='text-primary my-2' />
                        <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                            {data.starttime}
                            <span className='text-xs font-semibold text-primary'>Time</span>
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-center w-1/3'>
                        <Clock className='text-primary my-2' />
                        <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                            {data.maxtime}
                            <span className='text-xs font-semibold text-primary'>Duration</span>
                        </div>
                    </div>
                </div>

                <div className='w-full flex flex-row items-center justify-center h-full py-4'>
                    <div className='flex flex-col items-center justify-center w-1/3'>
                        <Code className='text-primary my-2' />
                        <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                            {data.codecount}
                            <span className='text-xs font-semibold text-primary'>Code</span>
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-center w-1/3'>
                        <Puzzle className='text-primary my-2' />
                        <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                            {data.mcqcount}
                            <span className='text-xs font-semibold text-primary'>MCQ</span>
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-center w-1/3'>
                        <ShieldAlert className='text-primary my-2' />
                        <div className="flex flex-col h-full items-center justify-center text-sm font-bold">
                            {data.tabswitches}
                            <span className='text-xs font-semibold text-primary'>Tab Switches</span>
                        </div>
                    </div>
                </div>

                <div className="w-full rounded-xl flex items-center justify-center my-3">
                    <span className={`text-sm w-full text-center font-semibold px-3 py-2 rounded-sm ${status === 'expired'
                        ? 'bg-red-100 text-red-600'
                        : status === 'retake'
                            ? 'bg-orange-100 text-orange-600'
                            : status === 'start'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-purple-100 text-purple-600'
                        }`}>
                        {label}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default AssessmentCard
