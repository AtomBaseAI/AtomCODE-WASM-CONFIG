export interface MCQ {
    id: string;
    title: string;
    description: string;
    topic: string | null;
    subtopic: string | null;
    Option1: string;
    Option2: string;
    Option3: string;
    Option4: string;
    CorrectOption: number;
    referenceimg: string | null;
    codesnippet: string | null;
    iscodesnippet: boolean;
    moduleId: string | null;
    assessmentsId: string | null;
} 