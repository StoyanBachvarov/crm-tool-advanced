type CustomerFormValue = {
  id?: number;
  companyName?: string;
  industrySector?: string | null;
  status?: string | null;
  deliveryAddress?: string | null;
  administrativeAddress?: string | null;
  communicationAddress?: string | null;
  mainContactName?: string | null;
  contactPosition?: string | null;
  phone?: string | null;
  email?: string | null;
  assignedSalesRepId?: number | null;
  notes?: string | null;
};

type SalesRepOption = {
  id: number;
  name: string;
  email: string;
};

const customerStatuses = [
  "lead",
  "prospect",
  "active customer",
  "inactive customer",
  "lost customer",
];

function inputClasses() {
  return "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
}

export function CustomerForm({
  action,
  customer,
  salesReps,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  customer?: CustomerFormValue;
  salesReps: SalesRepOption[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-2">
      {customer?.id && <input type="hidden" name="customerId" value={customer.id} />}

      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Company name
        <input
          name="companyName"
          required
          defaultValue={customer?.companyName ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Industry
        <input
          name="industrySector"
          defaultValue={customer?.industrySector ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Status
        <select
          name="status"
          defaultValue={customer?.status ?? "lead"}
          className={inputClasses()}
        >
          {customerStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Assigned sales rep
        <select
          name="assignedSalesRepId"
          defaultValue={customer?.assignedSalesRepId ?? salesReps[0]?.id}
          className={inputClasses()}
        >
          {salesReps.map((rep) => (
            <option key={rep.id} value={rep.id}>
              {rep.name} / {rep.email}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Main contact
        <input
          name="mainContactName"
          defaultValue={customer?.mainContactName ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Contact position
        <input
          name="contactPosition"
          defaultValue={customer?.contactPosition ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Phone
        <input name="phone" defaultValue={customer?.phone ?? ""} className={inputClasses()} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Email
        <input
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Delivery address
        <textarea
          name="deliveryAddress"
          rows={3}
          defaultValue={customer?.deliveryAddress ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Administrative address
        <textarea
          name="administrativeAddress"
          rows={3}
          defaultValue={customer?.administrativeAddress ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Communication address
        <textarea
          name="communicationAddress"
          rows={3}
          defaultValue={customer?.communicationAddress ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={customer?.notes ?? ""}
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
