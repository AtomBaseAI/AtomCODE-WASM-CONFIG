import { Eye } from 'lucide-react'

const ViewReference = ({ link }: { link: string }) => {
    return (
        <>
            <a href={link} target="_blank" rel="noopener noreferrer" className=" h-9 w-9 flex justify-center items-center border rounded-md border-rose-500 bg-transparent hover:bg-rose-700/10">
                <Eye className="size-5 bg-transparent text-rose-500" />
            </a>
        </>
    )
}

export default ViewReference