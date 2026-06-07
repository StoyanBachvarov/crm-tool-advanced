import { updateCustomer } from "@/app/actions/crm";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { requireUser } from "@/lib/auth";
import { getCustomerManagementDetail, getManageableSalesReps } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({
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

  const [detail, salesReps] = await Promise.all([
    getCustomerManagementDetail(customerId, user),
    getManageableSalesReps(user),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link
          href={`/customers/${customerId}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Back to customer
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit customer</h1>
      </div>
      <CustomerForm
        action={updateCustomer}
        customer={detail.customer}
        salesReps={salesReps}
        submitLabel="Save changes"
      />
    </div>
  );
}
