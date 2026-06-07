import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOpportunityManagementDetail } from "@/services/crm";
import { StageIndicator } from "@/components/opportunities/OpportunityForm";
import { NotesPanel } from "@/components/notes/NotesPanel";

function formatOptionalDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
      }).format(date)
    : "Not set";
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const opportunityId = Number(id);

  if (!Number.isInteger(opportunityId)) {
    notFound();
  }

  const detail = await getOpportunityManagementDetail(opportunityId, user);

  if (!detail) {
    notFound();
  }

  const { opportunity, activities, offers } = detail;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-blue-600">
          {opportunity.customerName}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {opportunity.title}
          </h1>
          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">
            {opportunity.status}
          </span>
        </div>
        <div className="mt-4">
          <StageIndicator stage={opportunity.stage} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/opportunities/${opportunity.id}/edit`} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Edit opportunity
          </Link>
          <Link href={`/opportunities/${opportunity.id}/close-won`} className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
            Close won
          </Link>
          <Link href={`/opportunities/${opportunity.id}/close-lost`} className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
            Close lost
          </Link>
          <Link href={`/offers/new?customerId=${opportunity.customerId}&opportunityId=${opportunity.id}`} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700">
            New offer
          </Link>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Stage</dt>
            <dd className="font-medium text-gray-900">{opportunity.stage}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estimated value</dt>
            <dd className="font-medium text-gray-900">
              {opportunity.estimatedValue
                ? `$${opportunity.estimatedValue}`
                : "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Probability</dt>
            <dd className="font-medium text-gray-900">
              {opportunity.probability ?? 0}%
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Expected close date</dt>
            <dd className="font-medium text-gray-900">
              {formatOptionalDate(opportunity.expectedCloseDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Sales rep</dt>
            <dd className="font-medium text-gray-900">
              {opportunity.salesRepName}
            </dd>
          </div>
        </dl>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">
            Description
          </h2>
          <p className="mt-2 text-gray-700">
            {opportunity.description || "No description yet."}
          </p>
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Related activities</h2>
          <div className="mt-3 space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">No related activities.</p>
            ) : (
              activities.map((activity) => (
                <Link key={activity.id} href={`/activities/${activity.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                  <span className="font-medium text-gray-900">{activity.title}</span>
                  <span className="ml-2 text-gray-500">{activity.type} / {formatOptionalDate(activity.startDate)}</span>
                </Link>
              ))
            )}
          </div>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Related offers</h2>
          <div className="mt-3 space-y-3">
            {offers.length === 0 ? (
              <p className="text-sm text-gray-500">No offers linked yet.</p>
            ) : (
              offers.map((offer) => (
                <Link key={offer.id} href={`/offers/${offer.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                  <span className="font-medium text-gray-900">{offer.offerNumber} / {offer.title}</span>
                  <span className="ml-2 text-gray-500">{offer.amount} {offer.currency} / {offer.status}</span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
      <NotesPanel entityType="opportunity" entityId={opportunity.id} user={user} redirectTo={`/opportunities/${opportunity.id}`} />
    </div>
  );
}
