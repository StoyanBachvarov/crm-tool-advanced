import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getActivityDetail } from "@/services/dashboard";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const activityId = Number(id);

  if (!Number.isInteger(activityId)) {
    notFound();
  }

  const activity = await getActivityDetail(activityId, user);

  if (!activity) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {activity.customerName}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {activity.title}
            </h1>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
            {activity.state}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Type</dt>
            <dd className="font-medium text-gray-900">{activity.type}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Assigned sales rep</dt>
            <dd className="font-medium text-gray-900">{activity.salesRepName}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Starts</dt>
            <dd className="font-medium text-gray-900">
              {formatDateTime(activity.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Ends</dt>
            <dd className="font-medium text-gray-900">
              {activity.endDate ? formatDateTime(activity.endDate) : "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Customer phone</dt>
            <dd className="font-medium text-gray-900">
              {activity.customerPhone || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Customer email</dt>
            <dd className="font-medium text-gray-900">
              {activity.customerEmail || "Not set"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 space-y-5">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Description
            </h2>
            <p className="mt-2 text-gray-700">
              {activity.description || "No description yet."}
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Outcome
            </h2>
            <p className="mt-2 text-gray-700">
              {activity.outcome || "No outcome recorded yet."}
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Next Action
            </h2>
            <p className="mt-2 text-gray-700">
              {activity.nextAction || "No next action set."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
