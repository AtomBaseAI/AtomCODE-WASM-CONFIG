import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
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

const AEdit = ({ adata }: { adata: adata }) => {
    const router = useRouter()
    return (
        <>
            <TooltipProvider>
                <Tooltip >
                    <TooltipTrigger asChild>
                        <Button variant='outline' size='icon' className="border-primary bg-transparent hover:bg-purple-700/10"
                            onClick={() => { router.push(`/admin/courses/${adata.cid}/assessments/${adata.aid}/edit`) }}>
                            <Pencil className="size-5 bg-transparent text-primary" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='bg-primary'>
                        <p className='z-50'>Edit Assessment</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </>
    )
}

export default AEdit