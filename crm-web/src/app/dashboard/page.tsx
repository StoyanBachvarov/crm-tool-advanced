import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">CRM Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          Welcome back, {user.name}. Customer, activity, opportunity, offer,
          and sales views can be built from here.
        </p>
      </div>
    </div>
  );
}
