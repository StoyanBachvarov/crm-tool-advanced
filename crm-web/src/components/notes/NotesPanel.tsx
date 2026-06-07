import Link from "next/link";
import { createNote } from "@/app/actions/notes";
import { getEntityNotes, type NoteEntityType } from "@/services/notes";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export async function NotesPanel({
  entityType,
  entityId,
  user,
  redirectTo,
}: {
  entityType: NoteEntityType;
  entityId: number;
  user: { id: number; role: string };
  redirectTo: string;
}) {
  const notes = await getEntityNotes(entityType, entityId, user);

  if (!notes) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">Notes</h2>
      <form action={createNote} className="mt-4 space-y-3">
        <input type="hidden" name="entityType" value={entityType} />
        <input type="hidden" name="entityId" value={entityId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <textarea
          name="text"
          rows={3}
          required
          placeholder="Add a note"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add note
        </button>
      </form>
      <div className="mt-5 space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500">No notes yet.</p>
        ) : (
          notes.map((note) => {
            const canEdit = note.ownerUserId === user.id || user.role === "admin" || user.role === "sales_manager";

            return (
              <div key={note.id} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap text-gray-700">{note.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>{note.ownerName} / {formatDate(note.createdAt)}</span>
                  {note.updatedAt.getTime() !== note.createdAt.getTime() && <span>edited {formatDate(note.updatedAt)}</span>}
                  {canEdit && (
                    <>
                      <Link href={`/notes/${note.id}/edit?returnTo=${encodeURIComponent(redirectTo)}`} className="font-medium text-blue-700 hover:text-blue-800">
                        Edit
                      </Link>
                      <Link href={`/notes/${note.id}/delete?returnTo=${encodeURIComponent(redirectTo)}`} className="font-medium text-rose-700 hover:text-rose-800">
                        Delete
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
