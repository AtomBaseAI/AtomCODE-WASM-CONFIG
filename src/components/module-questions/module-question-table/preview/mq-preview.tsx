"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import CodeEditor from "@/components/ide/codeeditor"

const MQPreview = ({ question }: { question: any }) => {
    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button variant='outline' size='icon' className="border-blue-500 bg-transparent hover:bg-blue-700/10 flex w-auto p-1 gap-1 text-blue justify-center items-center">
                    <Eye className="size-5 bg-transparent text-blue-500" />
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[100vw] h-[100vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                    <DialogTitle>Preview Question</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4 px-2 py-4">
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-2">
                        <div className="text-primary font-bold">
                            Question
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            {question.title}
                        </div>
                    </div>
                    <div className="flex flex-col h-full w-full justify-center flex-1 col-span-1 row-span-10">
                        <div className="text-primary font-bold">
                            Server Code
                        </div>
                        <div className="border-2 h-full flex items-center px-2 rounded-md line-clamp-1">
                            {/* <pre>
                                        {question.sourcecode}
                                    </pre> */}
                            <CodeEditor Code={question.sourcecode} readonly={true} lang={question.lang} />
                        </div>
                    </div>

                    <div className="flex flex-row h-40 w-full justify-center flex-1 col-span-2 gap-4">
                        <div className="w-1/2 flex flex-col">

                            <div className="text-primary font-bold">
                                Description
                            </div>

                            <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-2 text-wrap">
                                {question.description}
                            </div>
                        </div>
                        <div className="w-1/2 flex flex-col">

                            <div className="text-primary font-bold">
                                Input Constrains
                            </div>

                            <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                {
                                    question.inputconstrains !== null && question.inputconstrains !== undefined && question.inputconstrains !== "" ? question.inputconstrains : "Not Available"
                                }
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Blacklist
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre className="py-1 bg-red-600/10">
                                {
                                    question.blacklist !== null && question.blacklist !== undefined && question.blacklist !== "" ? question.blacklist : "Not Available"
                                }
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Whitelist
                        </div>
                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre className="py-1 bg-green-600/10">
                                {
                                    question.whitelist !== null && question.whitelist !== undefined && question.whitelist !== "" ? question.whitelist : "Not Available"
                                }
                            </pre>
                        </div>
                    </div>


                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Testcase Input 1
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.input1}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Testcase Output 1
                        </div>
                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre className="py-1">
                                {question.output1}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Testcase Input 2
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.input2}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Testcase Output 2
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.output2}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Testcase Input 3
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.input3}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Testcase Output 3
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.output3}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Sample Input 1
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.sampleinput1}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Sample Output 1
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.sampleoutput1}
                            </pre>
                        </div>
                    </div>

                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Sample Input 2
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.sampleinput2}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Sample Output 2
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.sampleoutput2}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Topic
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {
                                    question.topic !== null && question.topic !== undefined && question.topic !== "" ? question.topic : "Not Available"
                                }
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Sub Topic
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {
                                    question.subtopic !== null && question.subtopic !== undefined && question.subtopic !== "" ? question.subtopic : "Not Available"
                                }
                            </pre>
                        </div>
                    </div>

                    <div className="flex flex-row border shadow flex-1  col-span-1">
                        <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                            Difficulty
                        </div>
                        <div className="flex items-center justify-center  w-[70%] p-1">
                            {question.difficulty}
                        </div>
                    </div>
                    <div className="flex flex-row border shadow flex-1  col-span-1">
                        <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                            Refercence Image
                        </div>
                        <div className="flex items-center justify-center  w-[70%] p-1 ">
                            <p className="line-clamp-1">

                                {
                                    question.referenceimg !== null && question.referenceimg !== undefined && question.referenceimg !== "" ? question.referenceimg : "Not Available"
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row border shadow flex-1  col-span-1">
                        <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                            Language
                        </div>
                        <div className="flex items-center justify-center  w-[70%] p-1">
                            {question.lang.toLocaleLowerCase()}
                        </div>
                    </div>
                    <div className="flex flex-row border shadow flex-1  col-span-1">
                        <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                            Maximum Score
                        </div>
                        <div className="flex items-center justify-center  w-[70%] p-1">
                            {question.maxscore}
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MQPreview