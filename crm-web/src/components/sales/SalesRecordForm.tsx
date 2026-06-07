type CustomerOption = {
  id: number;
  companyName: string;
};

type OpportunityOption = {
  id: number;
  title: string;
};

type OfferOption = {
  id: number;
  offerNumber: string;
  title: string;
  amount: string;
  currency: string;
};

function inputClasses() {
  return "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
}

export function SalesRecordForm({
  action,
  customers,
  opportunities,
  offers,
  defaultCustomerId,
  defaultOpportunityId,
  defaultOfferId,
  defaultAmount,
  defaultCurrency,
}: {
  action: (formData: FormData) => void | Promise<void>;
  customers: CustomerOption[];
  opportunities: OpportunityOption[];
  offers: OfferOption[];
  defaultCustomerId?: number;
  defaultOpportunityId?: number;
  defaultOfferId?: number;
  defaultAmount?: string;
  defaultCurrency?: string;
}) {
  return (
    <form action={action} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-2">
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Customer
        <select name="customerId" required defaultValue={defaultCustomerId ?? ""} className={inputClasses()}>
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
        <select name="opportunityId" defaultValue={defaultOpportunityId ?? ""} className={inputClasses()}>
          <option value="">No opportunity</option>
          {opportunities.map((opportunity) => (
            <option key={opportunity.id} value={opportunity.id}>
              {opportunity.title}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Offer
        <select name="offerId" defaultValue={defaultOfferId ?? ""} className={inputClasses()}>
          <option value="">No offer</option>
          {offers.map((offer) => (
            <option key={offer.id} value={offer.id}>
              {offer.offerNumber} / {offer.title}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Amount
        <input name="amount" required type="number" step="0.01" defaultValue={defaultAmount ?? ""} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Currency
        <input name="currency" required defaultValue={defaultCurrency ?? "USD"} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Sale date
        <input name="saleDate" type="date" className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700 lg:col-span-2">
        Notes
        <textarea name="notes" rows={4} className={inputClasses()} />
      </label>
      <div className="lg:col-span-2">
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Register sale
        </button>
      </div>
    </form>
  );
}
