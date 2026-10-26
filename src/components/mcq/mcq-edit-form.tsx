import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderIcon } from "lucide-react";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError } from "@/components/auth/form-error";
import { FormSuccess } from "@/components/auth/form-success";
import { Textarea } from "@/components/ui/textarea";
import { updateMCQ } from "@/actions/mcq";
import { MCQUpdateSchema } from "@/schemas/mcq-schema";
import { toast } from "sonner";

const EditMCQForm = ({ mcq }: { mcq: z.infer<typeof MCQUpdateSchema> }) => {
    const form = useForm<z.infer<typeof MCQUpdateSchema>>({
        resolver: zodResolver(MCQUpdateSchema),
        defaultValues: {
            id: mcq.id,
            title: mcq.title,
            description: mcq.description,
            Option1: mcq.Option1,
            Option2: mcq.Option2,
            Option3: mcq.Option3,
            Option4: mcq.Option4,
            CorrectOption: mcq.CorrectOption,
            referenceimg: mcq.referenceimg || "",
            codesnippet: mcq.codesnippet || "",
            iscodesnippet: mcq.iscodesnippet || false,
            topic: mcq.topic,
            subtopic: mcq.subtopic,
            moduleId: mcq.moduleId || null,
            assessmentId: mcq.assessmentId || null
        },
    });

    const [open, setOpen] = useState(false);
    const [isLoading, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<string | undefined>(undefined);

    const handleSubmit = (values: z.infer<typeof MCQUpdateSchema>) => {
        setError(undefined);
        setSuccess(undefined);
        startTransition(() => {
            updateMCQ(values)
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
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant='outline' size='icon' className="border-primary bg-transparent hover:bg-purple-700/10">
                        <Pencil className="size-5 bg-transparent text-primary" />
                    </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[85vw] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit MCQ</DialogTitle>
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
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-1 row-span-10 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="codesnippet"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Code Snippet</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Code Snippet"
                                                            className="resize-none h-[90%]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 col-span-1 row-span-2 h-full">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Question Description"
                                                            className="resize-none"
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
                                            name="iscodesnippet"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Is Code Snippet?</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(value: string) => {
                                                                const isCodeSnippet = value === "true";
                                                                form.setValue(
                                                                    "iscodesnippet",
                                                                    isCodeSnippet
                                                                );
                                                            }}
                                                            defaultValue={
                                                                form.getValues("iscodesnippet")
                                                                    ? "true"
                                                                    : "false"
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select">
                                                                    {form.getValues(
                                                                        "iscodesnippet"
                                                                    )
                                                                        ? "Yes"
                                                                        : "No"}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="true">
                                                                    Yes
                                                                </SelectItem>
                                                                <SelectItem value="false">
                                                                    No
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="Option1"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Option 1</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Option 1"
                                                            type="text"
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
                                            name="Option2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Option 2</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Option 2"
                                                            type="text"
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
                                            name="Option3"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Option 3</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Option 3"
                                                            type="text"
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
                                            name="Option4"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Option 4</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Option 4"
                                                            type="text"
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
                                            name="CorrectOption"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Correct Option</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(value: string) => {
                                                                form.setValue(
                                                                    "CorrectOption",
                                                                    parseInt(value, 10)
                                                                );
                                                            }}
                                                            defaultValue={form
                                                                .getValues("CorrectOption")
                                                                .toString()}
                                                            disabled={isLoading}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Correct Option">
                                                                    {form
                                                                        .getValues("CorrectOption")
                                                                        .toString()}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="1">
                                                                    Option 1
                                                                </SelectItem>
                                                                <SelectItem value="2">
                                                                    Option 2
                                                                </SelectItem>
                                                                <SelectItem value="3">
                                                                    Option 3
                                                                </SelectItem>
                                                                <SelectItem value="4">
                                                                    Option 4
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-1 row-span-2 col-span-1 h-full">
                                        <FormField
                                            control={form.control}
                                            name="referenceimg"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reference Image URL</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="(optional)"
                                                            type="text"
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
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Topic</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Topic"
                                                            type="text"
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
                                                    <FormLabel>Subtopic</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isLoading}
                                                            placeholder="Subtopic"
                                                            type="text"
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
                                            Update MCQ
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EditMCQForm;
