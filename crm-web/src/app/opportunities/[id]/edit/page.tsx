import { updateOpportunity } from "@/app/actions/crm";
import { OpportunityForm } from "@/components/opportunities/OpportunityForm";
import { requireUser } from "@/lib/auth";
import { getCrmListData, getOpportunityManagementDetail } from "@/services/crm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const opportunityId = Number(id);

  if (!Number.isInteger(opportunityId)) {
    notFound();
  }

  const [detail, { customers }] = await Promise.all([
    getOpportunityManagementDetail(opportunityId, user),
    getCrmListData(user),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link href={`/opportunities/${opportunityId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to opportunity
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit opportunity</h1>
      </div>
      <OpportunityForm
        action={updateOpportunity}
        opportunity={detail.opportunity}
        customers={customers}
        submitLabel="Save changes"
      />
    </div>
  );
}
