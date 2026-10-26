import { Button } from '@/components/ui/button'
import { LucideBarChartHorizontalBig } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
type mdata = {
    cid: string,
    mid: string,
    uid: string
}

const MASView = ({ mdata }: { mdata: mdata }) => {
    const router = useRouter()
    // console.log(mdata)
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-primary bg-transparent hover:bg-primary/10" onClick={() => { router.push(`/admin/results/${mdata.cid}/analysis/${mdata.mid}/insights/${mdata.uid}`) }}>
                            <LucideBarChartHorizontalBig className="size-5 bg-transparent text-primary" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-primary'>
                        <p className='z-50'>Module Analysis</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </>
    )
}

export default MASView