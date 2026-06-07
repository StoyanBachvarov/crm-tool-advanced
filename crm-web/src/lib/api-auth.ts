import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { verifyJwtToken, type CurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export type ApiAuthResult =
  | { user: CurrentUser; response?: never }
  | { user?: never; response: NextResponse };

export async function requireApiUser(request: NextRequest): Promise<ApiAuthResult> {
  const authorization = request.headers.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return {
      response: NextResponse.json(
        { error: "Missing Bearer token" },
        { status: 401 }
      ),
    };
  }

  const session = await verifyJwtToken(token);

  if (!session) {
    return {
      response: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  if (!user) {
    return {
      response: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }

  return { user };
}

export function parsePaging(request: NextRequest) {
  const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSizeParam = Number(request.nextUrl.searchParams.get("pageSize") ?? "20");
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize =
    Number.isInteger(pageSizeParam) && pageSizeParam > 0
      ? Math.min(pageSizeParam, 100)
      : 20;

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}
