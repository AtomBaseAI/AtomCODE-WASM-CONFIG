import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-admin-guard";
import { UpdateQuestionGroupSchema } from "@/schemas/question-group-schema";

/** Case-insensitive duplicate title check (excluding `excludeId`). */
async function titleExists(title: string, excludeId: string) {
    const normalized = title.trim().toLowerCase();
    const groups = await db.questionGroup.findMany({
        select: { id: true, title: true },
    });
    return groups.some(
        (g) =>
            g.id !== excludeId &&
            g.title.trim().toLowerCase() === normalized
    );
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/question-groups/[id] — a single group with its questions.
 */
export async function GET(_req: Request, ctx: RouteContext) {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const { id } = await ctx.params;
    const group = await db.questionGroup.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { title: "asc" },
                include: { questionGroup: { select: { id: true } } },
            },
        },
    });
    if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    return NextResponse.json({ group });
}

/**
 * PATCH /api/question-groups/[id] — rename / re-describe a group.
 * Body: { title, description? }
 */
export async function PATCH(req: Request, ctx: RouteContext) {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const { id } = await ctx.params;
    const existing = await db.questionGroup.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = UpdateQuestionGroupSchema.safeParse({ ...(body as object), id });
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400 }
        );
    }

    const title = parsed.data.title.trim();
    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (await titleExists(title, id)) {
        return NextResponse.json(
            { error: `A group named "${title}" already exists.` },
            { status: 409 }
        );
    }

    const group = await db.questionGroup.update({
        where: { id },
        data: {
            title,
            description: parsed.data.description?.trim() || null,
        },
    });

    return NextResponse.json({ group });
}

/**
 * DELETE /api/question-groups/[id] — delete a group. Questions inside the
 * group are kept, they simply become ungrouped (onDelete: SetNull).
 */
export async function DELETE(_req: Request, ctx: RouteContext) {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const { id } = await ctx.params;
    const existing = await db.questionGroup.findUnique({
        where: { id },
        include: { _count: { select: { questions: true } } },
    });
    if (!existing) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    await db.questionGroup.delete({ where: { id } });

    return NextResponse.json({
        success: "Question group deleted",
        detachedQuestions: existing._count.questions,
    });
}
