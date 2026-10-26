import { ResizablePanel } from "@/components/ui/resizable";
import CodeSnippet from '@/components/student-role/practice/mcq/code-sinppet';
import Image from "next/image";

interface MCQdata {
    codesnippet?: string | null;
    description: string;
    id: string;
    iscodesnippet: boolean;
    referenceimg?: string | null;
    title: string;
}

interface MCQQuestionProps {
    questiondata: MCQdata;
    mcqcount: number;
    currentQuestionIndex: number;
}

const MCQQuestion = ({ questiondata, mcqcount, currentQuestionIndex }: MCQQuestionProps) => {
    return (
        <ResizablePanel defaultSize={50} minSize={40}>
            <div className="flex h-full items-center justify-center flex-col flex-1  overflow-hidden">
                <div className='h-[10%] w-full dark:bg-purple-400/5 bg-purple-50 font-semibold flex items-center px-8 justify-start text-xl'>
                    Question :  {currentQuestionIndex + 1} / {mcqcount}
                </div>
                <div className='h-[80%] w-full px-8 py-8 flex flex-col items-start gap-4 overflow-y-scroll'>
                    <div className='font-bold text-xl'>
                        {questiondata.title}
                    </div>
                    <div className='font-medium text-md'>
                        {questiondata.description}
                    </div>
                    {questiondata?.referenceimg && (
                        <div className="relative w-full h-[300px]">
                            <Image src={questiondata?.referenceimg} alt={questiondata.title} fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-fill" />
                        </div>
                    )}
                    {questiondata.iscodesnippet &&
                        <CodeSnippet code={questiondata.codesnippet || ''} />
                    }
                </div>
                <div className='h-[10%] w-full dark:bg-purple-400/5 bg-purple-50 flex items-center px-8 justify-start font-semibold text-lg'>
                    Marks : 1
                </div>
            </div>
        </ResizablePanel>
    );
}

export default MCQQuestion;
