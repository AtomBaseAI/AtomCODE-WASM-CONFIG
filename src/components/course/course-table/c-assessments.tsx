import { Button } from '@/components/ui/button'
import { FlaskConical, Hexagon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
const CAssessments = ({ cid }: { cid: string }) => {
    const router = useRouter()
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-amber-500 bg-transparent hover:bg-amber-700/10"
                            onClick={() => { router.push(`/admin/courses/${cid}/assessments`) }}>
                            <FlaskConical className="size-5 bg-transparent text-amber-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-amber-500'>
                        <p className='z-50'>Assessments</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    )
}

export default CAssessments