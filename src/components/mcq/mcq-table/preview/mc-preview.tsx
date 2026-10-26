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

const MCPreview = ({ question }: { question: any }) => {
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
                        <div className="border-2 h-full px-2 rounded-md line-clamp-1 flex justify-center items-center">
                            {question.iscodesnippet ?
                                (

                                    <CodeEditor Code={question.codesnippet} readonly={true} lang={question.lang} />
                                ) : (
                                    <>
                                        Snippet not available !
                                    </>
                                )
                            }
                        </div>
                    </div>

                    <div className="flex flex-row h-40 w-full justify-center flex-1 col-span-2 gap-4">
                        <div className="w-full flex flex-col">

                            <div className="text-primary font-bold">
                                Description
                            </div>

                            <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-2 text-wrap">
                                {question.description}
                            </div>
                        </div>

                    </div>


                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Option 1
                        </div>
                        <div className={`${question.CorrectOption === 1 ? 'bg-green-600/20' : 'bg-red-600/20'} h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1`}>
                            <pre>
                                {question.Option1}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Option 2
                        </div>
                        <div className={`${question.CorrectOption === 2 ? 'bg-green-600/20' : 'bg-red-600/20'} h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1`}>
                            <pre className="py-1">
                                {question.Option2}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Option 3
                        </div>

                        <div className={`${question.CorrectOption === 3 ? 'bg-green-600/20' : 'bg-red-600/20'} h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1`}>
                            <pre>
                                {question.Option3}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Option 4
                        </div>

                        <div className={`${question.CorrectOption === 4 ? 'bg-green-600/20' : 'bg-red-600/20'} h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1`}>
                            <pre>
                                {question.Option4}
                            </pre>
                        </div>
                    </div>
                    <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                        <div className="text-primary font-bold">
                            Correct Option
                        </div>

                        <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                            <pre>
                                {question.CorrectOption}
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
                        <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1 flex justify-center items-center">
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
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MCPreview