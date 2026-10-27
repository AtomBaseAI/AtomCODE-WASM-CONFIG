import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-admin-guard";
import { AddQuestionGroupSchema } from "@/schemas/question-group-schema";

/** Case-insensitive duplicate title check (excluding `excludeId` when given). */
async function titleExists(title: string, excludeId?: string) {
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

/**
 * GET /api/question-groups — list every question group with its question count.
 */
export async function GET() {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const groups = await db.questionGroup.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { questions: true } } },
    });

    return NextResponse.json({
        groups: groups.map((g) => ({
            id: g.id,
            title: g.title,
            description: g.description,
            createdAt: g.createdAt,
            questionCount: g._count.questions,
        })),
    });
}

/**
 * POST /api/question-groups — create a question group.
 * Body: { title, description? }
 */
export async function POST(req: Request) {
    const guard = await requireAdminApi();
    if (!guard.ok) return guard.response;

    const body = await req.json().catch(() => null);
    const parsed = AddQuestionGroupSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400 }
        );
    }

    const title = parsed.data.title.trim();
    if (!title) {
        return NextResponse.json(
            { error: "Title is required" },
            { status: 400 }
        );
    }
    if (await titleExists(title)) {
        return NextResponse.json(
            { error: `A group named "${title}" already exists.` },
            { status: 409 }
        );
    }

    const group = await db.questionGroup.create({
        data: {
            title,
            description: parsed.data.description?.trim() || null,
        },
    });

    return NextResponse.json({ group }, { status: 201 });
}
