import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
const CFeedbacks = ({ cid }: { cid: string }) => {
    const router = useRouter()
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-lime-500/70 bg-transparent hover:bg-lime-700/10"
                            onClick={() => { router.push(`/staff/courses/${cid}/feedbacks`) }}>
                            <Star className="size-5 bg-transparent text-lime-500/70" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-lime-500'>
                        <p className='z-50'>Feedbacks</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    )
}

export default CFeedbacks
