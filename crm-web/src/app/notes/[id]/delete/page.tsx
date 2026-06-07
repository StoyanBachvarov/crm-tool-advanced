import { deleteNote } from "@/app/actions/notes";
import { requireUser } from "@/lib/auth";
import { getEditableNote } from "@/services/notes";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DeleteNotePage({
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
      <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-rose-600">Delete note</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Remove this note?</h1>
        <p className="mt-3 whitespace-pre-wrap text-gray-700">{note.text}</p>
        <div className="mt-6 flex gap-3">
          <form action={deleteNote}>
            <input type="hidden" name="noteId" value={note.id} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
              Delete note
            </button>
          </form>
          <Link href={redirectTo} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
