import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTeamMemberCustomers } from "@/services/team";

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "No activity";
}

export default async function TeamMemberCustomersPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) notFound();

  const customers = await getTeamMemberCustomers(memberId, user);
  if (!customers) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href={`/team/${memberId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to rep</Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Assigned customers</h1>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-gray-500"><tr><th className="px-4 py-3">Company</th><th className="px-4 py-3">Industry</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Last activity</th><th className="px-4 py-3">Assign</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3"><Link href={`/customers/${customer.id}`} className="font-medium text-blue-700">{customer.companyName}</Link></td>
                <td className="px-4 py-3 text-gray-700">{customer.industrySector || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{customer.status}</td>
                <td className="px-4 py-3 text-gray-700">{customer.mainContactName || customer.email || customer.phone || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{formatDate(customer.lastActivityDate)}</td>
                <td className="px-4 py-3"><Link href={`/customers/${customer.id}/assign`} className="text-blue-700 hover:text-blue-800">Reassign</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
