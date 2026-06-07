import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canAdminUsers, canManageTeam, getManagerOptions, getTeamMembers } from "@/services/team";
import { updateUserManagement } from "@/app/actions/team";

function money(value: string) {
  return `$${Number(value).toLocaleString("en", { maximumFractionDigits: 0 })}`;
}

export default async function TeamPage() {
  const user = await requireUser();

  if (!canManageTeam(user)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-rose-600">Access denied</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Team management is for managers and admins</h1>
        </div>
      </div>
    );
  }

  const [members, managers] = await Promise.all([
    getTeamMembers(user),
    canAdminUsers(user) ? getManagerOptions() : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-blue-600">CRM</p>
        <h1 className="text-3xl font-bold text-gray-900">Sales Team</h1>
        <p className="mt-2 text-gray-600">Review workload, pipeline, recent volume, and team ownership.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Rep</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Customers</th>
              <th className="px-4 py-3">Activities</th>
              <th className="px-4 py-3">Pipeline</th>
              <th className="px-4 py-3">Sales</th>
              {canAdminUsers(user) && <th className="px-4 py-3">Admin</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3">
                  <Link href={`/team/${member.id}`} className="font-medium text-blue-700 hover:text-blue-800">
                    {member.name}
                  </Link>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </td>
                <td className="px-4 py-3 capitalize text-gray-700">{member.role.replace("_", " ")}</td>
                <td className="px-4 py-3 text-gray-700">
                  <Link href={`/team/${member.id}/customers`} className="text-blue-700 hover:text-blue-800">
                    {member.metrics.customers}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <Link href={`/team/${member.id}/activities`} className="text-blue-700 hover:text-blue-800">
                    {member.metrics.activities}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {member.metrics.openOpportunities} open / {money(member.metrics.openPipelineValue)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {member.metrics.salesCount} records / {money(member.metrics.salesValue)}
                </td>
                {canAdminUsers(user) && (
                  <td className="px-4 py-3">
                    <form action={updateUserManagement} className="flex flex-wrap gap-2">
                      <input type="hidden" name="userId" value={member.id} />
                      <select name="role" defaultValue={member.role} className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900">
                        <option value="sales_rep">Sales rep</option>
                        <option value="sales_manager">Sales manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select name="managerId" defaultValue={member.managerId ?? ""} className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900">
                        <option value="">No manager</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700">
                        Save
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
