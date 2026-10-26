"use client"
import {
    ResizableHandle,
    ResizablePanelGroup,
    ResizablePanel,
} from "@/components/ui/resizable";
import MCQQuestion from '@/components/student-role/practice/mcq/mcq-question';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, LoaderIcon, Loader, Puzzle } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState, useTransition } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { mcqdataUpdateAssessment } from "@/actions/assessment";

interface MCQ {
    CorrectOption: number;
    Option1: string;
    Option2: string;
    Option3: string;
    Option4: string;
    codesnippet?: string | null;
    description: string;
    id: string;
    iscodesnippet: boolean;
    referenceimg?: string | null;
    subtopic?: string | null;
    title: string;
    topic?: string | null;
}

interface UserMCQRecord {
    questionIndex: number;
    correctOption: number;
    userOption: number | null;
}

const AssessmentMCQView = ({ data, uaid, status }: { data: MCQ[], uaid: string, status: string }) => {
    const [mcqdata, setMcqData] = useState<MCQ[]>([]);
    const [mcqcount, setMcqCount] = useState(0);
    const [mcqstatus, setMcqStatus] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [userMcqRecord, setUserMcqRecord] = useState<UserMCQRecord[]>([]);
    const [isLoading, startTransition] = useTransition()
    const [testDuration, setTestDuration] = useState<number>(0);
    const [testStartTime, setTestStartTime] = useState<number | null>(null);
    const [score, setScore] = useState<number>(0);
    const [SubmitTestModel, setSubmitTestModel] = useState(false)
    const [routeBtnLoading, setRouteBtnLoading] = useState(false)
    const handleQuestionClick = (index: number) => {
        setCurrentQuestionIndex(index);
        const existingRecord = userMcqRecord.find(record => record.questionIndex === index);
        if (existingRecord) {
            setSelectedOption(existingRecord.userOption?.toString() || "");
        } else {
            setSelectedOption("");
        }
    };

    const handleNextClick = () => {
        if (currentQuestionIndex < mcqcount - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            const existingRecord = userMcqRecord.find(record => record.questionIndex === nextIndex);
            if (existingRecord) {
                setSelectedOption(existingRecord.userOption?.toString() || "");
            } else {
                setSelectedOption("");
            }
        }
    };
    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        const updatedRecord = userMcqRecord.map((record) =>
            record.questionIndex === currentQuestionIndex
                ? { ...record, userOption: parseInt(value, 10) }
                : record
        );
        if (!updatedRecord.find(record => record.questionIndex === currentQuestionIndex)) {
            updatedRecord.push({
                questionIndex: currentQuestionIndex,
                correctOption: currentQuestion.CorrectOption,
                userOption: parseInt(value, 10)
            });
        }
        setUserMcqRecord(updatedRecord);
    };

    const currentQuestion = mcqdata[currentQuestionIndex] || {};

    const options = [
        { id: "1", label: currentQuestion.Option1 },
        { id: "2", label: currentQuestion.Option2 },
        { id: "3", label: currentQuestion.Option3 },
        { id: "4", label: currentQuestion.Option4 },
    ];
    const calculateTime = () => {
        if (testStartTime) {
            const endTime = Date.now();
            const duration = (endTime - testStartTime) / 1000;
            const roundedDuration = Math.floor(duration);
            setTestDuration(roundedDuration);
        }
    }
    const prepareSubmit = () => {

        setSubmitTestModel(true)
        calculateTime()
        let calculatedScore = 0;
        userMcqRecord.forEach(record => {
            if (record.correctOption === record.userOption) {
                calculatedScore += 1;
            }
        });
        setScore(calculatedScore);
    }
    const submitMCQ = () => {
        const submitData = {
            id: uaid,
            mcqtime: testDuration,
            mcqstatus: 'submitted',
            usermcqscore: score,
        }

        setRouteBtnLoading(true)
        startTransition(() => {
            mcqdataUpdateAssessment(submitData)
                .then((data) => {
                    if (data.success) {
                        toast.success(data.success)
                        setSubmitTestModel(false)
                        setTimeout(() => {
                            setRouteBtnLoading(false)
                        }, 20000)
                        setMcqStatus('submitted');
                    }
                    else {
                        toast.error(data.error)
                        setSubmitTestModel(false)
                        setRouteBtnLoading(false)
                    }
                })
        })
    }
    useEffect(() => {

        setMcqStatus(status);
        setMcqData(data);
        setMcqCount(data.length);
        setTestStartTime(Date.now());
    }, []);
    // console.log(status)
    return (
        <main className="flex min-h-[94vh] min-w-screen flex-row overflow-hidden">
            {
                mcqstatus && mcqstatus === 'submitted' ? (
                    <div className="w-full h-[94vh] flex flex-col gap-2 justify-center items-center">
                        <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border border-green-400 hover:border-primary" >
                            <div className="py-5 font-bold px-6 sm:px-8 flex flex-col justify-center items-center gap-5 text-green-400">
                                <Puzzle className="h-10 w-10 " />
                                MCQ Submitted !
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <aside className="sticky top-0 left-0 z-50 hidden sm:flex sm:flex-col w-20 h-[94vh] border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
                            <div className="flex-grow flex flex-col justify-between">
                                <nav className="flex flex-col my-4 space-y-4 overflow-y-auto max-h-[calc(100vh-20rem)]">
                                    {mcqdata.map((data: MCQ, index: number) => (
                                        <Button
                                            key={index}
                                            className={`inline-flex items-center justify-center mx-4 transition-colors  border ${currentQuestionIndex === index ? 'bg-primary text-white dark:text-white' : 'bg-transparent text-primary hover:bg-primary/10'} `}
                                            onClick={() => handleQuestionClick(index)}
                                        >
                                            <span className='h-6 w-6 p-0.5 font-bold'>
                                                {index + 1}
                                            </span>
                                        </Button>
                                    ))}
                                </nav>
                                <div className="inline-flex flex-col items-center justify-center h-30 w-20 ">
                                    <Button className={`inline-flex items-center justify-center p-3 mx-4 my-1 transition-colors bg-primary`} onClick={prepareSubmit} disabled={routeBtnLoading}>
                                        <span className='h-6 w-6'>
                                            {
                                                routeBtnLoading ? <Loader className="animate-spin p-1" /> : <Check fill='none' />
                                            }
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </aside>
                        <div className="w-full h-[94vh] flex flex-col items-center justify-center flex-grow">
                            <div className="h-4/6 w-5/6 flex flex-col mx-4 items-center">
                                <ResizablePanelGroup
                                    direction="horizontal"
                                    className="max-w-full max-h-full rounded-lg border">
                                    <MCQQuestion
                                        questiondata={currentQuestion}
                                        mcqcount={mcqcount}
                                        currentQuestionIndex={currentQuestionIndex}
                                    />
                                    <ResizableHandle withHandle />
                                    <ResizablePanel defaultSize={50} minSize={40}>
                                        <div className="flex h-full items-center justify-center flex-col flex-1">
                                            <div className='h-[10%] w-full dark:bg-purple-400/5 bg-purple-50 font-semibold flex items-center px-8 justify-start text-xl'>
                                                Answer here
                                            </div>
                                            <div className='h-[80%] w-full px-8 py-4'>
                                                <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
                                                    {options.map((option) => (
                                                        <div key={option.id} className="flex items-center space-x-2 h-12 my-3 dark:bg-purple-400/5 bg-purple-50 font-semibold rounded-md px-3 hover:bg-green-500/10 dark:hover:bg-green-500/10">
                                                            <RadioGroupItem value={option.id} id={option.id} />
                                                            <Label htmlFor={option.id} className='w-full h-full flex items-center'>
                                                                {option.label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                            <div className='h-[10%] w-full dark:bg-purple-400/5 bg-purple-50 flex items-center px-4 justify-end'>
                                                <Button
                                                    variant="outline"
                                                    className="bg-green-500 text-white hover:bg-green-700 hover:text-white"
                                                    onClick={handleNextClick}
                                                    disabled={currentQuestionIndex >= mcqcount - 1}
                                                >
                                                    Next
                                                    <ArrowRight className="ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </div>
                        <AlertDialog open={SubmitTestModel}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Submit MCQs</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure want to submit MCQs ?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setSubmitTestModel(false)} className='bg-red-500 text-white w-full hover:bg-red-400 hover:text-white'>Close</AlertDialogCancel>
                                    <AlertDialogAction onClick={submitMCQ} className='w-full' disabled={isLoading}>
                                        {isLoading && (
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Submit
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>

                )
            }

        </main>
    );
};

export default AssessmentMCQView;
