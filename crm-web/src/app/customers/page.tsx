import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";

function formatOptionalDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
    : "No activity";
}

export default async function CustomersPage() {
  const user = await requireUser();
  const { customers } = await getCrmListData(user);

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
    </div>
  );
}
