import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default async function SalesPage() {
  const user = await requireUser();
  const { salesRecords } = await getCrmListData(user);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
            <p className="mt-2 text-gray-600">Review completed sales and register new revenue.</p>
          </div>
          <Link href="/sales/new" className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New sale
          </Link>
        </div>
      </div>
      <div className="space-y-3">
        {salesRecords.map((sale) => (
          <Link id={`sale-${sale.id}`} key={sale.id} href={`/sales/${sale.id}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300">
            <div>
              <h2 className="font-semibold text-gray-900">{sale.customerName}</h2>
              <p className="text-sm text-gray-500">{sale.salesRepName} / {formatDate(sale.saleDate)}</p>
            </div>
            <span className="font-medium text-gray-900">{sale.amount} {sale.currency}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
