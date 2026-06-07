"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { createSession, deleteSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type AuthState = {
  error: string;
};

export async function register(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Missing required fields" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existingUser.length > 0) {
    return { error: "User with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const [newUser] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    role: "sales_rep", // newly registered users become sales reps automatically
  }).returning();

  await createSession(newUser.id, newUser.role);
  
  redirect("/dashboard");
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Missing required fields" };
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (users.length === 0) {
    return { error: "Invalid credentials" };
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  await createSession(user.id, user.role);
  
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
