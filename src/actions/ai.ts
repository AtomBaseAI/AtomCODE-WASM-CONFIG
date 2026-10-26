'use server';

import OpenAI from "openai";

/**
 * Lazy OpenAI client: constructing this module eagerly (previous behavior)
 * threw at import time when OPENAI_API_KEY was unset, which crashed the
 * entire server-action bundle of any page importing the AI tutor — taking
 * unrelated actions (submitquestion, submitmodule, ...) down with it.
 * The client is now created on first use only.
 */
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  return openai;
}

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
}

const AIAnalyze = async ({
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
}: AtomAIProps): Promise<string> => {
    if (!process.env.OPENAI_API_KEY) {
        return "ATOM AI tutor is not configured on this server (missing OPENAI_API_KEY).";
    }
    const completion = await getOpenAI().chat.completions.create({
        model: (process.env.OPENAI_MODEL || "gpt-4o-mini"),
        messages: [
            {
                role: "system",
                content: " You are an expert programmer in all programming languages named ATOM AI, tasked with analyzing programming questions, test cases, and junior-level user code. Provide concise suggestions or key code snippets as needed in master level , do not provide entire code (important note - do not provide the entire code / entire example , provide only essential block of code & don't mention or show code based on whitelist & blocklist based data in output), highlighting best practices. Avoid revealing input data and share only essential guidance, please format your response using Markdown ",
            },
            {
                role: "user",
                content: `
                    Question: ${question}
                    Description: ${description}
                    Input Constraints: ${inputconstraints || "None"}
                    Blacklist: ${blacklist || "None"}
                    Whitelist: ${whitelist || "None"}
                    Test Case 1 Input: ${testcasei1}
                    Test Case 1 Output: ${testcaseo1}
                    Test Case 2 Input: ${testcasei2}
                    Test Case 2 Output: ${testcaseo2}
                    Code: ${code || "No code provided"}
                `,
            },
        ],
    });

    // console.log(completion.choices[0].message?.content?.trim())
    return completion.choices[0].message?.content?.trim() || "No response from AI.";
};

export default AIAnalyze;
