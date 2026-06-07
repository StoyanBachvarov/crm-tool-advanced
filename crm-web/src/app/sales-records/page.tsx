import { createSalesRecord } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default async function SalesRecordsPage() {
  const user = await requireUser();
  const { salesRecords, customers, opportunities, offers } = await getCrmListData(user);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
      </div>

      <form action={createSalesRecord} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-4">
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
        <select name="offerId" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">No offer</option>
          {offers.map((offer) => (
            <option key={offer.id} value={offer.id}>{offer.offerNumber} / {offer.title}</option>
          ))}
        </select>
        <input name="amount" required type="number" step="0.01" placeholder="Amount" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="currency" defaultValue="USD" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="saleDate" type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <textarea name="notes" placeholder="Notes" rows={2} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 lg:col-span-2" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Register sale</button>
      </form>

      <div className="space-y-3">
        {salesRecords.map((sale) => (
          <div id={`sale-${sale.id}`} key={sale.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div>
              <h2 className="font-semibold text-gray-900">{sale.customerName}</h2>
              <p className="text-sm text-gray-500">{sale.salesRepName} / {formatDate(sale.saleDate)}</p>
            </div>
            <span className="font-medium text-gray-900">{sale.amount} {sale.currency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
