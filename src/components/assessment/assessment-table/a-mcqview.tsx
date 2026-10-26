import { Button } from '@/components/ui/button'
import { Code, Eye, Puzzle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
type adata = {
    cid: string,
    aid: string
}

const AMCQView = ({ adata }: { adata: adata }) => {
    const router = useRouter()
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-blue-500 bg-transparent hover:bg-blue-700/10"
                            onClick={() => { router.push(`/admin/courses/${adata.cid}/assessments/${adata.aid}/mcq`) }}>
                            <Puzzle className="size-5 bg-transparent text-blue-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-blue-500'>
                        <p className='z-50'>MCQ Questions</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    )
}

export default AMCQView