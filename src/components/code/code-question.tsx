
// import OnlineStatus from '@/hooks/NetworkDector';
import { Separator } from '../ui/separator'
import dynamic from 'next/dynamic';
const OnlineStatus = dynamic(() => import("@/hooks/NetworkDector"), { ssr: false });


const CodeQuestion = ({ Question }: { Question: any }) => {
    return (
        <>
            <div className='h-full w-full flex flex-col relative'>
                <div className='h-[95%] w-full overflow-y-auto p-6'>
                    <div className='border rounded-md text-xs w-20 text-center font-semibold text-primary border-primary my-2'>
                        Question
                    </div>
                    <div className='text-2xl font-bold'>
                        {Question.title}
                    </div>
                    <Separator className='my-4' />
                    <div className='border rounded-md text-xs w-20 text-center font-semibold text-primary border-primary my-2'>
                        Description
                    </div>
                    <div className='text-md font-normal text-pretty break-words'>
                        {Question.description}
                    </div>

                    {Question.inputconstrains &&
                        (
                            <>
                                <Separator className='my-4' />
                                <div className='border rounded-md text-xs w-40 text-center font-semibold text-primary border-primary my-2'>
                                    Input Constrains
                                </div>
                                <div className='flex flex-grow flex-row justify-around items-center w-full py-2'>
                                    <div className='bg-gray-700/30 w-full h-[110px] rounded-md p-2 font-bold overflow-y-auto overflow-x-auto'>
                                        <pre>
                                            {Question.inputconstrains}
                                        </pre>
                                    </div>

                                </div>
                            </>
                        )
                    }
                    {
                        (Question.blacklist || Question.whitelist) &&
                        (
                            <>
                                <Separator className='my-4' />
                                <div className='w-full flex flex-col'>
                                    <div className='border rounded-md text-xs w-40 text-center font-semibold text-primary border-primary my-2'>
                                        Blacklist / Whitelist
                                    </div>
                                    <div className='flex flex-row w-full gap-[2%]'>
                                        {
                                            Question.blacklist &&
                                            (
                                                <div className='flex flex-col w-[48%] justify-start items-center'>
                                                    <div className='mt-2 text-primary w-full justify-start font-bold'>
                                                        Black list
                                                    </div>
                                                    <div className='flex flex-grow flex-row justify-start items-center w-full py-2'>
                                                        <div className='bg-gray-700/30 h-[110px] w-full rounded-md p-2 font-semibold overflow-y-auto overflow-x-auto'>
                                                            {Question.blacklist.split(",").map((item: string, index: number) => (
                                                                <span key={index} className="inline-block px-2 py-1 m-3 text-red-500 border border-red-500 rounded-md">
                                                                    {item.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        {
                                            Question.whitelist &&
                                            (
                                                <div className='flex flex-col w-[48%] justify-start items-center'>
                                                    <div className='mt-2 text-primary w-full justify-start font-bold'>
                                                        White list
                                                    </div>
                                                    <div className='flex flex-grow flex-row justify-start items-center w-full py-2'>
                                                        <div className='bg-gray-700/30 h-[110px] w-full rounded-md p-2 font-semibold overflow-y-auto overflow-x-auto'>
                                                            {Question.whitelist.split(",").map((item: string, index: number) => (
                                                                <span key={index} className="inline-block px-2 py-1 m-3 text-green-500 border border-green-500 rounded-md">
                                                                    {item.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </>
                        )
                    }
                    <Separator className='my-4' />
                    <div className='border rounded-md text-xs w-40 text-center font-semibold text-primary border-primary my-2'>
                        Sample Testcases
                    </div>
                    <div className='mt-2'>
                        Sample Testcase 1
                    </div>
                    <div className='flex flex-grow flex-row justify-around items-center w-full py-2'>
                        <div className='bg-gray-700/30 w-[48%] h-[110px] rounded-md p-2 font-bold overflow-y-auto overflow-x-auto'>
                            <pre>
                                {Question.sampleinput1}
                            </pre>
                        </div>
                        <Separator orientation='vertical' className='mx-2' />
                        <div className='bg-gray-700/30 w-[48%] h-[110px] rounded-md p-2 font-bold'>
                            <pre>
                                {Question.sampleoutput1}
                            </pre>
                        </div>
                    </div>
                    <div className='mt-2'>
                        Sample Testcase 2
                    </div>
                    <div className='flex flex-grow flex-row justify-around items-center w-full py-2'>
                        <div className='bg-gray-700/30 w-[48%] h-[110px] rounded-md p-2 font-bold overflow-y-auto overflow-x-auto'>
                            <pre>
                                {Question.sampleinput2}
                            </pre>
                        </div>
                        <Separator orientation='vertical' className='mx-2' />
                        <div className='bg-gray-700/30 w-[48%] h-[110px] rounded-md p-2 font-bold'>
                            <pre>
                                {Question.sampleoutput2}
                            </pre>
                        </div>
                    </div>
                </div>
                <div className='h-[5%] w-full  absolute bottom-0 left-0 border flex items-center justify-center'>
                    <div className='w-full flex justify-start items-center mx-4 p-1'>
                        <OnlineStatus />
                    </div>
                </div>
            </div>
        </>
    )
}
export default CodeQuestion