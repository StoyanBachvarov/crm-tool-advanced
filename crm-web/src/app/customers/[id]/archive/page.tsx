import { archiveCustomer } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getCustomerManagementDetail } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArchiveCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId)) {
    notFound();
  }

  const detail = await getCustomerManagementDetail(customerId, user);

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-rose-600">Archive customer</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {detail.customer.companyName}
        </h1>
        <p className="mt-3 text-gray-600">
          Archiving marks the customer as inactive while keeping activities,
          offers, opportunities, sales records, and notes available for review.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={archiveCustomer}>
            <input type="hidden" name="customerId" value={customerId} />
            <button className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
              Archive customer
            </button>
          </form>
          <Link
            href={`/customers/${customerId}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
