import { Button } from '@/components/ui/button'
import { Hexagon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
const CModules = ({ cid }: { cid: string }) => {
    const router = useRouter()
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-cyan-500 bg-transparent hover:bg-cyan-700/10"
                            onClick={() => { router.push(`/admin/courses/${cid}/modules`) }}>
                            <Hexagon className="size-5 bg-transparent text-cyan-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-cyan-500'>
                        <p className='z-50'>Modules</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    )
}

export default CModules