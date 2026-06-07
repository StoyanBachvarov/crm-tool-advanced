import { createSalesRecord } from "@/app/actions/crm";
import { SalesRecordForm } from "@/components/sales/SalesRecordForm";
import { requireUser } from "@/lib/auth";
import { getCrmListData, getOfferManagementDetail } from "@/services/crm";
import Link from "next/link";

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; opportunityId?: string; offerId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const offerId = Number(params.offerId);
  const [data, offerDetail] = await Promise.all([
    getCrmListData(user),
    Number.isInteger(offerId) ? getOfferManagementDetail(offerId, user) : Promise.resolve(null),
  ]);
  const customerId = Number(params.customerId);
  const opportunityId = Number(params.opportunityId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href="/sales" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to sales
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">New sales record</h1>
      </div>
      <SalesRecordForm
        action={createSalesRecord}
        customers={data.customers}
        opportunities={data.opportunities}
        offers={data.offers}
        defaultCustomerId={Number.isInteger(customerId) ? customerId : offerDetail?.offer.customerId}
        defaultOpportunityId={Number.isInteger(opportunityId) ? opportunityId : offerDetail?.offer.opportunityId ?? undefined}
        defaultOfferId={Number.isInteger(offerId) ? offerId : undefined}
        defaultAmount={offerDetail?.offer.amount}
        defaultCurrency={offerDetail?.offer.currency}
      />
    </div>
  );
}
