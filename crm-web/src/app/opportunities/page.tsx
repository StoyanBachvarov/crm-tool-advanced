import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";
import { StageIndicator } from "@/components/opportunities/OpportunityForm";

function formatOptionalDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Not set";
}

export default async function OpportunitiesPage() {
  const user = await requireUser();
  const { opportunities } = await getCrmListData(user);

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
    </div>
  );
}
