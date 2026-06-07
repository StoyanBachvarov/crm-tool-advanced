"use server";

import { db } from "@/db";
import { notesTable } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canAccessNoteEntity, getEditableNote, type NoteEntityType } from "@/services/notes";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function requiredText(formData: FormData, key: string) {
  const value = text(formData, key);

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

export async function createNote(formData: FormData) {
  const user = await requireUser();
  const entityType = requiredText(formData, "entityType") as NoteEntityType;
  const entityId = Number(requiredText(formData, "entityId"));
  const redirectTo = requiredText(formData, "redirectTo");

  if (!Number.isInteger(entityId) || !(await canAccessNoteEntity(entityType, entityId, user))) {
    redirect(redirectTo);
  }

  await db.insert(notesTable).values({
    ownerUserId: user.id,
    entityType,
    entityId,
    text: requiredText(formData, "text"),
  });

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function updateNote(formData: FormData) {
  const user = await requireUser();
  const noteId = Number(requiredText(formData, "noteId"));
  const redirectTo = requiredText(formData, "redirectTo");
  const note = await getEditableNote(noteId, user);

  if (!note) {
    redirect(redirectTo);
  }

  await db
    .update(notesTable)
    .set({
      text: requiredText(formData, "text"),
      updatedAt: new Date(),
    })
    .where(eq(notesTable.id, noteId));

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

export async function deleteNote(formData: FormData) {
  const user = await requireUser();
  const noteId = Number(requiredText(formData, "noteId"));
  const redirectTo = requiredText(formData, "redirectTo");
  const note = await getEditableNote(noteId, user);

  if (!note) {
    redirect(redirectTo);
  }

  await db.delete(notesTable).where(eq(notesTable.id, noteId));

  revalidatePath(redirectTo);
  redirect(redirectTo);
}
