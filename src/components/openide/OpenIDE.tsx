"use client"

import { useState, useEffect, useCallback } from "react";

import { autocompletion } from "@codemirror/autocomplete";
import type { Extension } from "@codemirror/state";
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { useTheme } from 'next-themes';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "../ui/button";
import { LoaderIcon, Play } from "lucide-react";
import { toast } from "sonner"
import {
    getCustomCompletionSource,
    isCodeMirrorLanguage,
    loadLanguageExtension,
    type CodeLanguage,
} from "@/components/code/code-mirror-language";
import { LanguageVersionSelect } from "@/components/code/language-version-select";
import {
    getInitialVersionProfileId,
    getProfileById,
    getProfilesForLanguage,
    LANGUAGES,
    setStoredVersionForLang,
    type LanguageId,
    type RuntimeProfile,
} from "@/lib/runtime-registry";
import { judgeRunSingle, type SingleRunOutcome } from "@/lib/wasm-judge";

const STARTER_TEMPLATES: Partial<Record<LanguageId, string>> = {
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n`,
    cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n`,
    python: `print("Hello from Python!")\n`,
    sql: `CREATE TABLE students (id INTEGER, name TEXT, marks INTEGER);\nINSERT INTO students VALUES (1, 'Asha', 92), (2, 'Rahul', 85);\n\nSELECT * FROM students WHERE marks > 88;`,
    javascript: `console.log("Hello from JavaScript!");\n`,
    typescript: `const greet = (name: string): void => {\n    console.log(\`Hello from TypeScript, \${name}!\`);\n};\n\ngreet("AtomCode");\n`,
    ruby: `puts "Hello from Ruby!"\n`,
};

const OpenIDE = () => {
    const { theme } = useTheme();
    const [userCode, setUserCode] = useState(STARTER_TEMPLATES.python ?? "")
    const [lang, setLang] = useState<LanguageId>("python")
    const [versionProfileId, setVersionProfileId] = useState<string | undefined>(() =>
        getInitialVersionProfileId("python")
    )
    const [inputs, setInputs] = useState('')
    const [output, setOutput] = useState('')
    const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: (string | null)[][] } | null>(null)
    const [running, setRunning] = useState(false)
    const [runtimeError, setRuntimeError] = useState('')
    const [lastRun, setLastRun] = useState<SingleRunOutcome | null>(null)
    const [languageExtension, setLanguageExtension] = useState<{
        extension: unknown;
        completion: ReturnType<typeof getCustomCompletionSource>;
    } | null>(null)

    const profile: RuntimeProfile | undefined = versionProfileId
        ? getProfileById(versionProfileId)
        : getProfilesForLanguage(lang)[0];

    // Load the CodeMirror extension whenever the language changes.
    useEffect(() => {
        let cancelled = false;
        if (!isCodeMirrorLanguage(lang)) {
            setLanguageExtension(null);
            return;
        }
        loadLanguageExtension(lang).then((extension) => {
            if (cancelled) return;
            setLanguageExtension({
                extension,
                completion: getCustomCompletionSource(lang as CodeLanguage),
            });
        });
        return () => { cancelled = true; };
    }, [lang]);

    const applyLanguage = useCallback((nextLang: LanguageId) => {
        setLang(nextLang);
        setUserCode(STARTER_TEMPLATES[nextLang] ?? "");
        setOutput("");
        setRuntimeError("");
        setLastRun(null);
        setSqlResult(null);
        setVersionProfileId(getInitialVersionProfileId(nextLang));
    }, []);

    const handleVersionChange = (profileId: string) => {
        setVersionProfileId(profileId);
        setStoredVersionForLang(lang, profileId);
    };

    const RunCode = async () => {
        if (!profile) {
            toast.warning("Select a language first!");
            return;
        }
        setRunning(true)
        setOutput("")
        setRuntimeError("")
        setLastRun(null)
        setSqlResult(null)
        try {
            const outcome = await judgeRunSingle({
                lang: profile.language,
                versionProfileId: profile.id,
                code: userCode,
                input: inputs,
            });
            setLastRun(outcome);
            if (outcome.compileMessage === "Error") {
                setRuntimeError(outcome.stderr || "Execution failed.");
                if (outcome.timedOut) {
                    toast.warning("Execution timed out!");
                } else {
                    toast.error("Execution error!");
                }
            } else {
                setOutput(outcome.output);
                if (outcome.sql) setSqlResult(outcome.sql);
            }
        } catch (error) {
            setRuntimeError(error instanceof Error ? error.message : String(error));
            toast.warning("Something went wrong!");
        } finally {
            setRunning(false)
        }
    };

    const stdinSupported = profile?.features.stdin ?? false;
    const isSql = lang === "sql";

    const groups: { label: string; ids: LanguageId[] }[] = [
        { label: "Core languages", ids: LANGUAGES.filter((l) => l.group === "core").map((l) => l.id) },
        { label: "Web & scripting", ids: LANGUAGES.filter((l) => l.group === "web").map((l) => l.id) },
    ];

    return (
        <>
            <div className="w-full h-[88vh] flex flex-col items-center justify-center flex-grow">
                <div className="h-full w-full flex flex-col mx-4 items-center ">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="max-w-full max-h-screen rounded-lg border">
                        <ResizablePanel defaultSize={70} minSize={60}>
                            <CodeMirror
                                value={userCode}
                                theme={theme === "dark" ? vscodeDark : eclipse}
                                extensions={[
                                    languageExtension?.extension as Extension | undefined,
                                    languageExtension?.completion &&
                                    autocompletion({ override: [languageExtension.completion] }),
                                ].filter(Boolean) as Extension[]}
                                style={{ fontSize: 16, minHeight: "95%" }}
                                onChange={setUserCode}
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={30} minSize={20}>
                            <div className="h-full flex justify-center items-center flex-col gap-4">
                                <div className="h-3/6 w-full flex flex-col justify-center items-center">
                                    <div className="w-full flex flex-row justify-center items-center gap-[2%] px-1 pt-1">
                                        <Select value={lang} onValueChange={(value) => applyLanguage(value as LanguageId)}>
                                            <SelectTrigger className="w-[45%]" aria-label="Language">
                                                <SelectValue placeholder="Select Language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map((group) => (
                                                    <SelectGroup key={group.label}>
                                                        <SelectLabel>{group.label}</SelectLabel>
                                                        {group.ids.map((id) => (
                                                            <SelectItem key={id} value={id}>
                                                                {LANGUAGES.find((l) => l.id === id)?.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <LanguageVersionSelect
                                            lang={lang}
                                            value={versionProfileId}
                                            onChange={handleVersionChange}
                                            className="w-[33%]"
                                        />
                                        <Button className="w-[18%]" onClick={RunCode} disabled={running}>
                                            {running ? (
                                                <LoaderIcon className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Play className='h-4 w-4 mr-2' /> Run
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex-1 w-full min-h-0">
                                        {isSql ? (
                                            <div className="w-full h-full opacity-60">
                                                <Label htmlFor="inputs" className="text-primary my-4 font-bold mx-1">Custom Inputs</Label>
                                                <Textarea placeholder="SQL executes against an in-memory database — stdin is not used." id="inputs"
                                                    disabled
                                                    className="resize-none bg-gray-700/10 w-[98%] h-24 mx-1 shadow-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full">
                                                <Label htmlFor="inputs" className="text-primary my-4 font-bold mx-1">Custom Inputs</Label>
                                                <Textarea placeholder={stdinSupported ? "Provide custom inputs here." : "This runtime does not support stdin."} id="inputs"
                                                    disabled={!stdinSupported}
                                                    className="resize-none bg-gray-700/10 w-[98%] h-full min-h-24 mx-1 shadow-md"
                                                    value={inputs}
                                                    onChange={(e) => setInputs(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="h-3/6 w-full flex justify-center flex-col items-center">
                                    <div className="h-[90%] w-[98%] flex flex-col">
                                        <p className="text-primary font-semibold ">Output</p>
                                        {sqlResult && sqlResult.columns.length > 0 ? (
                                            <div className="h-full max-h-[30rem] w-full rounded-md border overflow-auto my-3">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-muted">
                                                            {sqlResult.columns.map((column) => (
                                                                <th key={column} className="text-left px-2 py-1 font-semibold whitespace-nowrap">{column}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sqlResult.rows.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className="border-t">
                                                                {row.map((cell, cellIndex) => (
                                                                    <td key={cellIndex} className="px-2 py-1 whitespace-nowrap">{cell === null ? "NULL" : cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <pre className=" h-full max-h-[30rem] max-w-[40rem] w-full rounded-md border overflow-auto my-3 p-2 whitespace-pre-wrap">
                                                {runtimeError
                                                    ? <span className="text-destructive">{runtimeError}</span>
                                                    : (output || "Output will appear here.")}
                                            </pre>
                                        )}
                                        {lastRun && lastRun.compileMessage !== "Error" && (
                                            <p className="text-[11px] text-muted-foreground -mt-2">
                                                {lastRun.profileLabel} · {Math.round(lastRun.durationMs)} ms
                                                {lastRun.sql && lastRun.sql.changes ? ` · ${lastRun.sql.changes} change(s)` : ""}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </>
    )
}

export default OpenIDE
