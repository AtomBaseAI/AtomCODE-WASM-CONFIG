import BackBtn from "@/components/backbtn"
import CodeEditor from "@/components/ide/codeeditor"
import EditQuestionForm from "@/components/question/question-edit-form"
import { getQuestionById } from "@/data/questions"
import { getAllQuestionGroups } from "@/data/question-groups"


const EditQuestion = async ({ params }: { params: Promise<{ qid: string}> }) => {

    const { qid } = await params
    const question = await getQuestionById(qid)
    const groups = await getAllQuestionGroups()
    const questionx = {
        id: qid,
        title: question?.title || '',
        description: question?.description || '',
        sampleinput1: question?.sampleinput1 || '',
        sampleinput2: question?.sampleinput2 || '',
        sampleoutput1: question?.sampleoutput1 || '',
        sampleoutput2: question?.sampleoutput2 || '',
        input1: question?.input1 || '',
        input2: question?.input2 || '',
        input3: question?.input3 || '',
        output1: question?.output1 || '',
        output2: question?.output2 || '',
        output3: question?.output3 || '',
        sourcecode: question?.sourcecode || '',
        referenceimg: question?.referenceimg || '',
        maxscore: question?.maxscore || 0,
        difficulty: question?.difficulty || '',
        lang: question?.lang || '',
        topic: question?.topic || '',
        subtopic: question?.subtopic || '',
        inputconstrains: question?.inputconstrains || '',
        blacklist: question?.blacklist || '',
        whitelist: question?.whitelist || '',
        questionGroupId: question?.questionGroupId || ''
    };
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{question?.title}</h2>
                    </div>
                </div>

                <div className="w-full p-4 shadow-md border flex flex-col">
                    <div className="w-full border p-1">
                        <div className="flex w-full justify-between items-center px-2 py-2">
                            <h4 className="text-primary font-bold">Question Details</h4>
                            <div className="flex gap-2">
                                <EditQuestionForm
                                    question={questionx}
                                    groups={(groups ?? []).map((g) => ({ id: g.id, title: g.title }))}
                                />
                                <BackBtn />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-4 px-2 py-4">
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-2">
                                <div className="text-primary font-bold">
                                    Question
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    {questionx.title}
                                </div>
                            </div>
                            <div className="flex flex-col h-full w-full justify-center flex-1 col-span-1 row-span-10">
                                <div className="text-primary font-bold">
                                    Server Code
                                </div>
                                <div className="border-2 h-full flex items-center px-2 rounded-md line-clamp-1">
                                    {/* <pre>
                                        {questionx.sourcecode}
                                    </pre> */}
                                    <CodeEditor Code={questionx.sourcecode} readonly={true} lang={questionx.lang} />
                                </div>
                            </div>

                            <div className="flex flex-row h-40 w-full justify-center flex-1 col-span-2 gap-4">
                                <div className="w-1/2 flex flex-col">

                                    <div className="text-primary font-bold">
                                        Description
                                    </div>

                                    <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-2 text-wrap">
                                        {questionx.description}
                                    </div>
                                </div>
                                <div className="w-1/2 flex flex-col">

                                    <div className="text-primary font-bold">
                                        Input Constrains
                                    </div>

                                    <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                        {
                                            questionx.inputconstrains !== null && questionx.inputconstrains !== undefined && questionx.inputconstrains !== "" ? questionx.inputconstrains : "Not Available"
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
                                            questionx.blacklist !== null && questionx.blacklist !== undefined && questionx.blacklist !== "" ? questionx.blacklist : "Not Available"
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
                                            questionx.whitelist !== null && questionx.whitelist !== undefined && questionx.whitelist !== "" ? questionx.whitelist : "Not Available"
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
                                        {questionx.input1}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Testcase Output 1
                                </div>
                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre className="py-1">
                                        {questionx.output1}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Testcase Input 2
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.input2}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Testcase Output 2
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.output2}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Testcase Input 3
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.input3}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Testcase Output 3
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.output3}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Sample Input 1
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.sampleinput1}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Sample Output 1
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.sampleoutput1}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Sample Input 2
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.sampleinput2}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Sample Output 2
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    <pre>
                                        {questionx.sampleoutput2}
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
                                            questionx.topic !== null && questionx.topic !== undefined && questionx.topic !== "" ? questionx.topic : "Not Available"
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
                                            questionx.subtopic !== null && questionx.subtopic !== undefined && questionx.subtopic !== "" ? questionx.subtopic : "Not Available"
                                        }
                                    </pre>
                                </div>
                            </div>

                            <div className="flex flex-col h-20 w-full justify-center flex-1 col-span-1">
                                <div className="text-primary font-bold">
                                    Question Group
                                </div>

                                <div className="bg-gray-600/20 h-full flex items-center px-2 rounded-md line-clamp-1 overflow-y-auto py-1">
                                    {
                                        question?.questionGroup?.title ? question.questionGroup.title : "Not Available"
                                    }
                                </div>
                            </div>

                            <div className="flex flex-row border shadow flex-1  col-span-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Difficulty
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {questionx.difficulty}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1  col-span-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Refercence Image
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1 ">
                                    <p className="line-clamp-1">

                                        {
                                            questionx.referenceimg !== null && questionx.referenceimg !== undefined && questionx.referenceimg !== "" ? questionx.referenceimg : "Not Available"
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1  col-span-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Language
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {questionx.lang.toLocaleLowerCase()}
                                </div>
                            </div>
                            <div className="flex flex-row border shadow flex-1  col-span-1">
                                <div className="h-full bg-primary/90 text-white rounded-md w-[30%] text-center p-1">
                                    Maximum Score
                                </div>
                                <div className="flex items-center justify-center  w-[70%] p-1">
                                    {questionx.maxscore}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EditQuestion