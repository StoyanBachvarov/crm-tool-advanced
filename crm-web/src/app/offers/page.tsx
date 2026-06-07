import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { OfferStatusBadge } from "@/components/offers/OfferForm";
import { listFilteredOffers, type SearchParams } from "@/services/filters";
import { Pagination } from "@/components/list/Pagination";

function formatOptionalDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date) : "Not set";
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { rows: offers, paging } = await listFilteredOffers(user, params);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
            <p className="mt-2 text-gray-600">Manage proposal status from draft to accepted or rejected.</p>
          </div>
          <Link href="/offers/new" className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New offer
          </Link>
        </div>
      </div>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-5">
        <select name="status" defaultValue={String(params.status ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
          <option value="">Any status</option>
          {["draft", "sent", "accepted", "rejected", "expired", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input name="minAmount" type="number" step="0.01" defaultValue={String(params.minAmount ?? "")} placeholder="Min amount" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="maxAmount" type="number" step="0.01" defaultValue={String(params.maxAmount ?? "")} placeholder="Max amount" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="validUntilFrom" type="date" defaultValue={String(params.validUntilFrom ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <input name="validUntilTo" type="date" defaultValue={String(params.validUntilTo ?? "")} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 lg:col-span-5">Filter</button>
      </form>

      <div className="space-y-3">
        {offers.map((offer) => (
          <Link href={`/offers/${offer.id}`} id={`offer-${offer.id}`} key={offer.id} className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">{offer.offerNumber} / {offer.title}</h2>
                <p className="text-sm text-gray-500">{offer.customerName} / valid until {formatOptionalDate(offer.validUntilDate)}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">{offer.amount} {offer.currency}</span>
            </div>
            <div className="mt-2"><OfferStatusBadge status={offer.status} /></div>
          </Link>
        ))}
      </div>
      <Pagination paging={paging} searchParams={params} basePath="/offers" />
    </div>
  );
}
