import { Laptop } from "lucide-react"


const Lab = () => {
  return (
    <div className="w-full h-[75vh] flex flex-col gap-2 justify-center items-center">
      <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-primary" >
        <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-5">
          <Laptop className="h-10 w-10 text-yellow-400"/>
          No Labs Enrolled !
        </div>
      </div>
    </div>
  )
}

export default Lab