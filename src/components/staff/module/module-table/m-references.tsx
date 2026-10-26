import { Button } from '@/components/ui/button'
import { FileVideo } from 'lucide-react'
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

const MReferences = ({ mdata }: { mdata: mdata }) => {
    const router = useRouter()
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-rose-500 bg-transparent hover:bg-rose-700/10"
                            onClick={() => { router.push(`/staff/courses/${mdata.cid}/modules/${mdata.mid}/references`) }}>
                            <FileVideo className="size-5 bg-transparent text-rose-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-rose-500'>
                        <p className='z-50'>Reference Materials</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    )
}

export default MReferences
