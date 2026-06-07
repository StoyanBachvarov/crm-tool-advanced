import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getManageableSalesReps } from "@/services/crm";
import { listFilteredCustomers, type SearchParams } from "@/services/filters";
import { Pagination } from "@/components/list/Pagination";

function formatOptionalDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
    : "No activity";
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const [{ rows: customers, paging }, salesReps] = await Promise.all([
    listFilteredCustomers(user, params),
    getManageableSalesReps(user),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="mt-2 text-gray-600">
              View and manage customers available to your role.
            </p>
          </div>
          <Link
            href="/customers/new"
            className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New customer
          </Link>
        </div>
      </div>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-5">
        <input name="companyName" defaultValue={String(params.companyName ?? "")} placeholder="Company name" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="industrySector" defaultValue={String(params.industrySector ?? "")} placeholder="Industry sector" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <select name="status" defaultValue={String(params.status ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Any status</option>
          <option value="lead">Lead</option>
          <option value="prospect">Prospect</option>
          <option value="active customer">Active customer</option>
          <option value="inactive customer">Inactive customer</option>
          <option value="lost customer">Lost customer</option>
        </select>
        <select name="salesRepId" defaultValue={String(params.salesRepId ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Any rep</option>
          {salesReps.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
        </select>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Filter</button>
      </form>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Main contact</th>
              <th className="px-4 py-3">Last activity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sales rep</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-medium text-blue-700">
                  <Link href={`/customers/${customer.id}`}>{customer.companyName}</Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{customer.industrySector || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{customer.mainContactName || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{formatOptionalDate(customer.lastActivityDate)}</td>
                <td className="px-4 py-3 capitalize text-gray-700">{customer.status}</td>
                <td className="px-4 py-3 text-gray-700">{customer.salesRepName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination paging={paging} searchParams={params} basePath="/customers" />
    </div>
  );
}
