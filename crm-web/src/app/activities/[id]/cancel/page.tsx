import { cancelActivity } from "@/app/actions/activities";
import { requireUser } from "@/lib/auth";
import { getActivityDetail } from "@/services/dashboard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CancelActivityPage({
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
          <h1 className="mt-2 text-2xl font-bold text-gray-900">You cannot cancel this activity</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-rose-600">Cancel activity</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{result.activity.title}</h1>
        <p className="mt-3 text-gray-600">Cancelled activities stay in the activity archive for reporting.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={cancelActivity}>
            <input type="hidden" name="activityId" value={activityId} />
            <button className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
              Cancel activity
            </button>
          </form>
          <Link
            href={`/activities/${activityId}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
