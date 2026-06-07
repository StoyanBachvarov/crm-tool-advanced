import { db } from "@/db";
import {
  activitiesTable,
  customersTable,
  notesTable,
  offersTable,
  opportunitiesTable,
  salesRecordsTable,
  usersTable,
} from "@/db/schema";
import { getVisibleSalesRepIds } from "@/services/dashboard";
import { and, asc, eq, inArray } from "drizzle-orm";

type NotesUser = {
  id: number;
  role: string;
};

export type NoteEntityType = "customer" | "activity" | "opportunity" | "offer" | "sales_record";

export async function canAccessNoteEntity(
  entityType: NoteEntityType,
  entityId: number,
  user: NotesUser
) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  if (entityType === "customer") {
    const [row] = await db
      .select({ id: customersTable.id })
      .from(customersTable)
      .where(
        and(
          eq(customersTable.id, entityId),
          inArray(customersTable.assignedSalesRepId, visibleSalesRepIds)
        )
      )
      .limit(1);
    return Boolean(row);
  }

  if (entityType === "activity") {
    const [row] = await db
      .select({ id: activitiesTable.id })
      .from(activitiesTable)
      .where(and(eq(activitiesTable.id, entityId), inArray(activitiesTable.salesRepId, visibleSalesRepIds)))
      .limit(1);
    return Boolean(row);
  }

  if (entityType === "opportunity") {
    const [row] = await db
      .select({ id: opportunitiesTable.id })
      .from(opportunitiesTable)
      .where(
        and(eq(opportunitiesTable.id, entityId), inArray(opportunitiesTable.salesRepId, visibleSalesRepIds))
      )
      .limit(1);
    return Boolean(row);
  }

  if (entityType === "offer") {
    const [row] = await db
      .select({ id: offersTable.id })
      .from(offersTable)
      .where(and(eq(offersTable.id, entityId), inArray(offersTable.createdByUserId, visibleSalesRepIds)))
      .limit(1);
    return Boolean(row);
  }

  const [row] = await db
    .select({ id: salesRecordsTable.id })
    .from(salesRecordsTable)
    .where(and(eq(salesRecordsTable.id, entityId), inArray(salesRecordsTable.salesRepId, visibleSalesRepIds)))
    .limit(1);
  return Boolean(row);
}

export async function getEntityNotes(entityType: NoteEntityType, entityId: number, user: NotesUser) {
  if (!(await canAccessNoteEntity(entityType, entityId, user))) {
    return null;
  }

  return db
    .select({
      id: notesTable.id,
      ownerUserId: notesTable.ownerUserId,
      text: notesTable.text,
      createdAt: notesTable.createdAt,
      updatedAt: notesTable.updatedAt,
      ownerName: usersTable.name,
    })
    .from(notesTable)
    .innerJoin(usersTable, eq(notesTable.ownerUserId, usersTable.id))
    .where(and(eq(notesTable.entityType, entityType), eq(notesTable.entityId, entityId)))
    .orderBy(asc(notesTable.createdAt));
}

export async function getEditableNote(noteId: number, user: NotesUser) {
  const [note] = await db
    .select({
      id: notesTable.id,
      ownerUserId: notesTable.ownerUserId,
      entityType: notesTable.entityType,
      entityId: notesTable.entityId,
      text: notesTable.text,
    })
    .from(notesTable)
    .where(eq(notesTable.id, noteId))
    .limit(1);

  if (!note) {
    return null;
  }

  const entityType = note.entityType as NoteEntityType;

  if (!(await canAccessNoteEntity(entityType, note.entityId, user))) {
    return null;
  }

  const canEdit = note.ownerUserId === user.id || user.role === "admin" || user.role === "sales_manager";

  return canEdit ? { ...note, entityType } : null;
}
