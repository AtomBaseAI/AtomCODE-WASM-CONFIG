import { auth } from "@/auth";
import { db } from "@/lib/db";

type Session = Awaited<ReturnType<typeof auth>>;

/**
 * Role guards for bulk server actions. Existing row-level actions rely on
 * route-level protection (middleware); the new bulk actions additionally
 * verify the caller's role/ownership server-side.
 */

/** Returns the session when the caller is an authenticated admin, else null. */
export async function requireAdmin(): Promise<Session> {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || role !== "admin") return null;
    return session;
}

/**
 * Returns the session when the caller is an admin OR a staff member assigned
 * to the given course (StaffCourse record), else null.
 */
export async function requireAdminOrCourseStaff(
    courseId: string
): Promise<Session> {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user) return null;
    if (role === "admin") return session;
    if (role === "staff") {
        const assignment = await db.staffCourse.findFirst({
            where: { staffId: session.user.id, courseId },
        });
        if (assignment) return session;
    }
    return null;
}
