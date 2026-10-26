'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2 } from 'lucide-react';
import AIAnalyze from '@/actions/ai';
// import remarkGfm from 'remark-gfm';
// import remarkMath from "remark-math"
//import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
//import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
//import { CSSProperties } from "react";


import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
interface AtomAIProps {
    question: string;
    description: string;
    inputconstraints: string | null;
    blacklist: string | null;
    whitelist: string | null;
    testcasei1: string;
    testcasei2: string;
    testcaseo1: string;
    testcaseo2: string;
    code: string | null;
    theme: string,
    language: string
}
interface languageMap {
    [key: string]: string | undefined
}



const AtomAI: React.FC<AtomAIProps> = ({
    question,
    description,
    inputconstraints,
    blacklist,
    whitelist,
    testcasei1,
    testcasei2,
    testcaseo1,
    testcaseo2,
    code,
    theme,
    language
}) => {
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [languageExtension, setLanguageExtension] = useState<any>(null);

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                let extension;
                switch (language) {
                    case 'java': {
                        const { javaLanguage } = await import('@codemirror/lang-java');
                        extension = javaLanguage;
                        break;
                    }
                    case 'c':
                    case 'cpp': {
                        const { cppLanguage } = await import('@codemirror/lang-cpp');
                        extension = cppLanguage;
                        break;
                    }
                    case 'python': {
                        const { pythonLanguage } = await import('@codemirror/lang-python');
                        extension = pythonLanguage;
                        break;
                    }
                    default:
                        extension = null;
                }
                setLanguageExtension(extension);
            } catch (error) {
                console.error('Error loading language extension:', error);
            }
        };

        loadLanguage();
    }, [language]);
    const handleGenerate = async () => {
        setLoading(true);
        setResponse(null);
        try {
            const completion = await AIAnalyze({
                question,
                description,
                inputconstraints,
                blacklist,
                whitelist,
                testcasei1,
                testcasei2,
                testcaseo1,
                testcaseo2,
                code,
            });
            setResponse(completion);
        } catch (error) {
            console.error('Error calling AtomAI API:', error);
            setResponse('Failed to fetch a response from AtomAI , Try Later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <span className="mb-2 text-primary font-semibold">
                Enhance your code with
            </span>
            <Sheet>
                <SheetTrigger className="relative group">
                    <div
                        className="relative inline-block p-px font-semibold leading-6 text-white bg-primary dark:bg-gray-700 shadow-2xl cursor-pointer rounded-xl shadow-primary dark:shadow-zinc-800 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
                        onClick={handleGenerate}
                    >
                        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <span className="relative z-10 block px-6 py-3 rounded-xl bg-primary dark:bg-gray-950">
                            <div className="relative z-10 flex items-center space-x-2">
                                <span className="transition-all duration-500 group-hover:translate-x-1">ATOM AI</span>
                                <svg
                                    className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-1"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </span>
                    </div>
                </SheetTrigger>
                <SheetContent className="min-w-[45vw] sm:w-[640px]">
                    <SheetHeader>
                        <SheetTitle className="text-primary">Atom AI</SheetTitle>
                        <SheetDescription className='overflow-y-auto'>
                            <div className='h-full w-full flex justify-center items-center'>
                                {loading ? (
                                    <div className='h-[90vh] w-full flex justify-center items-center'>
                                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    </div>
                                ) : response ? (
                                    <div className="whitespace-pre-wrap p-4 rounded-md h-[90vh]">

                                        <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full break-words overflow-y-auto">
                                        <ReactMarkdown
                                            // remarkPlugins={[remarkGfm, remarkMath]}
                                            components={{
                                                code({ node, className, children, ...props }) {
                                                    const value = String(children).replace(/\n$/, '');
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return match ? (
                                                        <CodeMirror
                                                            value={String(children).replace(/\n$/, '')}
                                                            height="auto"
                                                            theme={theme === "dark" ? vscodeDark : eclipse}
                                                            extensions={languageExtension ? [languageExtension] : []}
                                                            editable={false}
                                                            basicSetup={{ lineNumbers: false }}
                                                        />
                                                    ) : (
                                                        <code
                                                            className={className}
                                                            {...props}
                                                            style={{ background: '#2d2d2d', padding: '4px' }}
                                                        >
                                                            {value}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        >
                                            {response}
                                        </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Thanks for using ATOM AI.</p>
                                )}
                            </div>
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet >
        </>
    );
};

export default AtomAI;
