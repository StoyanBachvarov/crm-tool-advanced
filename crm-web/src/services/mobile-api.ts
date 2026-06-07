import { db } from "@/db";
import { activitiesTable, customersTable, usersTable } from "@/db/schema";
import { getActivityState, getVisibleSalesRepIds } from "@/services/dashboard";
import { and, count, eq, inArray, not } from "drizzle-orm";

type ApiUser = {
  id: number;
  role: string;
};

type Paging = {
  page: number;
  pageSize: number;
  offset: number;
};

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredString(body: Record<string, unknown>, key: string) {
  const value = optionalString(body[key]);

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

async function getEditableActivity(activityId: number, user: ApiUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [activity] = await db
    .select({
      id: activitiesTable.id,
      customerId: activitiesTable.customerId,
      salesRepId: activitiesTable.salesRepId,
    })
    .from(activitiesTable)
    .where(
      and(
        eq(activitiesTable.id, activityId),
        inArray(activitiesTable.salesRepId, visibleSalesRepIds)
      )
    )
    .limit(1);

  return activity ?? null;
}

export async function listApiCustomers(user: ApiUser, paging: Paging) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const where = inArray(customersTable.assignedSalesRepId, visibleSalesRepIds);

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: customersTable.id,
        companyName: customersTable.companyName,
        industrySector: customersTable.industrySector,
        status: customersTable.status,
        mainContactName: customersTable.mainContactName,
        phone: customersTable.phone,
        email: customersTable.email,
        lastActivityDate: customersTable.lastActivityDate,
        assignedSalesRepId: customersTable.assignedSalesRepId,
        salesRepName: usersTable.name,
      })
      .from(customersTable)
      .innerJoin(usersTable, eq(customersTable.assignedSalesRepId, usersTable.id))
      .where(where)
      .orderBy(customersTable.companyName)
      .limit(paging.pageSize)
      .offset(paging.offset),
    db.select({ value: count() }).from(customersTable).where(where),
  ]);

  return {
    data: rows,
    paging: {
      page: paging.page,
      pageSize: paging.pageSize,
      total: totals[0]?.value ?? 0,
    },
  };
}

export async function getApiCustomerDetail(customerId: number, user: ApiUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [customer] = await db
    .select({
      id: customersTable.id,
      companyName: customersTable.companyName,
      industrySector: customersTable.industrySector,
      status: customersTable.status,
      deliveryAddress: customersTable.deliveryAddress,
      administrativeAddress: customersTable.administrativeAddress,
      communicationAddress: customersTable.communicationAddress,
      mainContactName: customersTable.mainContactName,
      contactPosition: customersTable.contactPosition,
      phone: customersTable.phone,
      email: customersTable.email,
      notes: customersTable.notes,
      assignedSalesRepId: customersTable.assignedSalesRepId,
      salesRepName: usersTable.name,
      lastActivityDate: customersTable.lastActivityDate,
      createdAt: customersTable.createdAt,
      updatedAt: customersTable.updatedAt,
    })
    .from(customersTable)
    .innerJoin(usersTable, eq(customersTable.assignedSalesRepId, usersTable.id))
    .where(
      and(
        eq(customersTable.id, customerId),
        inArray(customersTable.assignedSalesRepId, visibleSalesRepIds)
      )
    )
    .limit(1);

  return customer ?? null;
}

export async function listApiActivities(user: ApiUser, paging: Paging) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const where = and(
    inArray(activitiesTable.salesRepId, visibleSalesRepIds),
    not(inArray(activitiesTable.status, ["completed", "cancelled"]))
  );

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: activitiesTable.id,
        customerId: activitiesTable.customerId,
        salesRepId: activitiesTable.salesRepId,
        title: activitiesTable.title,
        type: activitiesTable.type,
        startDate: activitiesTable.startDate,
        endDate: activitiesTable.endDate,
        status: activitiesTable.status,
        outcome: activitiesTable.outcome,
        nextAction: activitiesTable.nextAction,
        customerName: customersTable.companyName,
        salesRepName: usersTable.name,
      })
      .from(activitiesTable)
      .innerJoin(customersTable, eq(activitiesTable.customerId, customersTable.id))
      .innerJoin(usersTable, eq(activitiesTable.salesRepId, usersTable.id))
      .where(where)
      .orderBy(activitiesTable.startDate)
      .limit(paging.pageSize)
      .offset(paging.offset),
    db.select({ value: count() }).from(activitiesTable).where(where),
  ]);

  return {
    data: rows.map((activity) => ({
      ...activity,
      state: getActivityState(activity),
    })),
    paging: {
      page: paging.page,
      pageSize: paging.pageSize,
      total: totals[0]?.value ?? 0,
    },
  };
}

export async function getApiActivityDetail(activityId: number, user: ApiUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [activity] = await db
    .select({
      id: activitiesTable.id,
      customerId: activitiesTable.customerId,
      salesRepId: activitiesTable.salesRepId,
      title: activitiesTable.title,
      type: activitiesTable.type,
      description: activitiesTable.description,
      startDate: activitiesTable.startDate,
      endDate: activitiesTable.endDate,
      status: activitiesTable.status,
      outcome: activitiesTable.outcome,
      nextAction: activitiesTable.nextAction,
      customerName: customersTable.companyName,
      customerContactName: customersTable.mainContactName,
      customerEmail: customersTable.email,
      customerPhone: customersTable.phone,
      salesRepName: usersTable.name,
    })
    .from(activitiesTable)
    .innerJoin(customersTable, eq(activitiesTable.customerId, customersTable.id))
    .innerJoin(usersTable, eq(activitiesTable.salesRepId, usersTable.id))
    .where(
      and(
        eq(activitiesTable.id, activityId),
        inArray(activitiesTable.salesRepId, visibleSalesRepIds)
      )
    )
    .limit(1);

  return activity
    ? {
        ...activity,
        state: getActivityState(activity),
      }
    : null;
}

export async function createApiActivity(body: Record<string, unknown>, user: ApiUser) {
  const customerId = Number(body.customerId);

  if (!Number.isInteger(customerId)) {
    throw new Error("customerId is required");
  }

  const customer = await getApiCustomerDetail(customerId, user);

  if (!customer?.assignedSalesRepId) {
    return null;
  }

  const startDateValue = body.startDate;
  const endDateValue = body.endDate;
  const [activity] = await db
    .insert(activitiesTable)
    .values({
      customerId,
      salesRepId: customer.assignedSalesRepId,
      type: requiredString(body, "type"),
      title: requiredString(body, "title"),
      description: optionalString(body.description),
      startDate: isValidDate(startDateValue) ? new Date(startDateValue) : new Date(),
      endDate: isValidDate(endDateValue) ? new Date(endDateValue) : null,
      status: optionalString(body.status) ?? "upcoming",
      nextAction: optionalString(body.nextAction),
    })
    .returning({ id: activitiesTable.id });

  return getApiActivityDetail(activity.id, user);
}

export async function completeApiActivity(
  activityId: number,
  body: Record<string, unknown>,
  user: ApiUser
) {
  const outcome = requiredString(body, "outcome");
  const nextAction = optionalString(body.nextAction);
  const activity = await getEditableActivity(activityId, user);

  if (!activity) {
    return null;
  }

  const now = new Date();
  await db
    .update(activitiesTable)
    .set({
      status: "completed",
      outcome,
      nextAction,
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

  return getApiActivityDetail(activity.id, user);
}

export async function cancelApiActivity(activityId: number, user: ApiUser) {
  const activity = await getEditableActivity(activityId, user);

  if (!activity) {
    return null;
  }

  await db
    .update(activitiesTable)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(activitiesTable.id, activity.id));

  return getApiActivityDetail(activity.id, user);
}

export async function createApiFollowUp(
  activityId: number,
  body: Record<string, unknown>,
  user: ApiUser
) {
  const source = await getEditableActivity(activityId, user);

  if (!source) {
    return null;
  }

  const startDateValue = body.startDate;

  if (!isValidDate(startDateValue)) {
    throw new Error("startDate is required");
  }

  const endDateValue = body.endDate;
  const [activity] = await db
    .insert(activitiesTable)
    .values({
      customerId: source.customerId,
      salesRepId: source.salesRepId,
      type: optionalString(body.type) ?? "follow-up task",
      title: requiredString(body, "title"),
      description: optionalString(body.description),
      startDate: new Date(startDateValue),
      endDate: isValidDate(endDateValue) ? new Date(endDateValue) : null,
      status: "upcoming",
      nextAction: optionalString(body.nextAction),
    })
    .returning({ id: activitiesTable.id });

  return getApiActivityDetail(activity.id, user);
}
