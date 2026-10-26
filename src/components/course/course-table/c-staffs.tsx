import { Button } from '@/components/ui/button'
import { Hexagon, ShipWheel, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
const CStaffs = ({ cid }: { cid: string }) => {
    const router = useRouter()
    return (
        <>

            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-blue-500 bg-transparent hover:bg-blue-700/10" onClick={() => { router.push(`/admin/courses/${cid}/staffs`) }}>
                            <ShipWheel className="size-5 bg-transparent text-blue-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-blue-500'>
                        <p className='z-50'>Staffs</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </>
    )
}

export default CStaffs