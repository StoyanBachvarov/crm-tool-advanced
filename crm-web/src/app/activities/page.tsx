import Link from "next/link";
import { createActivity } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function ActivitiesPage() {
  const user = await requireUser();
  const { activities, customers } = await getCrmListData(user);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
      </div>

      <form action={createActivity} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-4">
        <select name="customerId" required className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.companyName}</option>
          ))}
        </select>
        <select name="type" defaultValue="Visit" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option>Visit</option>
          <option>Phone call</option>
          <option>Meeting</option>
          <option>Email</option>
          <option>Follow-up task</option>
          <option>Demo</option>
          <option>Other</option>
        </select>
        <input name="title" required placeholder="Title" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="startDate" required type="datetime-local" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <textarea name="description" placeholder="Description" rows={2} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 lg:col-span-2" />
        <textarea name="nextAction" placeholder="Next action" rows={2} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create activity</button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.id}`} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{formatDateTime(activity.startDate)}</p>
                <h2 className="mt-1 font-semibold text-gray-900">{activity.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{activity.customerName} / {activity.type}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700">{activity.state}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
