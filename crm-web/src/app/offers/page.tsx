import { createOffer } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";

function formatOptionalDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Not set";
}

export default async function OffersPage() {
  const user = await requireUser();
  const { offers, customers, opportunities } = await getCrmListData(user);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
      </div>

      <form action={createOffer} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-4">
        <select name="customerId" required className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.companyName}</option>
          ))}
        </select>
        <select name="opportunityId" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">No opportunity</option>
          {opportunities.map((opportunity) => (
            <option key={opportunity.id} value={opportunity.id}>{opportunity.title}</option>
          ))}
        </select>
        <input name="offerNumber" placeholder="Offer number" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="title" required placeholder="Title" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="amount" required type="number" step="0.01" placeholder="Amount" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="currency" defaultValue="USD" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <select name="status" defaultValue="draft" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input name="validUntilDate" type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <textarea name="notes" placeholder="Notes" rows={2} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 lg:col-span-3" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create offer</button>
      </form>

      <div className="space-y-3">
        {offers.map((offer) => (
          <div id={`offer-${offer.id}`} key={offer.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">{offer.offerNumber} / {offer.title}</h2>
                <p className="text-sm text-gray-500">{offer.customerName} / valid until {formatOptionalDate(offer.validUntilDate)}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">{offer.amount} {offer.currency}</span>
            </div>
            <p className="mt-2 text-sm capitalize text-gray-600">{offer.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
