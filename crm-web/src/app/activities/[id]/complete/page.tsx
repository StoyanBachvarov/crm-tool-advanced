import { completeActivity } from "@/app/actions/activities";
import { requireUser } from "@/lib/auth";
import { getActivityDetail } from "@/services/dashboard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CompleteActivityPage({
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

  const result = await getActivityDetail(activityId, user);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "access_denied") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-rose-600">Access denied</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">You cannot complete this activity</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <form action={completeActivity} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="activityId" value={activityId} />
        <p className="text-sm font-medium text-blue-600">Complete activity</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{result.activity.title}</h1>
        <label className="mt-5 grid gap-1 text-sm font-medium text-gray-700">
          Outcome
          <textarea
            name="outcome"
            rows={5}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Complete activity
          </button>
          <Link
            href={`/activities/${activityId}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
