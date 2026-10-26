"use client"
import React, { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import type { Extension } from '@codemirror/state';
import { useTheme } from 'next-themes';
import { isCodeMirrorLanguage, loadLanguageExtension } from '@/components/code/code-mirror-language';

interface CodeProps {
    Code: any
    readonly: boolean
    lang: string
}


const CodeEditor = ({ Code, readonly, lang }: CodeProps) => {
    const { theme } = useTheme()
    const [extension, setExtension] = useState<Extension | null>(null)

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!lang || !isCodeMirrorLanguage(lang)) return null;
            return loadLanguageExtension(lang);
        };
        load().then((loaded) => {
            if (cancelled) return;
            setExtension((loaded as Extension) ?? null);
        });
        return () => { cancelled = true; };
    }, [lang])

    return (
        <>
            <div className='h-full w-full overflow-auto dark:bg-[#1e1e1e]'>
                <CodeMirror
                    value={
                        Code
                    }
                    theme={theme === 'dark' ? vscodeDark : eclipse}
                    extensions={extension ? [extension] : []}
                    style={{ fontSize: 16 }}
                    readOnly={readonly}
                />
            </div>
        </>
    )
}

export default CodeEditor
