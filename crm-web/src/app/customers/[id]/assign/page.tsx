import { assignCustomer } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getAssignableSalesRepsForCustomer, getCustomerManagementDetail } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AssignCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId)) {
    notFound();
  }

  const [detail, assignmentData] = await Promise.all([
    getCustomerManagementDetail(customerId, user),
    getAssignableSalesRepsForCustomer(customerId, user),
  ]);

  if (!detail || !assignmentData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Link href={`/customers/${customerId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to customer
        </Link>
        <p className="mt-4 text-sm font-medium text-blue-600">Customer assignment</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">{detail.customer.companyName}</h1>
        <p className="mt-2 text-gray-600">Current owner: {detail.customer.salesRepName}</p>

        <form action={assignCustomer} className="mt-6 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <input type="hidden" name="customerId" value={customerId} />
          <select
            name="assignedSalesRepId"
            defaultValue={detail.customer.assignedSalesRepId ?? ""}
            required
            className="min-w-64 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          >
            {assignmentData.salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name} / {rep.email}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Assign customer
          </button>
        </form>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Assignment history</h2>
        <div className="mt-3 space-y-3">
          {assignmentData.history.length === 0 ? (
            <p className="text-sm text-gray-500">No assignment changes recorded yet.</p>
          ) : (
            assignmentData.history.map((entry) => (
              <div key={entry.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                <p className="text-gray-700">
                  Rep #{entry.previousSalesRepId ?? "none"} to rep #{entry.newSalesRepId}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Changed by {entry.changedByName} / {formatDate(entry.changedAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
