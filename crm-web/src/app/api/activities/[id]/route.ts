import { requireApiUser } from "@/lib/api-auth";
import { getApiActivityDetail } from "@/services/mobile-api";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
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

  const activity = await getApiActivityDetail(activityId, auth.user);

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  return NextResponse.json({ data: activity });
}
