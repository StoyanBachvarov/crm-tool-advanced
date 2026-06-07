"use server";

import { db } from "@/db";
import {
  activitiesTable,
  customersTable,
  offersTable,
  opportunitiesTable,
  salesRecordsTable,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getAccessibleCustomer } from "@/services/crm";
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

function numberValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? Number(value) : null;
}

function dateValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value) : null;
}

export async function createCustomer(formData: FormData) {
  const user = await requireUser();
  const now = new Date();

  const [customer] = await db
    .insert(customersTable)
    .values({
      companyName: requiredText(formData, "companyName"),
      industrySector: text(formData, "industrySector"),
      status: requiredText(formData, "status"),
      mainContactName: text(formData, "mainContactName"),
      contactPosition: text(formData, "contactPosition"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      deliveryAddress: text(formData, "deliveryAddress"),
      administrativeAddress: text(formData, "administrativeAddress"),
      communicationAddress: text(formData, "communicationAddress"),
      notes: text(formData, "notes"),
      assignedSalesRepId: user.id,
      updatedAt: now,
    })
    .returning({ id: customersTable.id });

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect(`/customers/${customer.id}`);
}

export async function createActivity(formData: FormData) {
  const user = await requireUser();
  const customerId = Number(requiredText(formData, "customerId"));
  const customer = await getAccessibleCustomer(customerId, user);

  if (!customer?.assignedSalesRepId) {
    redirect("/activities");
  }

  const [activity] = await db
    .insert(activitiesTable)
    .values({
      customerId,
      salesRepId: customer.assignedSalesRepId,
      type: requiredText(formData, "type"),
      title: requiredText(formData, "title"),
      description: text(formData, "description"),
      startDate: dateValue(formData, "startDate") ?? new Date(),
      endDate: dateValue(formData, "endDate"),
      status: "upcoming",
      nextAction: text(formData, "nextAction"),
    })
    .returning({ id: activitiesTable.id });

  revalidatePath("/activities");
  revalidatePath("/dashboard");
  redirect(`/activities/${activity.id}`);
}

export async function createOpportunity(formData: FormData) {
  const user = await requireUser();
  const customerId = Number(requiredText(formData, "customerId"));
  const customer = await getAccessibleCustomer(customerId, user);

  if (!customer?.assignedSalesRepId) {
    redirect("/opportunities");
  }

  const [opportunity] = await db
    .insert(opportunitiesTable)
    .values({
      customerId,
      salesRepId: customer.assignedSalesRepId,
      title: requiredText(formData, "title"),
      description: text(formData, "description"),
      estimatedValue: text(formData, "estimatedValue"),
      probability: numberValue(formData, "probability"),
      stage: requiredText(formData, "stage"),
      status: requiredText(formData, "status"),
      expectedCloseDate: dateValue(formData, "expectedCloseDate"),
    })
    .returning({ id: opportunitiesTable.id });

  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  redirect(`/opportunities/${opportunity.id}`);
}

export async function createOffer(formData: FormData) {
  const user = await requireUser();
  const customerId = Number(requiredText(formData, "customerId"));
  const customer = await getAccessibleCustomer(customerId, user);

  if (!customer) {
    redirect("/offers");
  }

  const [offer] = await db
    .insert(offersTable)
    .values({
      customerId,
      opportunityId: numberValue(formData, "opportunityId"),
      createdByUserId: user.id,
      offerNumber:
        text(formData, "offerNumber") ?? `OFF-${Date.now().toString().slice(-6)}`,
      title: requiredText(formData, "title"),
      amount: requiredText(formData, "amount"),
      currency: requiredText(formData, "currency"),
      status: requiredText(formData, "status"),
      validUntilDate: dateValue(formData, "validUntilDate"),
      notes: text(formData, "notes"),
    })
    .returning({ id: offersTable.id });

  revalidatePath("/offers");
  revalidatePath("/dashboard");
  redirect(`/offers#offer-${offer.id}`);
}

export async function createSalesRecord(formData: FormData) {
  const user = await requireUser();
  const customerId = Number(requiredText(formData, "customerId"));
  const customer = await getAccessibleCustomer(customerId, user);

  if (!customer?.assignedSalesRepId) {
    redirect("/sales-records");
  }

  const [sale] = await db
    .insert(salesRecordsTable)
    .values({
      customerId,
      opportunityId: numberValue(formData, "opportunityId"),
      offerId: numberValue(formData, "offerId"),
      salesRepId: customer.assignedSalesRepId,
      amount: requiredText(formData, "amount"),
      currency: requiredText(formData, "currency"),
      saleDate: dateValue(formData, "saleDate") ?? new Date(),
      notes: text(formData, "notes"),
    })
    .returning({ id: salesRecordsTable.id });

  revalidatePath("/sales-records");
  revalidatePath("/dashboard");
  redirect(`/sales-records#sale-${sale.id}`);
}
