import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
type mdata = {
    cid: string,
    mid: string
}

const MAView = ({ mdata }: { mdata: mdata }) => {
    const router = useRouter()
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-orange-500 bg-transparent hover:bg-orange-700/10" onClick={() => { router.push(`/staff/results/${mdata.cid}/analysis/${mdata.mid}`) }}>
                            <Users className="size-5 bg-transparent text-orange-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-orange-500'>
                        <p className='z-50'>Students</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    )
}

export default MAView
