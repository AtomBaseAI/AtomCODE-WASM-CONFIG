import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
const SEdit = ({uid}:{uid:string}) => {
    const router = useRouter()
    return (
        <>
            <Button variant='outline' size='icon' className="border-primary bg-transparent hover:bg-purple-700/10" onClick={() => {router.push(`/admin/students/edit/${uid}`) }}>
                <Pencil className="size-5 bg-transparent text-primary" />
            </Button>
        </>
    )
}

export default SEdit