import { LoaderIcon } from 'lucide-react'
import React from 'react'

const loading = () => {
    return (
        <>
            <div className="w-full h-[40rem] flex flex-col gap-2 justify-center items-center">
                <LoaderIcon className="h-6 w-6 animate-spin" />
            </div>
        </>
    )
}

export default loading