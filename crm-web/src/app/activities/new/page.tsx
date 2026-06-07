import { createActivity } from "@/app/actions/crm";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";
import Link from "next/link";

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const user = await requireUser();
  const [{ customerId }, { customers }] = await Promise.all([
    searchParams,
    getCrmListData(user),
  ]);
  const defaultCustomerId = Number(customerId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href="/activities" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to activities
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">New activity</h1>
      </div>
      <ActivityForm
        action={createActivity}
        customers={customers}
        defaultCustomerId={Number.isInteger(defaultCustomerId) ? defaultCustomerId : undefined}
        submitLabel="Create activity"
      />
    </div>
  );
}
