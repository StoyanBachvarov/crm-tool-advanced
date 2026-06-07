import Link from "next/link";
import { notFound } from "next/navigation";
import { updateUserManagement } from "@/app/actions/team";
import { requireUser } from "@/lib/auth";
import { canAdminUsers, getManagerOptions, getTeamMemberDetail } from "@/services/team";

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Not set";
}

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const memberId = Number(id);

  if (!Number.isInteger(memberId)) {
    notFound();
  }

  const [detail, managers] = await Promise.all([
    getTeamMemberDetail(memberId, user),
    canAdminUsers(user) ? getManagerOptions() : Promise.resolve([]),
  ]);

  if (!detail) {
    notFound();
  }

  const { member, customers, activities, opportunities, offers, sales } = detail;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Link href="/team" className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to team</Link>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <p className="mt-1 text-gray-600">{member.email}</p>
            <p className="mt-1 text-sm capitalize text-gray-500">{member.role.replace("_", " ")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/team/${member.id}/customers`} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700">Customers</Link>
            <Link href={`/team/${member.id}/activities`} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700">Activities</Link>
          </div>
        </div>
        {canAdminUsers(user) && (
          <form action={updateUserManagement} className="mt-5 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <input type="hidden" name="userId" value={member.id} />
            <select name="role" defaultValue={member.role} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="sales_rep">Sales rep</option>
              <option value="sales_manager">Sales manager</option>
              <option value="admin">Admin</option>
            </select>
            <select name="managerId" defaultValue={member.managerId ?? ""} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="">No manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>{manager.name}</option>
              ))}
            </select>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save user</button>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Assigned customers</h2>
          <div className="mt-3 space-y-3">
            {customers.length === 0 ? <p className="text-sm text-gray-500">No customers assigned.</p> : customers.map((customer) => (
              <Link key={customer.id} href={`/customers/${customer.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                <span className="font-medium text-gray-900">{customer.companyName}</span>
                <span className="ml-2 text-gray-500">{customer.status}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Recent activity</h2>
          <div className="mt-3 space-y-3">
            {activities.length === 0 ? <p className="text-sm text-gray-500">No activities.</p> : activities.map((activity) => (
              <Link key={activity.id} href={`/activities/${activity.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                <span className="font-medium text-gray-900">{activity.title}</span>
                <span className="ml-2 text-gray-500">{activity.customerName} / {formatDate(activity.startDate)}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Sales pipeline</h2>
          <div className="mt-3 space-y-3">
            {opportunities.length === 0 ? <p className="text-sm text-gray-500">No opportunities.</p> : opportunities.map((opportunity) => (
              <Link key={opportunity.id} href={`/opportunities/${opportunity.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                <span className="font-medium text-gray-900">{opportunity.title}</span>
                <span className="ml-2 text-gray-500">{opportunity.stage} / {opportunity.status}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Offers and sales</h2>
          <div className="mt-3 space-y-3">
            {offers.slice(0, 5).map((offer) => (
              <Link key={offer.id} href={`/offers/${offer.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                {offer.offerNumber} / {offer.status}
              </Link>
            ))}
            {sales.slice(0, 5).map((sale) => (
              <Link key={sale.id} href={`/sales/${sale.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                {sale.customerName} / {sale.amount} {sale.currency}
              </Link>
            ))}
            {offers.length === 0 && sales.length === 0 && <p className="text-sm text-gray-500">No offers or sales.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
