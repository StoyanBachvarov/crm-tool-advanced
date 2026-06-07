import { updateActivity } from "@/app/actions/activities";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { requireUser } from "@/lib/auth";
import { getActivityDetail } from "@/services/dashboard";
import { getCrmListData } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const activityId = Number(id);

  if (!Number.isInteger(activityId)) {
    notFound();
  }

  const [result, { customers }] = await Promise.all([
    getActivityDetail(activityId, user),
    getCrmListData(user),
  ]);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "access_denied") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-rose-600">Access denied</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">You cannot edit this activity</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link
          href={`/activities/${activityId}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Back to activity
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit activity</h1>
        {error === "missing-fields" && (
          <p className="mt-2 text-sm text-rose-600">Title, type, customer, and start date are required.</p>
        )}
      </div>
      <ActivityForm
        action={updateActivity}
        activity={result.activity}
        customers={customers}
        submitLabel="Save changes"
      />
    </div>
  );
}
