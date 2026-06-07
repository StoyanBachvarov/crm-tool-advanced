import { updateOffer } from "@/app/actions/crm";
import { OfferForm } from "@/components/offers/OfferForm";
import { requireUser } from "@/lib/auth";
import { getCrmListData, getOfferManagementDetail } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const offerId = Number(id);

  if (!Number.isInteger(offerId)) notFound();
  const [detail, { customers, opportunities }] = await Promise.all([
    getOfferManagementDetail(offerId, user),
    getCrmListData(user),
  ]);
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href={`/offers/${offerId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to offer
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit offer</h1>
      </div>
      <OfferForm action={updateOffer} offer={detail.offer} customers={customers} opportunities={opportunities} submitLabel="Save changes" />
    </div>
  );
}
