import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Admin guard for the question-groups API.
 * Returns a 401/403 response when the caller is not an authenticated admin.
 */
export async function requireAdminApi() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user) {
        return {
            ok: false as const,
            response: NextResponse.json(
                { error: "You must be signed in to manage question groups." },
                { status: 401 }
            ),
        };
    }
    if (role !== "admin") {
        return {
            ok: false as const,
            response: NextResponse.json(
                { error: "Only admins can manage question groups." },
                { status: 403 }
            ),
        };
    }
    return { ok: true as const };
}
