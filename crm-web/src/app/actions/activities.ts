"use server";

import { db } from "@/db";
import { activitiesTable, customersTable } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canAccessSalesRep } from "@/services/dashboard";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getEditableActivity(activityId: number) {
  const user = await requireUser();
  const [activity] = await db
    .select({
      id: activitiesTable.id,
      customerId: activitiesTable.customerId,
      salesRepId: activitiesTable.salesRepId,
    })
    .from(activitiesTable)
    .where(eq(activitiesTable.id, activityId))
    .limit(1);

  if (!activity) {
    return null;
  }

  const hasAccess = await canAccessSalesRep(user, activity.salesRepId);

  if (!hasAccess) {
    return null;
  }

  return activity;
}

export async function completeActivity(formData: FormData) {
  const activityId = Number(formData.get("activityId"));
  const outcome = String(formData.get("outcome") ?? "").trim();

  if (!Number.isInteger(activityId)) {
    redirect("/dashboard");
  }

  if (!outcome) {
    redirect(`/activities/${activityId}?error=outcome-required`);
  }

  const activity = await getEditableActivity(activityId);

  if (!activity) {
    redirect(`/activities/${activityId}`);
  }

  const now = new Date();

  await db
    .update(activitiesTable)
    .set({
      status: "completed",
      outcome,
      updatedAt: now,
    })
    .where(eq(activitiesTable.id, activity.id));

  await db
    .update(customersTable)
    .set({
      lastActivityDate: now,
      updatedAt: now,
    })
    .where(eq(customersTable.id, activity.customerId));

  revalidatePath("/dashboard");
  revalidatePath(`/activities/${activity.id}`);
  redirect(`/activities/${activity.id}`);
}

export async function cancelActivity(formData: FormData) {
  const activityId = Number(formData.get("activityId"));

  if (!Number.isInteger(activityId)) {
    redirect("/dashboard");
  }

  const activity = await getEditableActivity(activityId);

  if (!activity) {
    redirect(`/activities/${activityId}`);
  }

  await db
    .update(activitiesTable)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(activitiesTable.id, activity.id));

  revalidatePath("/dashboard");
  revalidatePath(`/activities/${activity.id}`);
  redirect(`/activities/${activity.id}`);
}
