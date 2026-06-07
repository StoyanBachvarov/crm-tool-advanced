import { requireApiUser } from "@/lib/api-auth";
import { getApiCustomerDetail } from "@/services/mobile-api";
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
  const customerId = Number(id);

  if (!Number.isInteger(customerId)) {
    return NextResponse.json({ error: "Invalid customer id" }, { status: 400 });
  }

  const customer = await getApiCustomerDetail(customerId, auth.user);

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({ data: customer });
}
