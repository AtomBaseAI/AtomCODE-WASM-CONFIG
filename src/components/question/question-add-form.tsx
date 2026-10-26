"use client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Ban, CheckCircle, MessageCircleWarning, Play, Plus } from "lucide-react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoaderIcon } from "lucide-react"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormError } from "@/components/auth/form-error"
import { FormSuccess } from "@/components/auth/form-success"
import { AddQuestionSchema } from "@/schemas/question-schema"
import { Textarea } from "@/components/ui/textarea"
import { addquestion } from "@/actions/question"
import { toast } from "sonner"
import { LanguageVersionSelect } from "@/components/code/language-version-select";
import {
    getInitialVersionProfileId,
    setStoredVersionForLang,
} from "@/lib/runtime-registry";
import { judgeRunTestCases } from "@/lib/wasm-judge";
interface AddQuestionProps {
    groups?: { id: string; title: string }[]
    /** When set, the question is created inside this group and the group select is locked. */
    lockedGroup?: { id: string; title: string }
    triggerLabel?: string
}

const AddQuestion = ({ groups = [], lockedGroup, triggerLabel = "Add Question" }: AddQuestionProps) => {
    const router = useRouter()
    const form = useForm<z.infer<typeof AddQuestionSchema>>({
        resolver: zodResolver(AddQuestionSchema),
        defaultValues: {
            title: '',
            description: '',
            sampleinput1: '',
            sampleinput2: '',
            sampleoutput1: '',
            sampleoutput2: '',
            input1: '',
            input2: '',
            input3: '',
            output1: '',
            output2: '',
            output3: '',
            sourcecode: '',
            referenceimg: '',
            maxscore: 10,
            difficulty: '',
            lang: '',
            topic: '',
            subtopic: '',
            inputconstrains: '',
            blacklist: '',
            whitelist: '',
            questionGroupId: lockedGroup?.id ?? 'none'
        }
    })
    const [testCaseStatus, setTestCaseStatus] = useState({
        sample1: "",
        sample2: "",
        input1: "",
        input2: "",
        input3: ""
    });
    const [open, setOpen] = useState(false)
    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [hidesubmit, setHideSubmit] = useState(true)
    const [testProcess, setTestProcess] = useState(false)
    const [runVersionProfileId, setRunVersionProfileId] = useState<string | undefined>(undefined)
    const selectedLang = form.watch("lang")
    const handleSubmit = (values: z.infer<typeof AddQuestionSchema>) => {
        setError("")
        setSuccess("")
        // The Select uses the "none" sentinel for ungrouped — map it to null.
        // Inside a group page the group is locked and always sent.
        const payload = {
            ...values,
            questionGroupId: lockedGroup
                ? lockedGroup.id
                : values.questionGroupId && values.questionGroupId !== 'none'
                    ? values.questionGroupId
                    : null,
        }
        startTransition(() => {
            addquestion(payload)
                .then((data) => {

                    // setError(data.error)
                    // setSuccess(data.success)
                    if (data.success) {
                        form.reset()
                        setOpen(false)
                        toast.success(data.success);
                        router.refresh()
                        setTestCaseStatus({
                            sample1: "",
                            sample2: "",
                            input1: "",
                            input2: "",
                            input3: "",
                        });
                        setHideSubmit(true)
                    }
                })
                .catch(() => toast.error("Something went wrong!"));
        })
    }
    const RunCode = async () => {
        setTestProcess(true);
        const lang = form.getValues("lang");
        if (!lang) {
            console.error("Select a language before running test cases");
            setTestProcess(false);
            return;
        }

        const testCases = [
            { input: form.getValues("input1"), expectedOutput: form.getValues("output1"), tcid: "input1" as keyof typeof testCaseStatus },
            { input: form.getValues("input2"), expectedOutput: form.getValues("output2"), tcid: "input2" as keyof typeof testCaseStatus },
            { input: form.getValues("input3"), expectedOutput: form.getValues("output3"), tcid: "input3" as keyof typeof testCaseStatus },
            { input: form.getValues("sampleinput1"), expectedOutput: form.getValues("sampleoutput1"), tcid: "sample1" as keyof typeof testCaseStatus },
            { input: form.getValues("sampleinput2"), expectedOutput: form.getValues("sampleoutput2"), tcid: "sample2" as keyof typeof testCaseStatus },
        ];

        let newTestCaseStatus = { ...testCaseStatus };

        try {
            // Mark all cases as processing, then verify locally via WASM.
            for (const { tcid } of testCases) {
                newTestCaseStatus[tcid] = "processing";
            }
            setTestCaseStatus({ ...newTestCaseStatus });

            // Client-side WASM execution (no external judge API).
            const outcomes = await judgeRunTestCases({
                lang,
                versionProfileId: runVersionProfileId,
                code: form.getValues("sourcecode") ?? "",
                cases: testCases.map(({ input, expectedOutput }) => ({ input, expectedOutput })),
            });

            testCases.forEach(({ tcid }, index) => {
                newTestCaseStatus[tcid] =
                    outcomes[index]?.status === "Success" ? "success" : "failed";
            });
        } catch (error) {
            console.error("Something went wrong!", error);
        }

        setTestCaseStatus(newTestCaseStatus);
        setTestProcess(false);

        const allSuccessful = Object.values(newTestCaseStatus).every(
            (status) => status === "success"
        );

        setHideSubmit(!allSuccessful);
    };

    const getStatusColor = (status: string) =>
        status === "processing" ? "bg-cyan-400" :
            status === "success" ? "bg-green-400" :
                status === "failed" ? "bg-red-400" :
                    "bg-orange-400";
    const getStatusIcon = (status: string) =>
        status === "processing" ? <LoaderIcon className="animate-spin" /> :
            status === "success" ? <CheckCircle /> :
                status === "failed" ? <Ban /> :
                    <MessageCircleWarning />;
    const handleModalClose = () => {
        form.reset();  // Reset the form
        setTestCaseStatus({
            sample1: "",
            sample2: "",
            input1: "",
            input2: "",
            input3: ""
        });
        setHideSubmit(true);
        setError("");
        setSuccess("");
    };
    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => {
                if (!isOpen) handleModalClose();
                setOpen(isOpen);
            }}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="bg-green-500 text-white  hover:bg-green-700 hover:text-white">
                        <Plus className="mr-2" />
                        {triggerLabel}
                    </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[100vw] h-[100vh] overflow-y-auto overflow-x-hidden">
                    <DialogHeader>
                        <DialogTitle>{triggerLabel}</DialogTitle>
                    </DialogHeader>

                    <div className="w-full h-full">
                        <Form {...form}>
                            <form>
                                <div className="grid grid-cols-3 gap-2 gap-y-2">
                                    <div className="grid gap-1 col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question Title</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Question"
                                                            type="text"
                                                            autoComplete='false'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-1 col-span-1 row-span-8">
                                        <FormField
                                            control={form.control}
                                            name="sourcecode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Server Code</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="< Code >"
                                                            className="resize-none h-[92%]"
                                                            {...field}
                                                            autoComplete='false'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-3 col-span-2 h-full">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Question Description"
                                                            className="resize-none "
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="input1"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Testcase Input 1</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Testcase Input"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="output1"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Testcase Output 1</FormLabel>
                                                    <div className="flex flex-row justify-center items-center">
                                                        <FormControl>
                                                            <Textarea
                                                                disabled={isLoading}
                                                                placeholder="Testcase Output"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <div className="w-[10%] h-full">
                                                            <div className={`${getStatusColor(testCaseStatus.input1)} h-[3rem] w-[3rem] flex justify-center items-center rounded-md text-white`}>
                                                                {getStatusIcon(testCaseStatus.input1)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="input2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Testcase Input 2</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Testcase Input"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="output2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Testcase Output 2</FormLabel>
                                                    <div className="flex flex-row justify-center items-center">
                                                        <FormControl>
                                                            <Textarea
                                                                disabled={isLoading}
                                                                placeholder="Testcase Output"
                                                                className="resize-none "
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <div className="w-[10%] h-full">
                                                            <div className={`${getStatusColor(testCaseStatus.input2)} h-[3rem] w-[3rem] flex justify-center items-center rounded-md text-white`}>
                                                                {getStatusIcon(testCaseStatus.input2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="input3"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Testcase Input 3</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Testcase Input"
                                                            className="resize-none "
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="output3"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Testcase Output 3</FormLabel>
                                                    <div className="flex flex-row justify-center items-center">
                                                        <FormControl>
                                                            <Textarea
                                                                disabled={isLoading}
                                                                placeholder="Testcase Output"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <div className="w-[10%] h-full">
                                                            <div className={`${getStatusColor(testCaseStatus.input3)} h-[3rem] w-[3rem] flex justify-center items-center rounded-md text-white`}>
                                                                {getStatusIcon(testCaseStatus.input3)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid col-span-1 row-span-6">
                                        <div className="grid gap-1">
                                            <FormField
                                                control={form.control}
                                                name="difficulty"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Difficulty</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Difficulty" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="easy">Easy</SelectItem>
                                                                <SelectItem value="medium">Medium</SelectItem>
                                                                <SelectItem value="hard">Hard</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            <FormField
                                                control={form.control}
                                                name="lang"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Language</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Language" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="c">C</SelectItem>
                                                                <SelectItem value="cpp">C++</SelectItem>
                                                                <SelectItem value="java">Java</SelectItem>
                                                                <SelectItem value="python">Python</SelectItem>
                                                                <SelectItem value="sql">SQL (SQLite)</SelectItem>
                                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                                <SelectItem value="typescript">TypeScript</SelectItem>
                                                                <SelectItem value="ruby">Ruby</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            <FormField
                                                control={form.control}
                                                name="referenceimg"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Refrence Image URL</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                disabled={isLoading}
                                                                placeholder="(optional)"
                                                                type="text"
                                                                autoComplete='false'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            <FormField
                                                control={form.control}
                                                name="maxscore"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Maximum Score</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                disabled={true}
                                                                placeholder="10"
                                                                type="text"
                                                                autoComplete='false'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="sampleinput1"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sample Input 1</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Sample Input"
                                                            className="resize-none "
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="sampleoutput1"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sample Output 1</FormLabel>
                                                    <div className="flex flex-row justify-center items-center">
                                                        <FormControl>
                                                            <Textarea
                                                                disabled={isLoading}
                                                                placeholder="Sample Output"
                                                                className="resize-none "
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <div className="w-[10%] h-full">
                                                            <div className={`${getStatusColor(testCaseStatus.sample1)} h-[3rem] w-[3rem] flex justify-center items-center rounded-md text-white`}>
                                                                {getStatusIcon(testCaseStatus.sample1)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="sampleinput2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sample Input 2</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Sample Input"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="sampleoutput2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sample Output 2</FormLabel>
                                                    <div className="flex flex-row justify-center items-center">
                                                        <FormControl>
                                                            <Textarea
                                                                disabled={isLoading}
                                                                placeholder="Sample Output"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <div className="w-[10%] h-full">
                                                            <div className={`${getStatusColor(testCaseStatus.sample2)} h-[3rem] w-[3rem] flex justify-center items-center rounded-md text-white`}>
                                                                {getStatusIcon(testCaseStatus.sample2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="questionGroupId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question Group</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={lockedGroup ? lockedGroup.id : (field.value ?? 'none')}
                                                        disabled={isLoading || !!lockedGroup || (!lockedGroup && groups.length === 0)}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder={lockedGroup ? lockedGroup.title : groups.length ? "Select a group (optional)" : "No groups created yet"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {lockedGroup ? (
                                                                <SelectItem value={lockedGroup.id}>
                                                                    {lockedGroup.title}
                                                                </SelectItem>
                                                            ) : (
                                                                <>
                                                                    <SelectItem value="none">No group</SelectItem>
                                                                    {groups.map((g) => (
                                                                        <SelectItem key={g.id} value={g.id}>
                                                                            {g.title}
                                                                        </SelectItem>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {lockedGroup && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Questions are created inside this group.
                                                        </p>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Topic</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="(optional)"
                                                            type="text"
                                                            autoComplete='false'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="subtopic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sub Topic</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="(optional)"
                                                            type="text"
                                                            autoComplete='false'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-3 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="inputconstrains"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Input Constrains</FormLabel>
                                                    <div className="flex flex-row justify-center items-center">
                                                        <FormControl>
                                                            <Textarea
                                                                disabled={isLoading}
                                                                placeholder="(optional)"
                                                                className="resize-none h-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {/* blacklist: '',
                                    whitelist: '' */}
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="blacklist"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Blacklist</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="use ',' between keywords. (optional)"
                                                            type="text"
                                                            autoComplete='false'

                                                            className="bg-red-600/5"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="whitelist"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Whitelist</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="use ',' between keywords. (optional)"
                                                            type="text"
                                                            autoComplete='false'

                                                            className="bg-green-600/5"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>
                        <div className="flex col-span-3 gap-1 justify-center mt-4">
                            <FormError message={error} />
                            <FormSuccess message={success} />
                            {hidesubmit ? (
                                <div className="flex flex-col items-center gap-1">
                                    <Button disabled={testProcess} className="w-1/3 bg-orange-500 hover:bg-orange-600 " onClick={RunCode} >
                                        {testProcess && (
                                            <LoaderIcon className="ml-2 animate-spin" />
                                        )}
                                        Run Test Cases
                                    </Button>
                                    {selectedLang && (
                                        <LanguageVersionSelect
                                            lang={selectedLang}
                                            value={runVersionProfileId ?? getInitialVersionProfileId(selectedLang)}
                                            onChange={(profileId) => {
                                                setRunVersionProfileId(profileId);
                                                setStoredVersionForLang(selectedLang, profileId);
                                            }}
                                            className="w-[280px]"
                                            disabled={testProcess}
                                        />
                                    )}
                                </div>
                            ) : (
                                <Button disabled={isLoading} className="w-1/3" onClick={form.handleSubmit(handleSubmit)}>
                                    {isLoading && (
                                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Create Question
                                </Button>
                            )}
                        </div>
                    </div>

                </DialogContent>
            </Dialog >
        </>
    )
}

export default AddQuestion