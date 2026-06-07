import { acceptOffer } from "@/app/actions/crm";
import { requireUser } from "@/lib/auth";
import { getOfferManagementDetail } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AcceptOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const offerId = Number(id);
  if (!Number.isInteger(offerId)) notFound();
  const detail = await getOfferManagementDetail(offerId, user);
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-emerald-600">Accept offer</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{detail.offer.title}</h1>
        <p className="mt-3 text-gray-600">After acceptance, the offer detail page can convert it to a sales record.</p>
        <div className="mt-6 flex gap-3">
          <form action={acceptOffer}><input type="hidden" name="offerId" value={offerId} /><button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Accept offer</button></form>
          <Link href={`/offers/${offerId}`} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
