"use client"
import BackBtn from '@/components/backbtn';
import { PieChartComponent } from '@/components/results/analysis/analysis-students/charts/student-analysis-piechart';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import CodeEditor from '@/components/ide/codeeditor';
import CodeRetake from '@/components/results/analysis/analysis-students/retake/code-retake';
import { usePDF } from 'react-to-pdf';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { FileDown } from 'lucide-react';
const InsightView = ({ analysisdata, cid, mid, uid }: { analysisdata: any, cid: string, mid: string, uid: string }) => {
    function removeTrailingNewlines(userCode: string | null) {
        if (!userCode) return '';
        return userCode.replace(/\n+$/, '');
    }
    const formattedDate = formatDate(new Date(), "-");
    const { toPDF, targetRef } = usePDF({
        filename: `${analysisdata?.moduletitle}-${analysisdata?.rollnumber}-${formattedDate}.pdf`
    });

    const bgColor: string = analysisdata?.status === "started"
        ? "bg-blue-500/30"
        : analysisdata?.status === "submitted"
            ? "bg-green-500/30"
            : analysisdata?.status === "retake"
                ? "bg-orange-500/30"
                : "";
    // console.log(codeItem.testcase1status,codeItem.testcase1status,codeItem.testcase1status)
    return (
        <>
            <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full overflow-y-auto" ref={targetRef}>
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {analysisdata?.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {analysisdata?.rollnumber}
                            {/* {analysisdata?.coursetitle} | {analysisdata?.moduletitle} */}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">

                        <Button onClick={() => toPDF()} className='bg-red-700 text-white hover:bg-red-800 p-2'><FileDown className='h-6 w-6' /></Button>
                        <BackBtn />
                    </div>
                </div>
                <div className='h-full w-full flex flex-col mt-4  border-2 p-2' ref={targetRef}>
                    <div className="flex flex-row w-full h-[15rem]">
                        <div className='h-full w-1/6 flex flex-col items-center justify-center gap-[5%]'>
                            <div className='w-full h-[42%] flex justify-center items-center p-2 border-[1px] rounded-md'>
                                <h2>{analysisdata?.coursetitle}</h2>
                            </div>
                            <div className={`w-full h-[42%] flex justify-center items-center p-2 border-[1px] rounded-md flex-col ${bgColor} gap-2`}>
                                <h2>{analysisdata?.moduletitle}</h2>
                                <p>{analysisdata?.status}</p>
                            </div>
                        </div>
                        <div className='h-full w-2/6'>
                            <div className='flex flex-row h-full w-full'>
                                <div className='w-1/2 flex justify-center items-center'>
                                    <PieChartComponent title='MCQ' score={analysisdata?.mcqscore || 0} total={analysisdata?.mcqquestionscount || 0} />
                                </div>
                                <div className='w-1/2 flex justify-center items-center'>
                                    <PieChartComponent title='Code' score={analysisdata?.totalcodequestionscore || 0} total={(analysisdata?.totalcodequestionscount ?? 0) * 10} />
                                </div>
                            </div>
                        </div>
                        <div className='h-full w-2/6 flex flex-col items-center justify-center gap-[2%]  border-[1px] rounded-md py-4'>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Total MCQs</h2> <h2 className='w-1/4 h-full'>{analysisdata?.mcqquestionscount}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Max Score</h2> <h2 className='w-1/4 h-full'>{analysisdata?.mcqquestionscount}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Score </h2> <h2 className='w-1/4 h-full'>{analysisdata?.mcqscore}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Errors </h2> <h2 className='w-1/4 h-full'> {(analysisdata?.mcqquestionscount ?? 0) - (analysisdata?.mcqscore ?? 0)}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Duration </h2> <h2 className='w-1/4 h-full'>{analysisdata?.mcqtime} s</h2>
                            </div>
                        </div>
                        <div className='h-full w-2/6 flex flex-col items-center justify-center gap-[2%]  border-[1px] rounded-md py-4'>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Total Codes</h2> <h2 className='w-1/4 h-full'>{analysisdata?.totalcodequestionscount}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Max Score</h2> <h2 className='w-1/4 h-full'>{(analysisdata?.totalcodequestionscount ?? 0) * 10}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Score </h2> <h2 className='w-1/4 h-full'>{analysisdata?.totalcodequestionscore}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Compile Errors </h2> <h2 className='w-1/4 h-full'> {analysisdata?.totalcodequestionserrors}</h2>
                            </div>
                            <div className='w-2/3 h-1/6 flex justify-center items-center'>
                                <h2 className='h-full w-2/4'>Duration </h2> <h2 className='w-1/4 h-full'>{analysisdata?.totalcodequestionstime} s</h2>
                            </div>
                        </div>
                    </div>
                    <div className='w-full h-full'>
                        <Accordion type="single" collapsible className="w-full">
                            {analysisdata?.codedata.map((codeItem: any, index: number) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className='w-full h-full'>
                                        <div className='flex flex-row justify-start items-center gap-8 h-full w-[85%]'>

                                            <span className='w-[8%] h-full flex justify-start items-center dark:text-white text-black px-3'> ID : {index + 1}</span>
                                            <span className='w-[30%] h-full flex justify-start items-center'>Question ID : {codeItem.questionid}</span>
                                            {
                                                codeItem.usercode !== null || '' ?
                                                    (
                                                        <span className='w-[10%] bg-green-600/50 text-white p-1 rounded-md flex justify-center items-center'>
                                                            Submitted
                                                        </span>
                                                    ) : (
                                                        <span className='w-[10%] bg-red-500/50 text-white p-1 rounded-md flex justify-center items-center'>
                                                            Not Submitted
                                                        </span>
                                                    )
                                            }
                                            <span className='w-[10%] h-full flex justify-start items-center dark:text-white text-black'> Compiles : {codeItem.compiles} </span>
                                            <span className='w-[10%] h-full flex justify-start items-center dark:text-white text-black'> Time : {codeItem.time}s </span>
                                            <span className='w-[15%] h-full flex justify-start items-center text-red-500'>Compile Errors : {codeItem.errors} </span>
                                            <span className='w-[10%] h-full flex justify-start items-center text-green-600'> Score : {codeItem.score}/10 </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className='w-full h-full flex flex-row'>
                                            <div className='h-full w-1/2'>
                                                <div className='border rounded-md text-xs w-20 text-center font-semibold text-primary border-primary my-2'>
                                                    Question
                                                </div>
                                                <div className='text-2xl font-bold'>
                                                    {codeItem.questiontitle}
                                                </div>
                                                <div className='border rounded-md text-xs w-20 text-center font-semibold text-primary border-primary my-2'>
                                                    Description
                                                </div>
                                                <div className='text-md font-normal text-pretty break-words'>
                                                    {codeItem.questiondesc}
                                                </div>

                                                {(codeItem.testcase1data !== null && codeItem.testcase1data !== null && codeItem.testcase1data !== null) && <>
                                                    <div className='border rounded-md text-xs w-28 text-center font-semibold text-primary border-primary my-2'>
                                                        TestCase Data
                                                    </div>
                                                    <div className='w-full flex justify-start gap-[4%] items-center flex-row mb-3 mt-2 pr-2'>
                                                        <div className={`h-10 w-[24%] text-white flex justify-center items-center rounded-sm ${codeItem.testcase1data ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
                                                            Test Case 1 : {codeItem.testcase1data === 'pass' ? 'Success' : 'Failed'}
                                                        </div>
                                                        <div className={`h-10 w-[24%] text-white flex justify-center items-center rounded-sm ${codeItem.testcase2data ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
                                                            Test Case 2 : {codeItem.testcase1data === 'pass' ? 'Success' : 'Failed'}
                                                        </div>
                                                        <div className={`h-10 w-[24%] text-white flex justify-center items-center rounded-sm ${codeItem.testcase3data ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
                                                            Test Case 3 : {codeItem.testcase1data === 'pass' ? 'Success' : 'Failed'}
                                                        </div>
                                                        <CodeRetake uid={uid} mid={mid} qid={codeItem.questionid} cid={cid} />
                                                    </div>
                                                </>}
                                            </div>
                                            <div className='h-full w-1/2'>
                                                <CodeEditor Code={removeTrailingNewlines(codeItem?.usercode)} readonly={true} lang={analysisdata.modulelang || "java"} />
                                                {/* <CodeEditor Code={codeItem.usercode} readonly={true} lang={analysisdata.modulelang || "java"} /> */}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InsightView