import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCustomerDetail } from "@/services/dashboard";

function formatOptionalDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
      }).format(date)
    : "No activity recorded";
}

export default async function CustomerPage({
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

  const customer = await getCustomerDetail(customerId, user);

  if (!customer) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-blue-600">Customer</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.companyName}
            </h1>
            <p className="mt-2 text-gray-600">
              {customer.industrySector || "No industry set"}
            </p>
          </div>
          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">
            {customer.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Main contact</dt>
            <dd className="font-medium text-gray-900">
              {customer.mainContactName || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Contact position</dt>
            <dd className="font-medium text-gray-900">
              {customer.contactPosition || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Assigned sales rep</dt>
            <dd className="font-medium text-gray-900">{customer.salesRepName}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Phone</dt>
            <dd className="font-medium text-gray-900">
              {customer.phone || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">
              {customer.email || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Last activity date</dt>
            <dd className="font-medium text-gray-900">
              {formatOptionalDate(customer.lastActivityDate)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Delivery address
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              {customer.deliveryAddress || "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Administrative address
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              {customer.administrativeAddress || "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Communication address
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              {customer.communicationAddress || "Not set"}
            </p>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Notes</h2>
          <p className="mt-2 text-gray-700">{customer.notes || "No notes yet."}</p>
        </section>
      </div>
    </div>
  );
}
