import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { StageIndicator } from "@/components/opportunities/OpportunityForm";
import { listFilteredOpportunities, type SearchParams } from "@/services/filters";
import { Pagination } from "@/components/list/Pagination";

function formatOptionalDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Not set";
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { rows: opportunities, paging } = await listFilteredOpportunities(user, params);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
            <p className="mt-2 text-gray-600">Track pipeline stage, value, and close probability.</p>
          </div>
          <Link href="/opportunities/new" className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New opportunity
          </Link>
        </div>
      </div>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-6">
        <select name="stage" defaultValue={String(params.stage ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Any stage</option>
          {["New", "Qualified", "Proposal needed", "Offer sent", "Negotiation", "Won", "Lost"].map((stage) => <option key={stage}>{stage}</option>)}
        </select>
        <select name="status" defaultValue={String(params.status ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Any status</option>
          {["open", "won", "lost", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input name="minValue" type="number" step="0.01" defaultValue={String(params.minValue ?? "")} placeholder="Min value" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="maxValue" type="number" step="0.01" defaultValue={String(params.maxValue ?? "")} placeholder="Max value" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="expectedCloseFrom" type="date" defaultValue={String(params.expectedCloseFrom ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="expectedCloseTo" type="date" defaultValue={String(params.expectedCloseTo ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 lg:col-span-6">Filter</button>
      </form>

      <div className="space-y-3">
        {opportunities.map((opportunity) => (
          <Link key={opportunity.id} href={`/opportunities/${opportunity.id}`} className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">{opportunity.title}</h2>
                <p className="text-sm text-gray-500">{opportunity.customerName} / {opportunity.salesRepName}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">{opportunity.estimatedValue ? `$${opportunity.estimatedValue}` : "No value"}</span>
            </div>
            <div className="mt-3">
              <StageIndicator stage={opportunity.stage} />
            </div>
            <p className="mt-2 text-sm text-gray-600">{opportunity.probability ?? 0}% / closes {formatOptionalDate(opportunity.expectedCloseDate)} / {opportunity.status}</p>
          </Link>
        ))}
      </div>
      <Pagination paging={paging} searchParams={params} basePath="/opportunities" />
    </div>
  );
}
