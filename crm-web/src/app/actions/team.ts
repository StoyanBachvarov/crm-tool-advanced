"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canAdminUsers } from "@/services/team";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function numberValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? Number(value) : null;
}

export async function updateUserManagement(formData: FormData) {
  const user = await requireUser();

  if (!canAdminUsers(user)) {
    redirect("/team");
  }

  const userId = numberValue(formData, "userId");
  const role = text(formData, "role");

  if (!userId || !role) {
    redirect("/team");
  }

  await db
    .update(usersTable)
    .set({
      role,
      managerId: numberValue(formData, "managerId"),
    })
    .where(eq(usersTable.id, userId));

  revalidatePath("/team");
  revalidatePath(`/team/${userId}`);
  redirect(`/team/${userId}`);
}
