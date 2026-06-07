import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex flex-shrink-0 items-center text-xl font-bold text-blue-600"
            >
              CRM Tool
            </Link>
            <nav className="ml-6 flex flex-wrap gap-1">
              <Link
                href="/"
                className="rounded-md px-3 py-2 font-medium text-gray-700 hover:text-blue-600"
              >
                Home
              </Link>
              {user && (
                <>
                  {[
                    ["Dashboard", "/dashboard"],
                    ["Customers", "/customers"],
                    ["Activities", "/activities"],
                    ["Opportunities", "/opportunities"],
                    ["Offers", "/offers"],
                    ["Sales", "/sales"],
                    ...(user.role === "sales_manager" || user.role === "admin"
                      ? [["Team", "/team"]]
                      : []),
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="rounded-md px-3 py-2 font-medium text-gray-700 hover:text-blue-600"
                    >
                      {label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-right text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="capitalize text-gray-500">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
