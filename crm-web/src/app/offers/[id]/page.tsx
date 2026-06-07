import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOfferManagementDetail } from "@/services/crm";
import { OfferStatusBadge } from "@/components/offers/OfferForm";

function formatOptionalDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Not set";
}

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const offerId = Number(id);

  if (!Number.isInteger(offerId)) notFound();
  const detail = await getOfferManagementDetail(offerId, user);
  if (!detail) notFound();

  const { offer, notes, salesRecords } = detail;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-blue-600">{offer.customerName}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{offer.offerNumber} / {offer.title}</h1>
            <p className="mt-2 text-gray-600">{offer.opportunityTitle || "No linked opportunity"}</p>
          </div>
          <OfferStatusBadge status={offer.status} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/offers/${offer.id}/edit`} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Edit offer</Link>
          <Link href={`/offers/${offer.id}/send`} className="rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Mark sent</Link>
          <Link href={`/offers/${offer.id}/accept`} className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">Accept</Link>
          <Link href={`/offers/${offer.id}/reject`} className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">Reject</Link>
          {offer.status === "accepted" && (
            <Link href={`/sales/new?customerId=${offer.customerId}&offerId=${offer.id}${offer.opportunityId ? `&opportunityId=${offer.opportunityId}` : ""}`} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700">
              Convert to sale
            </Link>
          )}
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-sm text-gray-500">Amount</dt><dd className="font-medium text-gray-900">{offer.amount} {offer.currency}</dd></div>
          <div><dt className="text-sm text-gray-500">Valid until</dt><dd className="font-medium text-gray-900">{formatOptionalDate(offer.validUntilDate)}</dd></div>
          <div><dt className="text-sm text-gray-500">Created by</dt><dd className="font-medium text-gray-900">{offer.createdByName}</dd></div>
          <div><dt className="text-sm text-gray-500">Created</dt><dd className="font-medium text-gray-900">{formatOptionalDate(offer.createdAt)}</dd></div>
        </dl>
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Notes</h2>
          <p className="mt-2 text-gray-700">{offer.notes || "No offer notes yet."}</p>
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Sales records</h2>
          <div className="mt-3 space-y-3">
            {salesRecords.length === 0 ? <p className="text-sm text-gray-500">No sales records for this offer.</p> : salesRecords.map((sale) => (
              <Link key={sale.id} href={`/sales/${sale.id}`} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-300">
                <span className="font-medium text-gray-900">{sale.amount} {sale.currency}</span>
                <span className="ml-2 text-gray-500">{formatOptionalDate(sale.saleDate)}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Note records</h2>
          <div className="mt-3 space-y-3">
            {notes.length === 0 ? <p className="text-sm text-gray-500">No note records.</p> : notes.map((note) => (
              <div key={note.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                <p className="text-gray-700">{note.text}</p>
                <p className="mt-1 text-xs text-gray-500">{note.ownerName} / {formatOptionalDate(note.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
