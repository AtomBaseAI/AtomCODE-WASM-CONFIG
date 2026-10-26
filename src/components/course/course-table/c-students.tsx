import { Button } from '@/components/ui/button'
import { Hexagon, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
const CStudents = ({ cid }: { cid: string }) => {
    const router = useRouter()
    return (
        <>

            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-fuchsia-500 bg-transparent hover:bg-fuchsia-700/10" onClick={() => { router.push(`/admin/courses/${cid}/students`) }}>
                            <Users className="size-5 bg-transparent text-fuchsia-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-fuchsia-500'>
                        <p className='z-50'>Students</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </>
    )
}

export default CStudents