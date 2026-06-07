import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCrmListData, getManageableSalesReps } from "@/services/crm";
import { listFilteredSalesRecords, type SearchParams } from "@/services/filters";
import { Pagination } from "@/components/list/Pagination";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const [{ rows: salesRecords, paging }, { customers }, salesReps] = await Promise.all([
    listFilteredSalesRecords(user, params),
    getCrmListData(user),
    getManageableSalesReps(user),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
            <p className="mt-2 text-gray-600">Review completed sales and register new revenue.</p>
          </div>
          <Link href="/sales/new" className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New sale
          </Link>
        </div>
      </div>
      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-6">
        <select name="customerId" defaultValue={String(params.customerId ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Any customer</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}
        </select>
        <select name="salesRepId" defaultValue={String(params.salesRepId ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Any rep</option>
          {salesReps.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
        </select>
        <input name="fromDate" type="date" defaultValue={String(params.fromDate ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="toDate" type="date" defaultValue={String(params.toDate ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="minAmount" type="number" step="0.01" defaultValue={String(params.minAmount ?? "")} placeholder="Min amount" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="maxAmount" type="number" step="0.01" defaultValue={String(params.maxAmount ?? "")} placeholder="Max amount" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 lg:col-span-6">Filter</button>
      </form>
      <div className="space-y-3">
        {salesRecords.map((sale) => (
          <Link id={`sale-${sale.id}`} key={sale.id} href={`/sales/${sale.id}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300">
            <div>
              <h2 className="font-semibold text-gray-900">{sale.customerName}</h2>
              <p className="text-sm text-gray-500">{sale.salesRepName} / {formatDate(sale.saleDate)}</p>
            </div>
            <span className="font-medium text-gray-900">{sale.amount} {sale.currency}</span>
          </Link>
        ))}
      </div>
      <Pagination paging={paging} searchParams={params} basePath="/sales" />
    </div>
  );
}
