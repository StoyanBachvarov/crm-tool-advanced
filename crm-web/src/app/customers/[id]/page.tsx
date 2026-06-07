import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCustomerManagementDetail } from "@/services/crm";
import { NotesPanel } from "@/components/notes/NotesPanel";

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

  const detail = await getCustomerManagementDetail(customerId, user);

  if (!detail) {
    notFound();
  }

  const { customer, activities, opportunities, offers, salesRecords } = detail;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
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
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Edit customer
          </Link>
          <Link
            href={`/customers/${customer.id}/archive`}
            className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Archive
          </Link>
          <Link
            href={`/customers/${customer.id}/assign`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
          >
            Assign
          </Link>
          <Link
            href={`/activities/new?customerId=${customer.id}`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
          >
            New activity
          </Link>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Activities</h2>
          <div className="mt-3 space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">No activities yet.</p>
            ) : (
              activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300"
                >
                  <span className="font-medium text-gray-900">{activity.title}</span>
                  <span className="ml-2 text-gray-500">
                    {activity.type} / {formatOptionalDate(activity.startDate)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Opportunities</h2>
          <div className="mt-3 space-y-3">
            {opportunities.length === 0 ? (
              <p className="text-sm text-gray-500">No opportunities yet.</p>
            ) : (
              opportunities.map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href={`/opportunities/${opportunity.id}`}
                  className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300"
                >
                  <span className="font-medium text-gray-900">{opportunity.title}</span>
                  <span className="ml-2 text-gray-500">
                    {opportunity.stage} / {opportunity.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Offers</h2>
          <div className="mt-3 space-y-3">
            {offers.length === 0 ? (
              <p className="text-sm text-gray-500">No offers yet.</p>
            ) : (
              offers.map((offer) => (
                <div key={offer.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <p className="font-medium text-gray-900">
                    {offer.offerNumber} / {offer.title}
                  </p>
                  <p className="text-gray-500">
                    {offer.amount} {offer.currency} / {offer.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Sales records</h2>
          <div className="mt-3 space-y-3">
            {salesRecords.length === 0 ? (
              <p className="text-sm text-gray-500">No sales records yet.</p>
            ) : (
              salesRecords.map((sale) => (
                <div key={sale.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                  <p className="font-medium text-gray-900">
                    {sale.amount} {sale.currency}
                  </p>
                  <p className="text-gray-500">{formatOptionalDate(sale.saleDate)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <NotesPanel entityType="customer" entityId={customer.id} user={user} redirectTo={`/customers/${customer.id}`} />
    </div>
  );
}
