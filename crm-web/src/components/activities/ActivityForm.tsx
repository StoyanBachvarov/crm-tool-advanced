type CustomerOption = {
  id: number;
  companyName: string;
};

type ActivityFormValue = {
  id?: number;
  customerId?: number;
  type?: string;
  title?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date | null;
  status?: string;
  nextAction?: string | null;
};

const activityTypes = [
  "Visit",
  "Phone call",
  "Meeting",
  "Email",
  "Follow-up task",
  "Demo",
  "Other",
];

const activityStatuses = ["upcoming", "current", "completed", "cancelled"];

function inputClasses() {
  return "rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
}

function toDateTimeLocal(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function ActivityForm({
  action,
  activity,
  customers,
  defaultCustomerId,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  activity?: ActivityFormValue;
  customers: CustomerOption[];
  defaultCustomerId?: number;
  submitLabel: string;
}) {
  const selectedCustomerId = activity?.customerId ?? defaultCustomerId ?? "";

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-2">
      {activity?.id && <input type="hidden" name="activityId" value={activity.id} />}

      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Customer
        <select
          name="customerId"
          required
          defaultValue={selectedCustomerId}
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
        Type
        <select name="type" defaultValue={activity?.type ?? "Visit"} className={inputClasses()}>
          {activityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Title
        <input
          name="title"
          required
          defaultValue={activity?.title ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Status
        <select
          name="status"
          defaultValue={activity?.status ?? "upcoming"}
          className={inputClasses()}
        >
          {activityStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Start date and time
        <input
          name="startDate"
          required
          type="datetime-local"
          defaultValue={toDateTimeLocal(activity?.startDate)}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        End date and time
        <input
          name="endDate"
          type="datetime-local"
          defaultValue={toDateTimeLocal(activity?.endDate)}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={activity?.description ?? ""}
          className={inputClasses()}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-700">
        Next action
        <textarea
          name="nextAction"
          rows={4}
          defaultValue={activity?.nextAction ?? ""}
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
