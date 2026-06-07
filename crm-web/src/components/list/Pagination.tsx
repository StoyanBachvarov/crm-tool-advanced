import Link from "next/link";

export function Pagination({
  paging,
  searchParams,
  basePath,
}: {
  paging: { page: number; totalPages: number; total: number };
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  function href(page: number) {
    const params = new URLSearchParams();

    for (const [key, raw] of Object.entries(searchParams)) {
      const value = Array.isArray(raw) ? raw[0] : raw;
      if (value && key !== "page") {
        params.set(key, value);
      }
    }

    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
      <span>Page {paging.page} of {paging.totalPages} / {paging.total} total</span>
      <div className="flex gap-2">
        <Link
          href={href(Math.max(1, paging.page - 1))}
          aria-disabled={paging.page <= 1}
          className={`rounded-md border px-3 py-1.5 font-medium ${
            paging.page <= 1
              ? "pointer-events-none border-gray-200 text-gray-300"
              : "border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          Previous
        </Link>
        <Link
          href={href(Math.min(paging.totalPages, paging.page + 1))}
          aria-disabled={paging.page >= paging.totalPages}
          className={`rounded-md border px-3 py-1.5 font-medium ${
            paging.page >= paging.totalPages
              ? "pointer-events-none border-gray-200 text-gray-300"
              : "border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
