/**
 * Shared CodeMirror wiring: dynamic language extension loader + keyword
 * autocomplete for every language the runtime registry supports.
 *
 * Previously each of the four runner components and the OpenIDE duplicated
 * their own loader (java/cpp/python only). This module centralizes it and
 * extends coverage to C, C++, Java, Python, SQL, JavaScript, TypeScript and
 * Ruby so language support matches the runtime registry.
 */

import type { Completion, CompletionSource } from "@codemirror/autocomplete";

export type CodeLanguage =
  | "c"
  | "cpp"
  | "java"
  | "python"
  | "sql"
  | "javascript"
  | "typescript"
  | "ruby";

/** Languages with a bundled CodeMirror extension. */
export function isCodeMirrorLanguage(lang: string): lang is CodeLanguage {
  return [
    "c",
    "cpp",
    "java",
    "python",
    "sql",
    "javascript",
    "typescript",
    "ruby",
  ].includes(lang);
}

export const LANGUAGE_KEYWORDS: Record<CodeLanguage, string[]> = {
  java: [
    "class", "public", "private", "protected", "static", "void", "main",
    "int", "String", "boolean", "double", "float", "long", "char", "if",
    "else", "while", "for", "do", "switch", "case", "break", "continue",
    "try", "catch", "finally", "throw", "throws", "new", "return", "import",
    "package", "extends", "implements", "interface", "final", "this", "super",
    "System.out.println", "Scanner",
  ],
  python: [
    "def", "class", "import", "from", "as", "if", "elif", "else", "for",
    "while", "break", "continue", "return", "try", "except", "finally",
    "with", "lambda", "yield", "print", "input", "range", "len", "int",
    "str", "float", "list", "dict", "set", "tuple", "open", "None", "True",
    "False", "and", "or", "not", "in", "is", "global", "pass", "raise",
  ],
  c: [
    "int", "float", "char", "double", "void", "long", "short", "unsigned",
    "signed", "if", "else", "while", "for", "do", "switch", "case", "break",
    "continue", "return", "struct", "union", "enum", "typedef", "sizeof",
    "const", "static", "printf", "scanf", "include", "define", "NULL",
    "malloc", "free", "strlen", "strcmp",
  ],
  cpp: [
    "int", "float", "double", "char", "bool", "void", "class", "public",
    "private", "protected", "virtual", "override", "if", "else", "while",
    "for", "do", "switch", "case", "break", "continue", "return", "namespace",
    "using", "include", "template", "typename", "new", "delete", "this",
    "try", "catch", "throw", "std", "cout", "cin", "endl", "string", "vector",
  ],
  sql: [
    "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
    "DELETE", "CREATE", "TABLE", "PRIMARY", "KEY", "FOREIGN", "REFERENCES",
    "ALTER", "DROP", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "ON", "GROUP",
    "BY", "ORDER", "HAVING", "LIMIT", "AS", "AND", "OR", "NOT", "NULL",
    "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX", "LIKE", "IN", "BETWEEN",
  ],
  javascript: [
    "const", "let", "var", "function", "return", "if", "else", "for",
    "while", "do", "switch", "case", "break", "continue", "class", "extends",
    "new", "this", "try", "catch", "finally", "throw", "typeof", "instanceof",
    "async", "await", "import", "export", "from", "console.log", "true",
    "false", "null", "undefined", "of", "in",
  ],
  typescript: [
    "const", "let", "var", "function", "return", "if", "else", "for",
    "while", "class", "interface", "type", "enum", "implements", "extends",
    "public", "private", "protected", "readonly", "static", "new", "this",
    "try", "catch", "finally", "throw", "async", "await", "import", "export",
    "from", "console.log", "string", "number", "boolean", "any", "void",
    "never", "unknown", "as", "keyof",
  ],
  ruby: [
    "def", "end", "class", "module", "if", "elsif", "else", "unless",
    "while", "until", "for", "in", "do", "return", "yield", "begin", "rescue",
    "ensure", "raise", "puts", "print", "p", "gets", "attr_accessor",
    "attr_reader", "require", "include", "self", "nil", "true", "false",
    "and", "or", "not", "lambda", "proc", "each", "map", "select",
  ],
};

export function getCustomCompletionSource(
  lang: CodeLanguage
): CompletionSource {
  const keywords = LANGUAGE_KEYWORDS[lang] ?? [];
  return (context) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    return {
      from: word.from,
      options: keywords.map<Completion>((keyword) => ({
        label: keyword,
        type: "keyword",
      })),
    };
  };
}

/** Dynamically load the CodeMirror extension for a language id. */
export async function loadLanguageExtension(
  lang: string
): Promise<unknown | null> {
  switch (lang) {
    case "java": {
      const { javaLanguage } = await import("@codemirror/lang-java");
      return javaLanguage;
    }
    case "c":
    case "cpp": {
      const { cppLanguage } = await import("@codemirror/lang-cpp");
      return cppLanguage;
    }
    case "python": {
      const { pythonLanguage } = await import("@codemirror/lang-python");
      return pythonLanguage;
    }
    case "javascript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript();
    }
    case "typescript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ typescript: true });
    }
    case "sql": {
      const { sql } = await import("@codemirror/lang-sql");
      return sql();
    }
    case "ruby": {
      const { StreamLanguage } = await import("@codemirror/language");
      const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
      return StreamLanguage.define(ruby);
    }
    default:
      return null;
  }
}
