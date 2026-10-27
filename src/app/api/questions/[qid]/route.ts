import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-admin-guard";

type RouteContext = { params: Promise<{ qid: string }> };

/**
 * GET /api/questions/[qid] — a single code question (for the table
 * edit popup). Returns the question in the QuestionUpdateSchema shape
 * so the client can feed it straight into EditQuestionForm.
 */
export async function GET(_req: Request, ctx: RouteContext) {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const { qid } = await ctx.params;
    const question = await db.codeQuestion.findUnique({
        where: { id: qid },
        include: {
            questionGroup: { select: { id: true, title: true } },
        },
    });
    if (!question) {
        return NextResponse.json(
            { error: "Question not found" },
            { status: 404 }
        );
    }

    // Map DB nulls to the form's expected shapes (strings for optional
    // text fields, nullable id for the group relation).
    return NextResponse.json({
        question: {
            id: question.id,
            title: question.title ?? "",
            description: question.description ?? "",
            sampleinput1: question.sampleinput1 ?? "",
            sampleinput2: question.sampleinput2 ?? "",
            sampleoutput1: question.sampleoutput1 ?? "",
            sampleoutput2: question.sampleoutput2 ?? "",
            input1: question.input1 ?? "",
            input2: question.input2 ?? "",
            input3: question.input3 ?? "",
            output1: question.output1 ?? "",
            output2: question.output2 ?? "",
            output3: question.output3 ?? "",
            sourcecode: question.sourcecode ?? "",
            referenceimg: question.referenceimg || undefined,
            maxscore: question.maxscore ?? 0,
            difficulty: question.difficulty ?? "",
            lang: question.lang ?? "",
            topic: question.topic || undefined,
            subtopic: question.subtopic || undefined,
            inputconstrains: question.inputconstrains || undefined,
            blacklist: question.blacklist || undefined,
            whitelist: question.whitelist || undefined,
            questionGroupId: question.questionGroupId ?? null,
            questionGroupTitle: question.questionGroup?.title ?? null,
        },
    });
}
