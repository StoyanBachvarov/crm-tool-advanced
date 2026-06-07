import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardData, type ActivityState } from "@/services/dashboard";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function stateClasses(state: ActivityState) {
  const classes = {
    upcoming: "bg-sky-50 text-sky-700 ring-sky-200",
    current: "bg-amber-50 text-amber-700 ring-amber-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
  };

  return classes[state];
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500">
      {text}
    </div>
  );
}

function Indicator({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM Workspace</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user.name}. Here is the CRM work currently assigned to
          you.
        </p>
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Active Activities
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upcoming and current activities, ordered by date.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {data.currentActivities.length} current /{" "}
            {data.upcomingActivities.length} upcoming
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {data.activeActivities.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState text="No active activities are assigned right now." />
            </div>
          ) : (
            data.activeActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {formatDate(activity.startDate)} at{" "}
                      {formatTime(activity.startDate)}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {activity.title}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${stateClasses(
                      activity.state
                    )}`}
                  >
                    {activity.state}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Customer</dt>
                    <dd className="font-medium text-gray-900">
                      {activity.customerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">
                      {activity.type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Assigned rep</dt>
                    <dd className="font-medium text-gray-900">
                      {activity.salesRepName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Time</dt>
                    <dd className="font-medium text-gray-900">
                      {formatTime(activity.startDate)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 line-clamp-2 text-sm text-gray-600">
                  {activity.description || activity.nextAction || "No description yet."}
                </p>

                {activity.state === "current" && (
                  <div className="mt-4">
                    <Indicator label="overdue follow-up" />
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Upcoming Activities">
          {data.upcomingActivities.length === 0 ? (
            <EmptyState text="No upcoming activities." />
          ) : (
            <div className="space-y-3">
              {data.upcomingActivities.slice(0, 5).map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:border-blue-300"
                >
                  <span>
                    <span className="font-medium text-gray-900">
                      {activity.customerName}
                    </span>{" "}
                    <span className="text-gray-500">{activity.type}</span>
                  </span>
                  <span className="text-gray-500">
                    {formatDate(activity.startDate)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Current Activities">
          {data.currentActivities.length === 0 ? (
            <EmptyState text="No current activities." />
          ) : (
            <div className="space-y-3">
              {data.currentActivities.slice(0, 5).map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:border-blue-300"
                >
                  <span>
                    <span className="font-medium text-gray-900">
                      {activity.customerName}
                    </span>{" "}
                    <span className="text-gray-500">{activity.type}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ${stateClasses(
                      activity.state
                    )}`}
                  >
                    {activity.state}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recently Completed Activities">
          {data.recentlyCompletedActivities.length === 0 ? (
            <EmptyState text="No completed activities yet." />
          ) : (
            <div className="space-y-3">
              {data.recentlyCompletedActivities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:border-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {activity.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ${stateClasses(
                        activity.state
                      )}`}
                    >
                      {activity.state}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-500">
                    {activity.customerName} / {formatDate(activity.startDate)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Assigned Customers">
          {data.assignedCustomers.length === 0 ? (
            <EmptyState text="No customers assigned." />
          ) : (
            <div className="space-y-3">
              {data.assignedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {customer.companyName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {customer.mainContactName || "No contact"} /{" "}
                        {customer.salesRepName}
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700">
                      {customer.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {customer.indicators.noRecentActivity && (
                      <Indicator label="no recent activity" />
                    )}
                    {customer.indicators.offerPending && (
                      <Indicator label="offer pending" />
                    )}
                    {customer.indicators.opportunityWon && (
                      <Indicator label="opportunity won" />
                    )}
                    {customer.indicators.opportunityLost && (
                      <Indicator label="opportunity lost" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Open Opportunities">
          {data.openOpportunities.length === 0 ? (
            <EmptyState text="No open opportunities." />
          ) : (
            <div className="space-y-3">
              {data.openOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {opportunity.title}
                      </p>
                      <p className="text-gray-500">{opportunity.customerName}</p>
                    </div>
                    <span className="text-gray-700">
                      {opportunity.estimatedValue
                        ? `$${opportunity.estimatedValue}`
                        : "No value"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-500">
                    {opportunity.stage} / {opportunity.probability ?? 0}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recent Offers">
          {data.recentOffers.length === 0 ? (
            <EmptyState text="No recent offers." />
          ) : (
            <div className="space-y-3">
              {data.recentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {offer.offerNumber} / {offer.title}
                      </p>
                      <p className="text-gray-500">{offer.customerName}</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {offer.amount} {offer.currency}
                    </span>
                  </div>
                  <p className="mt-2 capitalize text-gray-500">{offer.status}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recent Sales Records">
          {data.recentSalesRecords.length === 0 ? (
            <EmptyState text="No recent sales records." />
          ) : (
            <div className="space-y-3">
              {data.recentSalesRecords.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {sale.customerName}
                    </p>
                    <p className="text-gray-500">{formatDate(sale.saleDate)}</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {sale.amount} {sale.currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
