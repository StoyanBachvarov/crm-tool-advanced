import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOpportunityDetail } from "@/services/dashboard";

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

  const opportunity = await getOpportunityDetail(opportunityId, user);

  if (!opportunity) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
    </div>
  );
}
