import { parsePaging, requireApiUser } from "@/lib/api-auth";
import { createApiActivity, listApiActivities } from "@/services/mobile-api";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json(await listApiActivities(auth.user, parsePaging(request)));
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const activity = await createApiActivity(body, auth.user);

    if (!activity) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid activity data" },
      { status: 400 }
    );
  }
}
