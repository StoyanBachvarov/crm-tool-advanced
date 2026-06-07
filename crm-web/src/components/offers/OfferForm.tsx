type CustomerOption = {
  id: number;
  companyName: string;
};

type OpportunityOption = {
  id: number;
  customerId: number;
  title: string;
};

type OfferValue = {
  id?: number;
  customerId?: number;
  opportunityId?: number | null;
  offerNumber?: string;
  title?: string;
  amount?: string;
  currency?: string;
  status?: string;
  validUntilDate?: Date | null;
  notes?: string | null;
};

const statuses = ["draft", "sent", "accepted", "rejected", "expired", "cancelled"];

function inputClasses() {
  return "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
}

function dateValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function OfferStatusBadge({ status }: { status: string }) {
  const classes =
    status === "accepted"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : status === "sent"
          ? "bg-blue-50 text-blue-700 ring-blue-200"
          : "bg-gray-100 text-gray-700 ring-gray-200";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${classes}`}>
      {status}
    </span>
  );
}

export function OfferForm({
  action,
  offer,
  customers,
  opportunities,
  defaultCustomerId,
  defaultOpportunityId,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  offer?: OfferValue;
  customers: CustomerOption[];
  opportunities: OpportunityOption[];
  defaultCustomerId?: number;
  defaultOpportunityId?: number;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-2">
      {offer?.id && <input type="hidden" name="offerId" value={offer.id} />}
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Customer
        <select
          name="customerId"
          required
          defaultValue={offer?.customerId ?? defaultCustomerId ?? ""}
          className={inputClasses()}
        >
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.companyName}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Opportunity
        <select
          name="opportunityId"
          defaultValue={offer?.opportunityId ?? defaultOpportunityId ?? ""}
          className={inputClasses()}
        >
          <option value="">No opportunity</option>
          {opportunities.map((opportunity) => (
            <option key={opportunity.id} value={opportunity.id}>
              {opportunity.title}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Offer number
        <input name="offerNumber" defaultValue={offer?.offerNumber ?? ""} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Title
        <input name="title" required defaultValue={offer?.title ?? ""} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Amount
        <input name="amount" required type="number" step="0.01" defaultValue={offer?.amount ?? ""} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Currency
        <input name="currency" required defaultValue={offer?.currency ?? "USD"} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Status
        <select name="status" defaultValue={offer?.status ?? "draft"} className={inputClasses()}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Valid until
        <input name="validUntilDate" type="date" defaultValue={dateValue(offer?.validUntilDate)} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700 lg:col-span-2">
        Notes
        <textarea name="notes" rows={4} defaultValue={offer?.notes ?? ""} className={inputClasses()} />
      </label>
      <div className="lg:col-span-2">
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
