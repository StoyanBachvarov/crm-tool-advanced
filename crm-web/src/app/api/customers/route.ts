import { parsePaging, requireApiUser } from "@/lib/api-auth";
import { listApiCustomers } from "@/services/mobile-api";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);

  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json(await listApiCustomers(auth.user, parsePaging(request)));
}
