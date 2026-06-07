import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTeamMemberActivities } from "@/services/team";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function TeamMemberActivitiesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId)) notFound();

  const activities = await getTeamMemberActivities(memberId, user);
  if (!activities) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href={`/team/${memberId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to rep</Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Sales rep activities</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.id}`} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300">
            <p className="text-sm text-gray-500">{formatDate(activity.startDate)}</p>
            <h2 className="mt-1 font-semibold text-gray-900">{activity.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{activity.customerName} / {activity.type} / {activity.status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
