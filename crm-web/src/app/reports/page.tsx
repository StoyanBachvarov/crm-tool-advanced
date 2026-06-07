import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getReportsData } from "@/services/reports";

type ChartRow = {
  label: string;
  value: string | number;
};

function numberValue(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function formatMoney(value: string | number) {
  return `$${numberValue(value).toLocaleString("en", { maximumFractionDigits: 0 })}`;
}

function BarChart({ title, rows, money = false }: { title: string; rows: ChartRow[]; money?: boolean }) {
  const max = Math.max(1, ...rows.map((row) => numberValue(row.value)));

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">No data yet.</p>
        ) : (
          rows.map((row) => {
            const value = numberValue(row.value);
            const width = Math.max(6, Math.round((value / max) * 100));

            return (
              <div key={row.label}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="font-medium text-gray-700">{row.label}</span>
                  <span className="text-gray-500">{money ? formatMoney(row.value) : value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Never";
}

export default async function ReportsPage() {
  const user = await requireUser();
  const data = await getReportsData(user);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">Performance analytics filtered to your CRM permissions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart title="Sales by month" rows={data.salesByMonth} money />
        <BarChart title="Sales by sales rep" rows={data.salesByRep} money />
        <BarChart title="Open pipeline value" rows={data.openPipeline} money />
        <BarChart title="Opportunities by stage" rows={data.opportunitiesByStage} />
        <BarChart title="Activities by type" rows={data.activitiesByType} />
        <BarChart title="Activities by sales rep" rows={data.activitiesByRep} />
        <BarChart title="Offers by status" rows={data.offersByStatus} />
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Customers without recent activity</h2>
          <div className="mt-4 space-y-3">
            {data.customersWithoutRecentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No stale customers found.</p>
            ) : (
              data.customersWithoutRecentActivity.map((customer) => (
                <Link key={customer.id} href={`/customers/${customer.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                  <span className="font-medium text-gray-900">{customer.companyName}</span>
                  <span className="ml-2 text-gray-500">{customer.salesRepName} / {formatDate(customer.lastActivityDate)}</span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
