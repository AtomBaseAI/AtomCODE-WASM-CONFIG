import { Loader, Loader2 } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (

    <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
      <Loader2 className='animate-spin h-10 w-10' />
    </div>
  )
}

export default Loading