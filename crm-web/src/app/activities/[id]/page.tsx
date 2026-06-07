import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getActivityDetail, type ActivityState } from "@/services/dashboard";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function stateClasses(state: ActivityState) {
  const classes = {
    upcoming: "bg-sky-50 text-sky-700 ring-sky-200",
    current: "bg-amber-50 text-amber-700 ring-amber-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
  };

  return classes[state];
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
    >
      {label}
    </Link>
  );
}

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error } = await searchParams;
  const activityId = Number(id);

  if (!Number.isInteger(activityId)) {
    notFound();
  }

  const result = await getActivityDetail(activityId, user);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "access_denied") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-rose-600">Access denied</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            You cannot view this activity
          </h1>
          <p className="mt-3 text-gray-600">
            Activities are available only to the assigned sales rep, that rep&apos;s
            sales manager, or an admin.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activity = result.activity;
  const isClosed = activity.state === "completed" || activity.state === "cancelled";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              {activity.customerName}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {activity.title}
            </h1>
          </div>
          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-medium ring-1 ${stateClasses(
              activity.state
            )}`}
          >
            {activity.state}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Customer</dt>
            <dd className="font-medium text-gray-900">{activity.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Contact person</dt>
            <dd className="font-medium text-gray-900">
              {activity.customerContactName || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Activity type</dt>
            <dd className="font-medium text-gray-900">{activity.type}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Date and time</dt>
            <dd className="font-medium text-gray-900">
              {formatDateTime(activity.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Assigned sales rep</dt>
            <dd className="font-medium text-gray-900">{activity.salesRepName}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Ends</dt>
            <dd className="font-medium text-gray-900">
              {activity.endDate ? formatDateTime(activity.endDate) : "Not set"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Related opportunity
            </h2>
            {activity.relatedOpportunity ? (
              <Link
                href={`/opportunities/${activity.relatedOpportunity.id}`}
                className="mt-2 block font-medium text-blue-700 hover:text-blue-800"
              >
                {activity.relatedOpportunity.title}
              </Link>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No related opportunity.</p>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Related offer
            </h2>
            {activity.relatedOffer ? (
              <p className="mt-2 text-sm text-gray-700">
                {activity.relatedOffer.offerNumber} / {activity.relatedOffer.title}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No related offer.</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <section>
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Description
            </h2>
            <p className="mt-2 text-gray-700">
              {activity.description || "No description yet."}
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Outcome
            </h2>
            <p className="mt-2 text-gray-700">
              {activity.outcome || "No outcome recorded yet."}
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Next action
            </h2>
            <p className="mt-2 text-gray-700">
              {activity.nextAction || "No next action set."}
            </p>
          </section>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">Activity actions</h2>
          {error === "outcome-required" && (
            <p className="mt-2 text-sm text-rose-600">
              Enter an outcome note before completing the activity.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-start gap-2">
              {!isClosed && (
                <>
                  <ActionLink href={`/activities/${activity.id}/edit`} label="Edit activity" />
                  <ActionLink href={`/activities/${activity.id}/complete`} label="Complete activity" />
                  <ActionLink href={`/activities/${activity.id}/cancel`} label="Cancel activity" />
                </>
              )}
              <ActionLink
                href={`/activities/new?customerId=${activity.customerId}`}
                label="Schedule follow-up"
              />
              <ActionLink href="/opportunities" label="Create opportunity" />
              <ActionLink href="/offers" label="Create offer" />
              <ActionLink href="/sales-records" label="Register sale" />
          </div>
        </div>
      </div>
    </div>
  );
}
