"use client"

import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { javaLanguage } from '@codemirror/lang-java';
import { useTheme } from 'next-themes';

const CodeSnippet = ({ code }: { code: any }) => {
    const { theme } = useTheme()
    return (
        <CodeMirror
            className='w-full'
            value={code}
            theme={theme === 'dark' ? vscodeDark : eclipse}
            extensions={[javaLanguage]}
            style={{ fontSize: 16 }}
            readOnly={true}
        />
    )
}

export default CodeSnippet