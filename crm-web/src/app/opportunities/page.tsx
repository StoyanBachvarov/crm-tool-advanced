import Link from "next/link";
import { createOpportunity } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";

function formatOptionalDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Not set";
}

export default async function OpportunitiesPage() {
  const user = await requireUser();
  const { opportunities, customers } = await getCrmListData(user);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
      </div>

      <form action={createOpportunity} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-4">
        <select name="customerId" required className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.companyName}</option>
          ))}
        </select>
        <input name="title" required placeholder="Title" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="estimatedValue" type="number" step="0.01" placeholder="Estimated value" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="probability" type="number" min="0" max="100" placeholder="Probability %" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <select name="stage" defaultValue="New" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option>New</option>
          <option>Qualified</option>
          <option>Proposal needed</option>
          <option>Offer sent</option>
          <option>Negotiation</option>
          <option>Won</option>
          <option>Lost</option>
        </select>
        <select name="status" defaultValue="open" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="open">Open</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input name="expectedCloseDate" type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create opportunity</button>
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
            <p className="mt-2 text-sm text-gray-600">{opportunity.stage} / {opportunity.probability ?? 0}% / closes {formatOptionalDate(opportunity.expectedCloseDate)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
