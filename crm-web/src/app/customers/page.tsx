import Link from "next/link";
import { createCustomer } from "@/app/actions/crm";
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
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
      </div>

      <form action={createCustomer} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-4">
        <input name="companyName" required placeholder="Company name" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="industrySector" placeholder="Industry" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <select name="status" defaultValue="lead" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="lead">Lead</option>
          <option value="prospect">Prospect</option>
          <option value="active customer">Active customer</option>
          <option value="inactive customer">Inactive customer</option>
          <option value="lost customer">Lost customer</option>
        </select>
        <input name="mainContactName" placeholder="Main contact" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="contactPosition" placeholder="Contact position" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="phone" placeholder="Phone" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="email" type="email" placeholder="Email" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="deliveryAddress" placeholder="Delivery address" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <textarea name="notes" placeholder="Notes" rows={2} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 lg:col-span-3" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create customer</button>
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
    </div>
  );
}
