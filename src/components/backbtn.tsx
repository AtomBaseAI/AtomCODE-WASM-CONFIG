"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import { useRouter } from 'next/router'

const BackBtn = () => {
    const router = useRouter()
    return (
        <>
            <Button size='icon' className="" onClick={() => router.back()}>
                <ChevronLeft className="h-7 w-7"/>
            </Button>
        </>
    )
}

export default BackBtn