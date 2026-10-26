"use client";
import React, { useState, useEffect } from "react";
import { Check, Code, Play, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ModuleAction from "./module-action";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import ConceptPreview from "./concept-preview";
import { formatDate, getISTParts } from "@/lib/utils";

interface ModuleResultType {
    id: string;
    userId: string;
    courseId: string;
    moduleId: string;
    mcqtime: number | null;
    usermcqscore: number | null;
    totalmcqscore: number | null;
    questiontime: number | null;
    userquestionscore: number | null;
    totalquestionscore: number | null;
    errors: number | null;
    compiles: number | null;
    modulestatus: string;
}
interface Reference {
    link: string;
    title: string;
    type: string;
}
interface ModuleDataType {
    id: string;
    title: string;
    modulestatus: string;
    moduledate: Date;
    concepturl: string | null;
    maxscore: number | null;
    questionscount: number,
    mcqcount: number,
    modulereference: Reference[] | [];
}
interface CourseFeedback {
    id: string,
    title: string,
    link: string,
    date: Date;
}
interface MergedModuleType extends ModuleDataType {
    userId: string | null;
    courseId: string | null;
    totalmcqscore: number | null;
    usermcqscore: number | null;
    totalquestionscore: number | null;
    userquestionscore: number | null;
    mcqtime: number | null;
    questiontime: number | null;
    errors: number | null;
    compiles: number | null;
    modulestatus: string;
}

const mergeData = (modulesData: ModuleDataType[] | null, modulesResults: ModuleResultType[] | null): MergedModuleType[] => {
    if (!modulesData) return [];
    return modulesData.map(module => {
        const result = modulesResults?.find(res => res.moduleId === module.id) || {
            userId: null,
            courseId: null,
            totalmcqscore: null,
            usermcqscore: null,
            totalquestionscore: null,
            userquestionscore: null,
            mcqtime: null,
            questiontime: null,
            errors: null,
            compiles: null,
            maxscore: null,
            modulestatus: '',
            questionscount: module.questionscount,
            mcqcount: module.mcqcount,
            modulereference: []
        };
        return {
            ...module,
            ...result,
            id: module.id,
        };
    });
};
const determineFeedbackStatus = (feedbackDate: Date): { status: string, statusClass: string, statusClassPointer: string } => {
    // "Today" is the current Asia/Kolkata calendar day (app timezone), not
    // the viewer device's local day; instant comparisons are TZ-agnostic.
    const now = new Date();
    const todayKey = getISTParts(now)?.dayKey;
    const feedbackKey = getISTParts(feedbackDate)?.dayKey;
    let status = "upcoming";
    let statusClass = "bg-yellow-100 text-yellow-800 dark:bg-yello-100/10 border-yellow-300 ";
    let statusClassPointer = "cursor-not-allowed";
    if (feedbackKey && feedbackKey === todayKey) {
        status = "active";
        statusClass = "bg-green-100 text-green-800 border-green-300";
        statusClassPointer = "cursor-pointer";
    } else if (feedbackDate < now) {
        status = "expired";
        statusClass = "bg-red-100 text-red-800 border-red-300  cursor-not-allowed";
        statusClassPointer = "cursor-not-allowed";
    }
    return { status, statusClass, statusClassPointer };
};


const ModuleView = ({ ModulesData, CourseFeedbackData, ModulesResults, uid, cid }: { ModulesData: ModuleDataType[] | null, CourseFeedbackData: CourseFeedback[] | null, ModulesResults: ModuleResultType[] | null, uid: string, cid: string }) => {
    const [mergedModules, setMergedModules] = useState<MergedModuleType[]>([]);
    const [selectedModule, setSelectedModule] = useState<MergedModuleType | null>(null);

    useEffect(() => {
        const mergedData = mergeData(ModulesData, ModulesResults);
        setMergedModules(mergedData);
        if (mergedData.length > 0) {
            setSelectedModule(mergedData[0]);
        }
    }, [ModulesData, ModulesResults]);
    return (
        <div className="py-10 sm:py-8 mx-8 border-2 rounded-md">
            <div className="mx-6 w-full h-[42rem] flex flex-row gap-x-8 overflow-hidden flex-grow">
                <div className='w-3/12 h-full overflow-y-auto px-1 m-1'>
                    <Accordion type="single" collapsible className="w-full" >
                        {(CourseFeedbackData && CourseFeedbackData?.length > 0) &&
                            <AccordionItem
                                value={`item-1`}
                                className="mb-3 rounded-lg border border-border shadow-sm bg-card overflow-hidden last:border-b"
                            >
                                <AccordionTrigger className="px-4 py-3.5 items-center hover:no-underline">Feedbacks</AccordionTrigger>
                                <AccordionContent className="pt-0 pb-4 px-4">
                                    <div className='flex flex-col gap-3 w-full'>
                                        {CourseFeedbackData.map((feedback, index) => {
                                            const { status, statusClass, statusClassPointer } = determineFeedbackStatus(new Date(feedback.date));
                                            return (
                                                <div key={index} className={`w-full flex flex-row items-center p-1 gap-2 border-2 h-10 rounded-md hover:border-primary hover:transition-colors duration-1000 ease-in-out ${statusClassPointer}`}>
                                                    {
                                                        status === 'active' ?
                                                            (
                                                                <>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <div className="w-full flex flex-row items-center">
                                                                                <Star className="p-1 my-2 rounded-md" />
                                                                                <div className="w-[90%] flex flex-row items-center justify-center">
                                                                                    <p className="w-[80%] line-clamp-1">{feedback.title}</p>
                                                                                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-md border ${statusClass}`}>
                                                                                        {status}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle> {feedback.title} - {formatDate(feedback.date)} </AlertDialogTitle>
                                                                                <AlertDialogDescription className='w-full max-w-[27rem] flex flex-wrap justify-start items-start'>
                                                                                    <span className="w-full line-clamp-3 break-words text-ellipsis">
                                                                                        {feedback.link}
                                                                                    </span>
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel className='bg-red-500 hover:bg-red-400 text-white w-full hover:text-white'>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction className='w-full'>
                                                                                    <a href={feedback.link} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                                                                                        Open
                                                                                    </a>
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Star className="p-1 my-2 rounded-md" />
                                                                    <div className="w-[90%] flex flex-row items-center justify-center">
                                                                        <p className="w-[80%] line-clamp-1">{feedback.title}</p>
                                                                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-md border ${statusClass}`}>
                                                                            {status}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        }
                        {mergedModules.map((module, index) => {
                            const isCompleted = module.modulestatus === 'submitted';
                            const isCurrent = selectedModule?.id === module.id;
                            const cardStateClass = isCompleted
                                ? 'border-green-500 bg-green-50/60 dark:bg-green-950/20 hover:border-green-500'
                                : isCurrent
                                    ? 'border-primary hover:border-primary'
                                    : 'hover:border-primary';
                            return (
                            <AccordionItem
                                value={`item-1${index}`}
                                key={index}
                                className={`mb-3 rounded-lg border border-border shadow-sm bg-card overflow-hidden last:border-b transition-colors ${cardStateClass}`}
                            >
                                <AccordionTrigger className="px-4 py-3.5 items-center hover:no-underline">
                                    <span className="flex items-center gap-2 text-left">
                                        {module.title}
                                        {isCompleted && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300">
                                                <Check className="h-3 w-3" />
                                                Completed
                                            </span>
                                        )}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pt-0 pb-4 px-4">
                                    <div className='flex flex-col gap-3 w-full'>
                                        <div
                                            className={`w-full flex flex-row items-center p-1 gap-2 border-2 h-10 cursor-pointer rounded-md ${selectedModule?.id === module.id ? 'border-primary' : ''} hover:border-primary hover:transition-colors duration-1000 ease-in-out`}
                                            onClick={() => setSelectedModule(module)} >
                                            {
                                                module.modulestatus === 'submitted' ? (
                                                    <Check className={`p-1 my-2 rounded-md ${selectedModule?.id === module.id ? 'bg-green-500 text-white' : ''}`} />
                                                ) : (
                                                    <Code className={`p-1 my-2 rounded-md ${selectedModule?.id === module.id ? 'bg-primary text-white' : ''}`} />
                                                )
                                            }
                                            Code Space
                                        </div>
                                        {module.concepturl && (
                                            <ConceptPreview concepturl={module.concepturl} />
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
                <ModuleAction Module={selectedModule} cid={cid} uid={uid} />
            </div>
        </div >
    );
};

export default ModuleView;
