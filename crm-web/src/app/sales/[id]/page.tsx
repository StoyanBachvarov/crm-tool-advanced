import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSalesRecordDetail } from "@/services/crm";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const saleId = Number(id);

  if (!Number.isInteger(saleId)) notFound();
  const detail = await getSalesRecordDetail(saleId, user);
  if (!detail) notFound();

  const { sale, notes } = detail;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-blue-600">{sale.customerName}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{sale.amount} {sale.currency}</h1>
          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
            registered
          </span>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-sm text-gray-500">Sale date</dt><dd className="font-medium text-gray-900">{formatDate(sale.saleDate)}</dd></div>
          <div><dt className="text-sm text-gray-500">Sales rep</dt><dd className="font-medium text-gray-900">{sale.salesRepName}</dd></div>
          <div><dt className="text-sm text-gray-500">Created</dt><dd className="font-medium text-gray-900">{formatDate(sale.createdAt)}</dd></div>
          <div><dt className="text-sm text-gray-500">Opportunity</dt><dd className="font-medium text-gray-900">{sale.opportunityTitle || "Not linked"}</dd></div>
          <div><dt className="text-sm text-gray-500">Offer</dt><dd className="font-medium text-gray-900">{sale.offerNumber ? `${sale.offerNumber} / ${sale.offerTitle}` : "Not linked"}</dd></div>
        </dl>
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Notes</h2>
          <p className="mt-2 text-gray-700">{sale.notes || "No sale notes."}</p>
        </section>
        <div className="mt-5">
          <Link href="/sales" className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700">
            Back to sales
          </Link>
        </div>
      </div>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Note records</h2>
        <div className="mt-3 space-y-3">
          {notes.length === 0 ? <p className="text-sm text-gray-500">No note records.</p> : notes.map((note) => (
            <div key={note.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
              <p className="text-gray-700">{note.text}</p>
              <p className="mt-1 text-xs text-gray-500">{note.ownerName} / {formatDate(note.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
