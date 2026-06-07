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
import {
  getAccessibleCustomer,
  getAccessibleOffer,
  getAccessibleOpportunity,
} from "@/services/crm";
import { canAccessSalesRep } from "@/services/dashboard";
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
  const requestedSalesRepId = numberValue(formData, "assignedSalesRepId");
  const assignedSalesRepId =
    requestedSalesRepId && (await canAccessSalesRep(user, requestedSalesRepId))
      ? requestedSalesRepId
      : user.id;

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
      assignedSalesRepId,
      updatedAt: now,
    })
    .returning({ id: customersTable.id });

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomer(formData: FormData) {
  const user = await requireUser();
  const customerId = Number(requiredText(formData, "customerId"));
  const customer = await getAccessibleCustomer(customerId, user);

  if (!customer) {
    redirect("/customers");
  }

  const requestedSalesRepId = numberValue(formData, "assignedSalesRepId");
  const assignedSalesRepId =
    requestedSalesRepId && (await canAccessSalesRep(user, requestedSalesRepId))
      ? requestedSalesRepId
      : customer.assignedSalesRepId;

  await db
    .update(customersTable)
    .set({
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
      assignedSalesRepId,
      updatedAt: new Date(),
    })
    .where(eq(customersTable.id, customerId));

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function archiveCustomer(formData: FormData) {
  const user = await requireUser();
  const customerId = Number(requiredText(formData, "customerId"));
  const customer = await getAccessibleCustomer(customerId, user);

  if (!customer) {
    redirect("/customers");
  }

  await db
    .update(customersTable)
    .set({
      status: "inactive customer",
      updatedAt: new Date(),
    })
    .where(eq(customersTable.id, customerId));

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
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

export async function updateOpportunity(formData: FormData) {
  const user = await requireUser();
  const opportunityId = Number(requiredText(formData, "opportunityId"));
  const customerId = Number(requiredText(formData, "customerId"));
  const [opportunity, customer] = await Promise.all([
    getAccessibleOpportunity(opportunityId, user),
    getAccessibleCustomer(customerId, user),
  ]);

  if (!opportunity || !customer?.assignedSalesRepId) {
    redirect("/opportunities");
  }

  await db
    .update(opportunitiesTable)
    .set({
      customerId,
      salesRepId: customer.assignedSalesRepId,
      title: requiredText(formData, "title"),
      description: text(formData, "description"),
      estimatedValue: text(formData, "estimatedValue"),
      probability: numberValue(formData, "probability"),
      stage: requiredText(formData, "stage"),
      status: requiredText(formData, "status"),
      expectedCloseDate: dateValue(formData, "expectedCloseDate"),
      updatedAt: new Date(),
    })
    .where(eq(opportunitiesTable.id, opportunityId));

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  redirect(`/opportunities/${opportunityId}`);
}

export async function closeOpportunityWon(formData: FormData) {
  await closeOpportunity(formData, "won", "Won");
}

export async function closeOpportunityLost(formData: FormData) {
  await closeOpportunity(formData, "lost", "Lost");
}

async function closeOpportunity(formData: FormData, status: string, stage: string) {
  const user = await requireUser();
  const opportunityId = Number(requiredText(formData, "opportunityId"));
  const opportunity = await getAccessibleOpportunity(opportunityId, user);

  if (!opportunity) {
    redirect("/opportunities");
  }

  await db
    .update(opportunitiesTable)
    .set({
      status,
      stage,
      probability: status === "won" ? 100 : 0,
      updatedAt: new Date(),
    })
    .where(eq(opportunitiesTable.id, opportunityId));

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
  redirect(`/opportunities/${opportunityId}`);
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
  redirect(`/offers/${offer.id}`);
}

export async function updateOffer(formData: FormData) {
  const user = await requireUser();
  const offerId = Number(requiredText(formData, "offerId"));
  const customerId = Number(requiredText(formData, "customerId"));
  const [offer, customer] = await Promise.all([
    getAccessibleOffer(offerId, user),
    getAccessibleCustomer(customerId, user),
  ]);

  if (!offer || !customer) {
    redirect("/offers");
  }

  await db
    .update(offersTable)
    .set({
      customerId,
      opportunityId: numberValue(formData, "opportunityId"),
      offerNumber: requiredText(formData, "offerNumber"),
      title: requiredText(formData, "title"),
      amount: requiredText(formData, "amount"),
      currency: requiredText(formData, "currency"),
      status: requiredText(formData, "status"),
      validUntilDate: dateValue(formData, "validUntilDate"),
      notes: text(formData, "notes"),
      updatedAt: new Date(),
    })
    .where(eq(offersTable.id, offerId));

  revalidatePath("/offers");
  revalidatePath(`/offers/${offerId}`);
  revalidatePath("/dashboard");
  redirect(`/offers/${offerId}`);
}

export async function sendOffer(formData: FormData) {
  await updateOfferStatus(formData, "sent");
}

export async function acceptOffer(formData: FormData) {
  await updateOfferStatus(formData, "accepted");
}

export async function rejectOffer(formData: FormData) {
  await updateOfferStatus(formData, "rejected");
}

async function updateOfferStatus(formData: FormData, status: string) {
  const user = await requireUser();
  const offerId = Number(requiredText(formData, "offerId"));
  const offer = await getAccessibleOffer(offerId, user);

  if (!offer) {
    redirect("/offers");
  }

  await db
    .update(offersTable)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(offersTable.id, offerId));

  revalidatePath("/offers");
  revalidatePath(`/offers/${offerId}`);
  revalidatePath("/dashboard");
  redirect(`/offers/${offerId}`);
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

  revalidatePath("/sales");
  revalidatePath("/sales-records");
  revalidatePath("/dashboard");
  redirect(`/sales/${sale.id}`);
}
