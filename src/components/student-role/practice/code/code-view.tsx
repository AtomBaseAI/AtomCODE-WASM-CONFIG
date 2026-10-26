"use client"
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, FileQuestion } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from "@/components/theme-toggle";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import CodeQuestion from '@/components/student-role/practice/code/code-question';
import { useEffect, useState, useTransition } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { Check, LoaderIcon, Play, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner"
import { Separator } from '@/components/ui/separator';
import { usePageEnter } from '@/hooks/MouseEnter';
import { submitcode, submitquestion } from '@/actions/submitquestion';
import { useRouter } from 'next/navigation';
import { codedataUpdateModule } from '@/actions/submitmodule';
import { autocompletion } from "@codemirror/autocomplete";

import AtomAI from '@/components/student-role/practice/code/code-ai/atom-ai';
import {
    getCustomCompletionSource,
    isCodeMirrorLanguage,
    loadLanguageExtension,
} from '@/components/code/code-mirror-language';
import { LanguageVersionSelect } from '@/components/code/language-version-select';
import {
    getInitialVersionProfileId,
    setStoredVersionForLang,
} from '@/lib/runtime-registry';
import { judgeRunSingle, judgeRunTestCases } from '@/lib/wasm-judge';

interface CodeQuestion {
    id: string;
    title: string;
    description: string;
    moduleId: string | null;
    sampleinput1: string;
    sampleinput2: string;
    sampleoutput1: string;
    sampleoutput2: string;
    input1: string;
    input2: string;
    input3: string;
    output1: string;
    output2: string;
    output3: string;
    sourcecode: string | null;
    referenceimg: string | null;
    maxscore: number;
    difficulty: string;
    lang: string;
    topic: string | null;
    subtopic: string | null;
    inputconstrains: string | null;
    blacklist: string | null;
    whitelist: string | null;
    submissionstatus: boolean
}

const CodeView = ({ questions, mid, uid, cid, umid }: { questions: CodeQuestion[], mid: string, uid: string, cid: string, umid: string }) => {
    const { theme } = useTheme();
    const [questionData, setQuestionData] = useState<CodeQuestion[]>(questions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleQuestionClick = (index: number) => {
        resetEditorState();
        setCurrentQuestionIndex(index);
    };

    const resetEditorState = () => {
        setUserCode(`// code here ! `);
        setVersionProfileId(undefined);
        // setOutput('');
        setOutputData(null);
        setSamplesuccess(false);
        setShowSubmit(false);
        setisSubmitted(false);
        setTestcase1Status("");
        setTestcase2Status("");
        setTestcase3Status("");
        setCompileCount(0);
        setErrorCount(0);
        setExecuting(false);
        setExecutingTestcases(false);
        setTestDuration(0);
        setScore(0)
        setScore1(0)
        setScore2(0)
        setScore3(0)
        setTestStartTime(Date.now());
    };
    const currentQuestion = questionData[currentQuestionIndex];

    const [showModal, setShowModal] = useState(false)
    const [executing, setExecuting] = useState(false)
    const [executingTestcases, setExecutingTestcases] = useState(false)
    const [RunTestModel, setRunTestModel] = useState(false)
    const [SubmitTestModel, setSubmitTestModel] = useState(false)
    const [error, setError] = useState(false)
    const [samplesuccess, setSamplesuccess] = useState(false)
    const [outputData, setOutputData] = useState(null)
    const [userCode, setUserCode] = useState(`// code here ! \n\n`)
    const [showSubmit, setShowSubmit] = useState(false)
    const [isSubmitted, setisSubmitted] = useState(false)
    const [testcase1Status, setTestcase1Status] = useState<string>("")
    const [testcase2Status, setTestcase2Status] = useState<string>("")
    const [testcase3Status, setTestcase3Status] = useState<string>("")
    const [compileCount, setCompileCount] = useState<number>(0)
    const [errorCount, setErrorCount] = useState<number>(0)
    const [testDuration, setTestDuration] = useState<number>(0);
    const [testStartTime, setTestStartTime] = useState<number | null>(null);
    const [isLoading, startTransition] = useTransition()
    const [EndTestModel, setEndTestModel] = useState<boolean>(false)
    const [routeBtnLoading, setRouteBtnLoading] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0);
    const [score1, setScore1] = useState<number>(0);
    const [score2, setScore2] = useState<number>(0);
    const [score3, setScore3] = useState<number>(0);
    const [versionProfileId, setVersionProfileId] = useState<string | undefined>(undefined);
    const router = useRouter()

    const RunCode = async () => {
        const blacklist = currentQuestion.blacklist
            ?.split(",")
            .map(item => item.trim())
            .filter(item => item !== "") || [];

        const whitelist = currentQuestion.whitelist
            ?.split(",")
            .map(item => item.trim())
            .filter(item => item !== "") || [];

        // Check for blacklist
        const blacklistFound = blacklist.some((keyword) => userCode.includes(keyword));
        if (blacklistFound) {
            toast.error("Blacklist keyword(s) found in the code!");
            return;
        }
        // Check for whitelist
        const whitelistMissing = whitelist.some((keyword) => !userCode.includes(keyword));
        if (whitelistMissing) {
            toast.error("Whitelist keyword(s) missing in the code!");
            return;
        }
        setCompileCount(compileCount + 1);
        localStorage.setItem(`${umid}_${currentQuestion.id}`, userCode);

        try {
            setShowModal(true);
            setExecuting(true);
            // Client-side WASM execution (no external judge API).
            const res = await judgeRunSingle({
                lang: currentQuestion.lang,
                versionProfileId,
                code: userCode,
                input: currentQuestion.sampleinput1,
                expectedOutput: currentQuestion.sampleoutput1,
            });
            if (res.compileMessage === "Success") {
                toast.success("Sample Testcase Passed");
                setOutputData(res.output);
                setSamplesuccess(true);
                if (score === 0) {
                    setScore(score + 1);
                }
            } else if (res.compileMessage === "Failed") {
                toast.error("Sample Testcase Failed!");
                setSamplesuccess(false);
                setErrorCount(errorCount + 1);
                setOutputData(res.output);
                setShowSubmit(false)
            } else {
                toast.error(res.timedOut ? "Execution timed out!" : "Compilation Error!");
                setError(true);
                setOutputData(res.output || res.stderr);
                setErrorCount(errorCount + 1);
                setShowSubmit(false)
            }

            setExecuting(false);
        } catch (error) {
            toast.warning("Something went wrong!");
            setShowModal(false);
            setExecuting(false);
        }
    };

    const RunTestCases = async () => {
        setExecutingTestcases(true);
        setTestcase1Status("")
        setTestcase2Status("")
        setTestcase3Status("")
        setRunTestModel(true);
        try {
            // Client-side WASM execution (no external judge API).
            const outcomes = await judgeRunTestCases({
                lang: currentQuestion.lang,
                versionProfileId,
                code: userCode,
                cases: [
                    { input: currentQuestion.input1, expectedOutput: currentQuestion.output1 },
                    { input: currentQuestion.input2, expectedOutput: currentQuestion.output2 },
                    { input: currentQuestion.input3, expectedOutput: currentQuestion.output3 },
                ],
            });
            const [case1, case2, case3] = outcomes;

            setTestcase1Status(case1.status === "Success" ? "pass" : "fail");
            setTestcase2Status(case2.status === "Success" ? "pass" : "fail");
            setTestcase3Status(case3.status === "Success" ? "pass" : "fail");

            if (case1.status === "Success") {
                if (score1 === 0) {
                    setScore1(score1 + 3);
                }
            }
            else if (case1.status === "Error") {
                setErrorCount(errorCount + 1);
            }
            if (case2.status === "Success") {
                if (score2 === 0) {
                    setScore2(score2 + 3);
                }
            }
            else if (case2.status === "Error") {
                setErrorCount(errorCount + 1);
            }
            if (case3.status === "Success") {
                if (score3 === 0) {
                    setScore3(score3 + 3);
                }
            }
            else if (case3.status === "Error") {
                setErrorCount(errorCount + 1);
            }
            setExecutingTestcases(false);
            setShowSubmit(true);
            if (testStartTime) {
                const endTime = Date.now();
                const duration = (endTime - testStartTime) / 1000;
                const roundedDuration = Math.floor(duration);
                setTestDuration(roundedDuration);
            }
        } catch (error) {
            toast.warning("Something went wrong!");
            setExecutingTestcases(false);
            setRunTestModel(false);
        }
    };

    const closeTestCaseModel = () => {
        setShowModal(false);
        setOutputData(null);
        setExecutingTestcases(false);
        setRunTestModel(false);
    };

    const closeRunModel = () => {
        setShowModal(false);
        setError(false)
        setOutputData(null)
    }


    useEffect(() => {
        const savedCode = localStorage.getItem(`${umid}_${currentQuestion.id}`);
        if (!currentQuestion.submissionstatus) {
            if (savedCode) {
                setUserCode(savedCode);
            }
        }
        setTestStartTime(Date.now());
    }, [currentQuestion.id]);

    const setStaticText = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const staticText = 'Failed to copy text.';
        if (e.type === 'copy') {
            navigator.clipboard.writeText(staticText)
                .then(() => {
                    toast.warning('Failed to copy text.');
                })
                .catch(err => {
                    toast.warning('Failed to copy text.');
                });
        }
    };
    const submitQuestion = () => {
        const submitData = {
            "userId": uid,
            "questionId": currentQuestion.id,
            "moduleId": mid,
            "score": score + score1 + score2 + score3,
            "compiles": compileCount,
            "errors": errorCount,
            "submissiontype": "usersubmit",
            "tabswitches": 0,
            "status": "submitted",
            "usercode": userCode,
            "duration": testDuration.toString(),
            "testcase1status": testcase1Status,
            "testcase2status": testcase2Status,
            "testcase3status": testcase3Status,
        }
        // console.log(submitData)
        startTransition(() => {
            submitquestion(submitData)
                .then((data) => {
                    if (data.success) {
                        setisSubmitted(true)
                        localStorage.removeItem(`${umid}_${currentQuestion.id}`);
                        setQuestionData((prevQuestions) =>
                            prevQuestions.map((question) =>
                                question.id === currentQuestion.id
                                    ? { ...question, submissionstatus: true }
                                    : question
                            )
                        );
                        setSubmitTestModel(false)
                        toast.success(data.success)
                    } else if (data.error) {
                        toast.error(data.error)
                        setSubmitTestModel(false)
                    }
                    else {
                        toast.error("something went wrong , try again")
                        setSubmitTestModel(false)
                    }
                })
        })
    }

    const submitCode = () => {

        const submitData = {
            userId: uid,
            moduleId: mid,
            id: umid,
        }

        setRouteBtnLoading(true)
        startTransition(() => {
            codedataUpdateModule(submitData)
                .then((data) => {
                    if (data.success) {
                        toast.success(data.success)
                        setEndTestModel(false)
                        setTimeout(() => {
                            router.back();
                        }, 2000)

                        setTimeout(() => {
                            setRouteBtnLoading(false)
                        }, 20000)

                    }
                    else {
                        // toast.error(data.error)
                        setEndTestModel(false)
                    }
                })
        })
    }
    usePageEnter(() => navigator.clipboard.writeText(''));


    const [languageExtension, setLanguageExtension] = useState<{
        extension: unknown;
        completion: ReturnType<typeof getCustomCompletionSource>;
    } | null>(null);

    useEffect(() => {
        if (
            currentQuestion?.lang &&
            isCodeMirrorLanguage(currentQuestion.lang)
        ) {
            const lang = currentQuestion.lang;
            loadLanguageExtension(lang).then((extension) => {
                setLanguageExtension({
                    extension,
                    completion: getCustomCompletionSource(lang),
                });
            });
        }
        // Reset the runtime-version selection for the question's language:
        // remembered choice if valid, otherwise the language default.
        setVersionProfileId(
            currentQuestion?.lang ? getInitialVersionProfileId(currentQuestion.lang) : undefined
        );
    }, [currentQuestion]);
    useEffect(() => {
        const preventDefaultShortcuts = (e: KeyboardEvent) => {
            // Check for copy/paste shortcuts across different platforms
            const isCopyPasteShortcut =
                // Windows/Linux shortcuts
                (e.ctrlKey &&
                    (e.key === "c" || e.key === "v" || e.key === "x")) ||
                // Mac shortcuts
                (e.metaKey &&
                    (e.key === "c" || e.key === "v" || e.key === "x")) ||
                // Windows clipboard history
                (e.ctrlKey && e.key === "v") ||
                // Mac paste without formatting
                (e.metaKey && e.shiftKey && e.key === "v") ||
                // Windows clipboard history (Win + V)
                (e.key === "v" && (e as any).windowKey) ||
                // Prevent select all
                ((e.ctrlKey || e.metaKey) && e.key === "a");

            if (isCopyPasteShortcut) {
                e.preventDefault();
                e.stopPropagation();
                toast.warning('Action not allowed.');
            }
        };

        // Add event listener for keyboard shortcuts
        document.addEventListener("keydown", preventDefaultShortcuts);

        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.warning('Action not allowed.');
        };
        document.addEventListener("contextmenu", preventContextMenu);

        return () => {
            document.removeEventListener("keydown", preventDefaultShortcuts);
            document.removeEventListener("contextmenu", preventContextMenu);
        };
    }, [toast]);


    if (!currentQuestion) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-4">
                <FileQuestion className="h-14 w-14 text-muted-foreground" />
                <h1 className="text-lg font-semibold text-center">No questions in this module yet</h1>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Questions have not been added to this module, so there is nothing to practice here.
                </p>
                <Button onClick={() => router.push(`/student/courses/${cid}`)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Course
                </Button>
            </main>
        )
    }
    return (
        <main className="flex min-h-screen min-w-screen flex-row">
            <aside className="sticky top-0 left-0 z-50 hidden sm:flex sm:flex-col w-20 h-screen border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
                <div className="flex-grow flex flex-col justify-between">
                    <nav className="flex flex-col my-4 space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
                        {questionData.map((question: CodeQuestion, index: number) => (
                            <Button
                                key={index}
                                className={`inline-flex items-center justify-center mx-4 transition-colors border ${currentQuestionIndex === index
                                    ? 'bg-primary text-white dark:bg-primary dark:text-white'
                                    : 'bg-transparent text-primary hover:bg-primary/10'
                                    } ${question.submissionstatus
                                        ? 'bg-green-500 text-white cursor-not-allowed'
                                        : ''
                                    }`}
                                onClick={() => handleQuestionClick(index)}
                                disabled={question.submissionstatus}
                            >
                                <span className="h-6 w-6 p-0.5 font-bold">
                                    {index + 1}
                                </span>
                            </Button>
                        ))}
                    </nav>
                    <div className="inline-flex flex-col items-center justify-center h-30 w-20 ">
                        <ThemeToggle className="my-4" />
                        <Button className={`inline-flex items-center justify-center p-3 mx-4 my-1 transition-colors bg-primary`} onClick={() => setEndTestModel(true)} disabled={routeBtnLoading}>
                            <span className='h-6 w-6'>
                                {
                                    routeBtnLoading ? <Loader className="animate-spin p-1" /> : <Check fill='none' />
                                }
                            </span>
                        </Button>
                    </div>
                </div>
            </aside>
            <div className="w-full h-full flex flex-col items-center justify-center flex-grow">
                <div className="h-full w-full flex flex-col mx-4 items-center ">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="max-w-full max-h-screen rounded-lg border">

                        <ResizablePanel defaultSize={50} minSize={20}>
                            <div className="flex h-screen items-center justify-center">
                                <CodeQuestion Question={currentQuestion} />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={40}>
                            <div className="flex h-screen items-center justify-center">
                                {currentQuestion.submissionstatus ? (
                                    <div className='h-screen w-full overflow-y-auto dark:bg-[#1e1e1e] flex justify-center items-center flex-col'>
                                        <p className='font-bold text-2xl mb-5'>
                                            Code Submitted !
                                        </p>
                                        {userCode.length >= 20 && (
                                            <AtomAI
                                                question={currentQuestion.title}
                                                description={currentQuestion.description}
                                                inputconstraints={currentQuestion.inputconstrains}
                                                blacklist={currentQuestion.blacklist}
                                                whitelist={currentQuestion.whitelist}
                                                testcasei1={currentQuestion.input1}
                                                testcasei2={currentQuestion.input2}
                                                testcaseo1={currentQuestion.output1}
                                                testcaseo2={currentQuestion.output2}
                                                code={userCode}
                                                language={currentQuestion.lang}
                                                theme={theme || ''}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className='flex h-screen items-center justify-center w-full flex-col'
                                        onCopy={setStaticText}
                                        onPaste={setStaticText}
                                    >
                                        <div className='h-[95%] w-full overflow-y-auto dark:bg-[#1e1e1e] codex'>
                                            <CodeMirror
                                                value={userCode}
                                                theme={theme === "dark" ? vscodeDark : eclipse}
                                                extensions={[
                                                    languageExtension?.extension,
                                                    languageExtension?.completion &&
                                                    autocompletion({ override: [languageExtension.completion] }),
                                                ].filter(Boolean)}
                                                style={{ fontSize: 16, minHeight: "95%", }}
                                                onChange={setUserCode}
                                            />
                                        </div>
                                        <div className='h-[5%] w-full border flex items-center justify-center'>
                                            <div className='flex flex-row w-[70%] items-center justify-start mx-1 p-1 gap-x-2'>
                                                <Button className='bg-green-500 hover:bg-green-400' onClick={RunCode}>
                                                    {executing ? (
                                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Play className='h-6 w-6 mr-2' /> Run
                                                        </>
                                                    )}
                                                </Button>
                                                {samplesuccess &&
                                                    <Button className='bg-green-500 hover:bg-green-400' onClick={RunTestCases}>
                                                        {executingTestcases ? (
                                                            <LoaderIcon className="h-6 w-6 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Play className='h-6 w-6 mr-2' /> Run Test Cases
                                                            </>
                                                        )}
                                                    </Button>
                                                }
                                                {currentQuestion?.lang && (
                                                    <LanguageVersionSelect
                                                        lang={currentQuestion.lang}
                                                        value={versionProfileId}
                                                        onChange={(profileId) => {
                                                            setVersionProfileId(profileId);
                                                            setStoredVersionForLang(currentQuestion.lang, profileId);
                                                        }}
                                                        className="w-[220px] ml-auto"
                                                        disabled={executing || executingTestcases}
                                                    />
                                                )}
                                            </div>
                                            <div className='flex flex-row w-[30%] items-center justify-end mx-1 p-1'>
                                                {showSubmit && (
                                                    <>
                                                        <Button onClick={() => { setSubmitTestModel(true) }}>
                                                            <Check className='h-6 w-6 mr-2' /> Submit Question
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                                }
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
            <AlertDialog open={showModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            <div className='flex flex-row justify-center items-center h-full'>

                                <h2 className='w-1/2 px-2'>Expected Output</h2>
                                <h2 className='w-1/2 px-2'>Program Output</h2>
                            </div>
                        </AlertDialogTitle>
                        {error ?
                            (
                                <div className='bg-gray-700/30 w-full h-[150px] rounded-md p-2 font-bold overflow-y-auto overflow-x-hidden'>
                                    <pre className='whitespace-pre-wrap break-words overflow-x-auto max-w-full'>
                                        {outputData}
                                    </pre>
                                </div>
                            )
                            : (
                                <div className='flex flex-grow flex-row justify-around items-center w-full py-2'>
                                    <div className='bg-gray-700/30 w-[48%] h-[150px] rounded-md p-2 font-bold overflow-y-auto overflow-x-hidden'>
                                        <pre className='whitespace-pre-wrap break-words overflow-x-auto max-w-full'>
                                            {currentQuestion.sampleoutput1}
                                        </pre>
                                    </div>
                                    <Separator orientation='vertical' className='mx-2' />
                                    <div className='bg-gray-700/30 w-[48%] h-[150px] rounded-md p-2 font-bold overflow-y-auto overflow-x-hidden'>
                                        {executing ? (
                                            <span className='h-full w-full flex items-center justify-center'>
                                                <LoaderIcon className="h-6 w-6 animate-spin" />
                                            </span>
                                        ) : (

                                            <pre>
                                                {outputData}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            )}
                    </AlertDialogHeader>
                    {!executing && (
                        <AlertDialogFooter>
                            <AlertDialogCancel className='bg-primary hover:bg-primary/80 text-white hover:text-white w-full ' onClick={closeRunModel}>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={RunTestModel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className='flex flex-grow flex-col justify-around items-center w-full py-2 gap-2'>
                            <div className='w-full h-1/3 flex flex-row flex-grow justify-center items-center p-2 border border-gray-200 rounded-md'>
                                <div className='w-1/2 flex justify-center items-center'>
                                    Test Case 1
                                </div>

                                <div className='w-1/2 flex justify-center items-center'>
                                    {testcase1Status === "" ? (
                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                    ) : testcase1Status === "pass" ? (
                                        <>
                                            <Check className='h-6 w-6 mr-2 bg-green-400 rounded-full' /> Passed
                                        </>
                                    ) : (
                                        <>
                                            <X className='h-6 w-6 mr-2 bg-red-500 rounded-full' /> Failed
                                        </>
                                    )
                                    }
                                </div>
                            </div>
                            <div className='w-full h-1/3 flex flex-row flex-grow justify-center items-center p-2 border border-gray-200 rounded-md'>
                                <div className='w-1/2 flex justify-center items-center'>
                                    Test Case 2
                                </div>

                                <div className='w-1/2 flex justify-center items-center'>
                                    {testcase2Status === "" ? (
                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                    ) : testcase2Status === "pass" ? (
                                        <>
                                            <Check className='h-6 w-6 mr-2 bg-green-400 rounded-full' /> Passed
                                        </>
                                    ) : (
                                        <>
                                            <X className='h-6 w-6 mr-2 bg-red-500 rounded-full' /> Failed
                                        </>
                                    )
                                    }
                                </div>
                            </div>
                            <div className='w-full h-1/3 flex flex-row flex-grow justify-center items-center p-2 border border-gray-200 rounded-md'>
                                <div className='w-1/2 flex justify-center items-center'>
                                    Test Case 3
                                </div>
                                <div className='w-1/2 flex justify-center items-center'>
                                    {testcase3Status === "" ? (
                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                    ) : testcase3Status === "pass" ? (
                                        <>
                                            <Check className='h-6 w-6 mr-2 bg-green-400 rounded-full' /> Passed
                                        </>
                                    ) : (
                                        <>
                                            <X className='h-6 w-6 mr-2 bg-red-500 rounded-full' /> Failed
                                        </>
                                    )
                                    }
                                </div>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    {!executingTestcases && (
                        <AlertDialogFooter>
                            <AlertDialogCancel className='bg-primary hover:bg-primary/80 text-white hover:text-white w-full' onClick={closeTestCaseModel}>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={SubmitTestModel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Question </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure want to submit question ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSubmitTestModel(false)} className='bg-red-500 text-white w-full hover:bg-red-400 hover:text-white'>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={submitQuestion} className='w-full' disabled={isLoading}>
                            {isLoading && (
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={EndTestModel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Codes ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure want to submit Codes ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setEndTestModel(false)} className='bg-red-500 text-white w-full hover:bg-red-400 hover:text-white'>Close</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={submitCode}
                            className='w-full' disabled={isLoading}>
                            {routeBtnLoading && (
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
};

export default CodeView;