type CustomerOption = {
  id: number;
  companyName: string;
};

type OpportunityValue = {
  id?: number;
  customerId?: number;
  title?: string;
  description?: string | null;
  estimatedValue?: string | null;
  probability?: number | null;
  stage?: string;
  status?: string;
  expectedCloseDate?: Date | null;
};

export const opportunityStages = [
  "New",
  "Qualified",
  "Proposal needed",
  "Offer sent",
  "Negotiation",
  "Won",
  "Lost",
];

const statuses = ["open", "won", "lost", "cancelled"];

function inputClasses() {
  return "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
}

function dateValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function StageIndicator({ stage }: { stage: string }) {
  const currentIndex = opportunityStages.findIndex(
    (item) => item.toLowerCase() === stage.toLowerCase()
  );

  return (
    <div className="flex flex-wrap gap-2">
      {opportunityStages.map((item, index) => {
        const active = index <= currentIndex;

        return (
          <span
            key={item}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
              active
                ? "bg-blue-50 text-blue-700 ring-blue-200"
                : "bg-gray-50 text-gray-500 ring-gray-200"
            }`}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}

export function OpportunityForm({
  action,
  opportunity,
  customers,
  defaultCustomerId,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  opportunity?: OpportunityValue;
  customers: CustomerOption[];
  defaultCustomerId?: number;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-2">
      {opportunity?.id && <input type="hidden" name="opportunityId" value={opportunity.id} />}
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Customer
        <select
          name="customerId"
          required
          defaultValue={opportunity?.customerId ?? defaultCustomerId ?? ""}
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
        Title
        <input name="title" required defaultValue={opportunity?.title ?? ""} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Estimated value
        <input
          name="estimatedValue"
          type="number"
          step="0.01"
          defaultValue={opportunity?.estimatedValue ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Probability %
        <input
          name="probability"
          type="number"
          min="0"
          max="100"
          defaultValue={opportunity?.probability ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Stage
        <select name="stage" defaultValue={opportunity?.stage ?? "New"} className={inputClasses()}>
          {opportunityStages.map((stage) => (
            <option key={stage}>{stage}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Status
        <select name="status" defaultValue={opportunity?.status ?? "open"} className={inputClasses()}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Expected close date
        <input
          name="expectedCloseDate"
          type="date"
          defaultValue={dateValue(opportunity?.expectedCloseDate)}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700 lg:col-span-2">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={opportunity?.description ?? ""}
          className={inputClasses()}
        />
      </label>
      <div className="lg:col-span-2">
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
