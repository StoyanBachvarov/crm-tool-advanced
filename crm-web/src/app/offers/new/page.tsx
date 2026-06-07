import { createOffer } from "@/app/actions/crm";
import { OfferForm } from "@/components/offers/OfferForm";
import { requireUser } from "@/lib/auth";
import { getCrmListData } from "@/services/crm";
import Link from "next/link";

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; opportunityId?: string }>;
}) {
  const user = await requireUser();
  const [{ customerId, opportunityId }, { customers, opportunities }] = await Promise.all([
    searchParams,
    getCrmListData(user),
  ]);
  const defaultCustomerId = Number(customerId);
  const defaultOpportunityId = Number(opportunityId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href="/offers" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to offers
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">New offer</h1>
      </div>
      <OfferForm
        action={createOffer}
        customers={customers}
        opportunities={opportunities}
        defaultCustomerId={Number.isInteger(defaultCustomerId) ? defaultCustomerId : undefined}
        defaultOpportunityId={Number.isInteger(defaultOpportunityId) ? defaultOpportunityId : undefined}
        submitLabel="Create offer"
      />
    </div>
  );
}
