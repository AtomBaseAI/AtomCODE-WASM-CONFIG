"use client"

import { useState, useTransition } from "react"

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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { StudentRegisterSchema } from "@/schemas/auth-schema"
import { FormError } from "./form-error"
import { FormSuccess } from "./form-success"
import { registerStudent as register } from "@/actions/register"
import Link from "next/link"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


export function RegisterFormStudent() {
    const form = useForm<z.infer<typeof StudentRegisterSchema>>({
        resolver: zodResolver(StudentRegisterSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
            batch: '',
            department: '',
            section: '',
        }
    })

    const [isLoading, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof StudentRegisterSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            register(values)
                .then((data) => {
                    setError(data.error)
                    setSuccess(data.success)
                })
        })
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="grid gap-2">
                        <div className="grid gap-1">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="atomuser"
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
                                name="rollnumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rollnumber</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="24bcs001"
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="user@atomcode.dev"
                                                type="email"
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="******"
                                                type="password"
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
                                name="batch"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Batch</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a Batch" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="2021-2025">2021-2025</SelectItem>
                                                <SelectItem value="2022-2026">2022-2026</SelectItem>
                                                <SelectItem value="2023-2027">2023-2027</SelectItem>
                                                <SelectItem value="2024-2028">2024-2028</SelectItem>
                                                <SelectItem value="2025-2029">2025-2029</SelectItem>
                                                <SelectItem value="2026-2030">2026-2030</SelectItem>
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
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a Department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cse">CSE</SelectItem>
                                                <SelectItem value="it">IT</SelectItem>
                                                <SelectItem value="iot">IOT</SelectItem>
                                                <SelectItem value="cys">Cyber Security</SelectItem>
                                                <SelectItem value="aids">AI & DS</SelectItem>
                                                <SelectItem value="aiml">AI & ML</SelectItem>
                                                <SelectItem value="mech">Mechanical</SelectItem>
                                                <SelectItem value="civil">Civil</SelectItem>
                                                <SelectItem value="eee">EEE</SelectItem>
                                                <SelectItem value="ece">ECE</SelectItem>
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
                                name="section"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a Section" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="a">A</SelectItem>
                                                <SelectItem value="b">B</SelectItem>
                                                <SelectItem value="c">C</SelectItem>
                                                <SelectItem value="d">D</SelectItem>
                                                <SelectItem value="e">E</SelectItem>
                                                <SelectItem value="f">F</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button disabled={isLoading}>
                            {isLoading && (
                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign Up
                        </Button>
                    </div>
                </form>
            </Form>
            <p>Already have an account ? <Link href='/login' className="text-primary font-bold ml-3 underline"> Login </Link></p>
        </div>
    )
}