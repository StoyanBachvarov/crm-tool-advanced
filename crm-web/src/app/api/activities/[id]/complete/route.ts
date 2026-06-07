import { requireApiUser } from "@/lib/api-auth";
import { completeApiActivity } from "@/services/mobile-api";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const activityId = Number(id);

  if (!Number.isInteger(activityId)) {
    return NextResponse.json({ error: "Invalid activity id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const activity = await completeApiActivity(activityId, body, auth.user);

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json({ data: activity });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid completion data" },
      { status: 400 }
    );
  }
}
