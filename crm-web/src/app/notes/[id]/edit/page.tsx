import { updateNote } from "@/app/actions/notes";
import { requireUser } from "@/lib/auth";
import { getEditableNote } from "@/services/notes";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const user = await requireUser();
  const [{ id }, { returnTo }] = await Promise.all([params, searchParams]);
  const noteId = Number(id);

  if (!Number.isInteger(noteId)) {
    notFound();
  }

  const note = await getEditableNote(noteId, user);
  const redirectTo = returnTo || "/";

  if (!note) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <form action={updateNote} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="noteId" value={note.id} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <p className="text-sm font-medium text-blue-600">Edit note</p>
        <textarea
          name="text"
          rows={6}
          required
          defaultValue={note.text}
          className="mt-4 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="mt-5 flex gap-3">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Save note
          </button>
          <Link href={redirectTo} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
