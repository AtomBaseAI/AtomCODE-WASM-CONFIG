"use client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Plus } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
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
import { QuestionUpdateSchema } from "@/schemas/question-schema"
import { Textarea } from "@/components/ui/textarea"
import { updatequestion } from "@/actions/question"
import CodeEditor from "../ide/codeeditor"
import { toast } from "sonner"

interface EditQuestionFormProps {
    question: z.infer<typeof QuestionUpdateSchema>
    groups?: { id: string; title: string }[]
}

const EditQuestionForm = ({ question, groups = [] }: EditQuestionFormProps) => {

    const form = useForm<z.infer<typeof QuestionUpdateSchema>>({
        resolver: zodResolver(QuestionUpdateSchema),
        defaultValues: {
            id: question.id,
            title: question.title,
            description: question.description,
            sampleinput1: question.sampleinput1,
            sampleinput2: question.sampleinput2,
            sampleoutput1: question.sampleoutput1,
            sampleoutput2: question.sampleoutput2,
            input1: question.input1,
            input2: question.input2,
            input3: question.input3,
            output1: question.output1,
            output2: question.output2,
            output3: question.output3,
            sourcecode: question.sourcecode,
            referenceimg: question.referenceimg || undefined,
            maxscore: question.maxscore,
            difficulty: question.difficulty,
            lang: question.lang,
            topic: question.topic,
            subtopic: question.subtopic,
            inputconstrains: question.inputconstrains,
            blacklist: question.blacklist,
            whitelist: question.whitelist,
            questionGroupId: question.questionGroupId || 'none'
        }
    })
    const { reset } = form;

    // Update form values when `question` prop changes
    useEffect(() => {
        reset({
            id: question.id,
            title: question.title,
            description: question.description,
            sampleinput1: question.sampleinput1,
            sampleinput2: question.sampleinput2,
            sampleoutput1: question.sampleoutput1,
            sampleoutput2: question.sampleoutput2,
            input1: question.input1,
            input2: question.input2,
            input3: question.input3,
            output1: question.output1,
            output2: question.output2,
            output3: question.output3,
            sourcecode: question.sourcecode,
            referenceimg: question.referenceimg || undefined,
            maxscore: question.maxscore,
            difficulty: question.difficulty,
            lang: question.lang,
            topic: question.topic,
            subtopic: question.subtopic,
            inputconstrains: question.inputconstrains,
            blacklist: question.blacklist,
            whitelist: question.whitelist,
            questionGroupId: question.questionGroupId || 'none'
        });
    }, [question, reset]);
    const [open, setOpen] = useState(false)
    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof QuestionUpdateSchema>) => {
        setError("")
        setSuccess("")
        // The Select uses the "none" sentinel for ungrouped — map it to null
        // so removing a group actually clears the relation.
        const payload = {
            ...values,
            questionGroupId:
                values.questionGroupId && values.questionGroupId !== 'none'
                    ? values.questionGroupId
                    : null,
        }
        startTransition(() => {
            updatequestion(payload)
                .then((data) => {
                    // setError(data.error)
                    // setSuccess(data.success)
                    if (data.success) {
                        form.reset()
                        setOpen(false)
                        toast.success(data.success);
                    }
                })
                .catch(() => toast.error("Something went wrong!"));
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant='outline' size='icon' className="border-primary bg-transparent hover:bg-purple-700/10 flex w-auto p-1 gap-1 text-primary justify-center items-center pr-3">
                        <Pencil className="size-5 bg-transparent text-primary" /> Edit
                    </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[100vw] h-[100vh] overflow-y-auto overflow-x-hidden">
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                    </DialogHeader>

                    <div className="grid">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <div className="grid grid-cols-3 gap-2 gap-y-3">
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
                                                            spellCheck='false'
                                                            wrap="soft"
                                                        />

                                                        {/* <CodeEditor Code={"hello"} readonly={false} lang={"java"} /> */}
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
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Testcase Output"
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
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Testcase Output"
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
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Testcase Output"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
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
                                                                <SelectItem value="java">Java</SelectItem>
                                                                <SelectItem value="cpp">C++</SelectItem>
                                                                <SelectItem value="c">C</SelectItem>
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
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Sample Output"
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
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={isLoading}
                                                            placeholder="Sample Output"
                                                            className="resize-none"
                                                            {...field}
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
                                            name="questionGroupId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question Group</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? 'none'}
                                                        disabled={isLoading || groups.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder={groups.length ? "Select a group (optional)" : "No groups created yet"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="none">No group</SelectItem>
                                                            {groups.map((g) => (
                                                                <SelectItem key={g.id} value={g.id}>
                                                                    {g.title}
                                                                </SelectItem>
                                                            ))}
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
                                                            placeholder="use ',' between keywords (optional)"
                                                            type="text"
                                                            autoComplete='false'
                                                            className="bg-red-600/10"
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
                                                            placeholder="use ',' between keywords (optional)"
                                                            type="text"
                                                            autoComplete='false'
                                                            className="bg-green-600/10"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex col-span-3 gap-1 justify-center mt-4">

                                        <FormError message={error} />
                                        <FormSuccess message={success} />
                                        <Button disabled={isLoading} className="w-1/3">
                                            {isLoading && (
                                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Update Question
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>


                </DialogContent>
            </Dialog>
        </>
    )
}

export default EditQuestionForm