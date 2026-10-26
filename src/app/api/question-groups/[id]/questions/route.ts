import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-admin-guard";

type RouteContext = { params: Promise<{ id: string }> };

const AddQuestionsSchema = z.object({
    questionIds: z.array(z.string().min(1)).min(1, {
        message: "Select at least one question",
    }),
});

async function getGroupOr404(id: string) {
    return db.questionGroup.findUnique({ where: { id } });
}

/**
 * POST /api/question-groups/[id]/questions — move questions into this group.
 * Body: { questionIds: string[] }
 * A question can live in only one group, so questions already in another
 * group are moved (their previous membership is replaced).
 */
export async function POST(req: Request, ctx: RouteContext) {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const { id } = await ctx.params;
    const group = await getGroupOr404(id);
    if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = AddQuestionsSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400 }
        );
    }

    // Verify every id is a real question before connecting.
    const uniqueIds = Array.from(new Set(parsed.data.questionIds));
    const found = await db.codeQuestion.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
        return NextResponse.json(
            { error: "One or more selected questions no longer exist." },
            { status: 400 }
        );
    }

    await db.questionGroup.update({
        where: { id },
        data: {
            questions: {
                connect: uniqueIds.map((qid) => ({ id: qid })),
            },
        },
    });

    return NextResponse.json({
        success: `${uniqueIds.length} question(s) added to "${group.title}"`,
    });
}

/**
 * DELETE /api/question-groups/[id]/questions?questionId=… — remove one
 * question from this group (the question itself is kept, ungrouped).
 */
export async function DELETE(req: Request, ctx: RouteContext) {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const { id } = await ctx.params;
    const group = await getGroupOr404(id);
    if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const questionId = new URL(req.url).searchParams.get("questionId");
    if (!questionId) {
        return NextResponse.json(
            { error: "'questionId' query parameter is required" },
            { status: 400 }
        );
    }

    const question = await db.codeQuestion.findFirst({
        where: { id: questionId, questionGroupId: id },
        select: { id: true },
    });
    if (!question) {
        return NextResponse.json(
            { error: "This question does not belong to the group." },
            { status: 404 }
        );
    }

    await db.questionGroup.update({
        where: { id },
        data: {
            questions: { disconnect: { id: questionId } },
        },
    });

    return NextResponse.json({ success: "Question removed from the group" });
}
