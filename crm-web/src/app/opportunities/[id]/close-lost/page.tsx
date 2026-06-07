import { closeOpportunityLost } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getOpportunityManagementDetail } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CloseLostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const opportunityId = Number(id);

  if (!Number.isInteger(opportunityId)) notFound();
  const detail = await getOpportunityManagementDetail(opportunityId, user);
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-rose-600">Close lost</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{detail.opportunity.title}</h1>
        <p className="mt-3 text-gray-600">Mark this opportunity as lost and set probability to 0%.</p>
        <div className="mt-6 flex gap-3">
          <form action={closeOpportunityLost}>
            <input type="hidden" name="opportunityId" value={opportunityId} />
            <button className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
              Mark lost
            </button>
          </form>
          <Link href={`/opportunities/${opportunityId}`} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
