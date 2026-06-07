import { createCustomer } from "@/app/actions/crm";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { requireUser } from "@/lib/auth";
import { getManageableSalesReps } from "@/services/crm";
import Link from "next/link";

export default async function NewCustomerPage() {
  const user = await requireUser();
  const salesReps = await getManageableSalesReps(user);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href="/customers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to customers
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">New customer</h1>
      </div>
      <CustomerForm action={createCustomer} salesReps={salesReps} submitLabel="Create customer" />
    </div>
  );
}
