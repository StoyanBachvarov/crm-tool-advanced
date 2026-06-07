import { db } from "@/db";
import {
  activitiesTable,
  customersTable,
  offersTable,
  opportunitiesTable,
  salesRecordsTable,
  usersTable,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export type ActivityState = "upcoming" | "current" | "completed" | "cancelled";

type DashboardUser = {
  id: number;
  role: string;
};

export function getActivityState(activity: {
  startDate: Date;
  status: string;
  outcome: string | null;
}): ActivityState {
  const status = activity.status.toLowerCase();

  if (status === "cancelled") {
    return "cancelled";
  }

  if (status === "completed" || activity.outcome) {
    return "completed";
  }

  return activity.startDate.getTime() > Date.now() ? "upcoming" : "current";
}

export async function getVisibleSalesRepIds(user: DashboardUser) {
  if (user.role === "admin") {
    const users = await db.select({ id: usersTable.id }).from(usersTable);
    return users.map((visibleUser) => visibleUser.id);
  }

  if (user.role === "sales_manager") {
    const reps = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.managerId, user.id));

    return [user.id, ...reps.map((rep) => rep.id)];
  }

  return [user.id];
}

function containsStatus(value: string | null, expected: string) {
  return value?.toLowerCase() === expected;
}

function isPendingOffer(status: string | null) {
  const value = status?.toLowerCase();
  return value === "draft" || value === "sent";
}

function hasRecentActivity(
  customerId: number,
  activities: Array<{ customerId: number; startDate: Date; state: ActivityState }>
) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return activities.some(
    (activity) =>
      activity.customerId === customerId &&
      activity.state === "completed" &&
      activity.startDate.getTime() >= thirtyDaysAgo
  );
}

function getLatestCompletedActivityDate(
  customerId: number,
  activities: Array<{ customerId: number; startDate: Date; state: ActivityState }>
) {
  const completedDates = activities
    .filter(
      (activity) =>
        activity.customerId === customerId && activity.state === "completed"
    )
    .map((activity) => activity.startDate);

  if (completedDates.length === 0) {
    return null;
  }

  return completedDates.sort((a, b) => b.getTime() - a.getTime())[0];
}

export async function canAccessSalesRep(user: DashboardUser, salesRepId: number) {
  if (user.role === "admin" || user.id === salesRepId) {
    return true;
  }

  if (user.role !== "sales_manager") {
    return false;
  }

  const [rep] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.id, salesRepId), eq(usersTable.managerId, user.id)))
    .limit(1);

  return Boolean(rep);
}

export async function getDashboardData(user: DashboardUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  const [
    rawActivities,
    assignedCustomers,
    openOpportunities,
    recentOffers,
    recentSalesRecords,
    allOffers,
    allOpportunities,
  ] = await Promise.all([
    db
      .select({
        id: activitiesTable.id,
        customerId: activitiesTable.customerId,
        title: activitiesTable.title,
        type: activitiesTable.type,
        description: activitiesTable.description,
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
      .where(inArray(activitiesTable.salesRepId, visibleSalesRepIds))
      .orderBy(activitiesTable.startDate),
    db
      .select({
        id: customersTable.id,
        companyName: customersTable.companyName,
        industrySector: customersTable.industrySector,
        status: customersTable.status,
        mainContactName: customersTable.mainContactName,
        lastActivityDate: customersTable.lastActivityDate,
        salesRepName: usersTable.name,
      })
      .from(customersTable)
      .innerJoin(usersTable, eq(customersTable.assignedSalesRepId, usersTable.id))
      .where(inArray(customersTable.assignedSalesRepId, visibleSalesRepIds))
      .orderBy(customersTable.companyName)
      .limit(10),
    db
      .select({
        id: opportunitiesTable.id,
        customerId: opportunitiesTable.customerId,
        title: opportunitiesTable.title,
        estimatedValue: opportunitiesTable.estimatedValue,
        probability: opportunitiesTable.probability,
        stage: opportunitiesTable.stage,
        status: opportunitiesTable.status,
        expectedCloseDate: opportunitiesTable.expectedCloseDate,
        customerName: customersTable.companyName,
      })
      .from(opportunitiesTable)
      .innerJoin(customersTable, eq(opportunitiesTable.customerId, customersTable.id))
      .where(
        and(
          inArray(opportunitiesTable.salesRepId, visibleSalesRepIds),
          eq(opportunitiesTable.status, "open")
        )
      )
      .orderBy(desc(opportunitiesTable.updatedAt))
      .limit(8),
    db
      .select({
        id: offersTable.id,
        customerId: offersTable.customerId,
        offerNumber: offersTable.offerNumber,
        title: offersTable.title,
        amount: offersTable.amount,
        currency: offersTable.currency,
        status: offersTable.status,
        validUntilDate: offersTable.validUntilDate,
        customerName: customersTable.companyName,
      })
      .from(offersTable)
      .innerJoin(customersTable, eq(offersTable.customerId, customersTable.id))
      .where(inArray(offersTable.createdByUserId, visibleSalesRepIds))
      .orderBy(desc(offersTable.createdAt))
      .limit(6),
    db
      .select({
        id: salesRecordsTable.id,
        customerId: salesRecordsTable.customerId,
        amount: salesRecordsTable.amount,
        currency: salesRecordsTable.currency,
        saleDate: salesRecordsTable.saleDate,
        customerName: customersTable.companyName,
      })
      .from(salesRecordsTable)
      .innerJoin(customersTable, eq(salesRecordsTable.customerId, customersTable.id))
      .where(inArray(salesRecordsTable.salesRepId, visibleSalesRepIds))
      .orderBy(desc(salesRecordsTable.saleDate))
      .limit(6),
    db
      .select({
        customerId: offersTable.customerId,
        status: offersTable.status,
      })
      .from(offersTable)
      .where(inArray(offersTable.createdByUserId, visibleSalesRepIds)),
    db
      .select({
        customerId: opportunitiesTable.customerId,
        status: opportunitiesTable.status,
        stage: opportunitiesTable.stage,
      })
      .from(opportunitiesTable)
      .where(inArray(opportunitiesTable.salesRepId, visibleSalesRepIds)),
  ]);

  const activities = rawActivities.map((activity) => ({
    ...activity,
    state: getActivityState(activity),
  }));

  const activeActivities = activities
    .filter((activity) => activity.state === "upcoming" || activity.state === "current")
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const archiveActivities = activities
    .filter((activity) => activity.state === "completed" || activity.state === "cancelled")
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const recentlyCompletedActivities = archiveActivities
    .filter((activity) => activity.state === "completed")
    .slice(0, 6);

  const customers = assignedCustomers.map((customer) => {
    const customerOffers = allOffers.filter((offer) => offer.customerId === customer.id);
    const customerOpportunities = allOpportunities.filter(
      (opportunity) => opportunity.customerId === customer.id
    );

    return {
      ...customer,
      lastActivityDate:
        customer.lastActivityDate ??
        getLatestCompletedActivityDate(customer.id, activities),
      indicators: {
        noRecentActivity: !hasRecentActivity(customer.id, activities),
        offerPending: customerOffers.some((offer) => isPendingOffer(offer.status)),
        opportunityWon: customerOpportunities.some(
          (opportunity) =>
            containsStatus(opportunity.status, "won") ||
            containsStatus(opportunity.stage, "won")
        ),
        opportunityLost: customerOpportunities.some(
          (opportunity) =>
            containsStatus(opportunity.status, "lost") ||
            containsStatus(opportunity.stage, "lost")
        ),
      },
    };
  });

  return {
    activeActivities,
    upcomingActivities: activeActivities.filter((activity) => activity.state === "upcoming"),
    currentActivities: activeActivities.filter((activity) => activity.state === "current"),
    recentlyCompletedActivities,
    archiveActivities,
    assignedCustomers: customers,
    openOpportunities,
    recentOffers,
    recentSalesRecords,
  };
}

export async function getActivityDetail(activityId: number, user: DashboardUser) {
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
      salesRepManagerId: usersTable.managerId,
    })
    .from(activitiesTable)
    .innerJoin(customersTable, eq(activitiesTable.customerId, customersTable.id))
    .innerJoin(usersTable, eq(activitiesTable.salesRepId, usersTable.id))
    .where(eq(activitiesTable.id, activityId))
    .limit(1);

  if (!activity) {
    return { status: "not_found" as const, activity: null };
  }

  const hasAccess =
    user.role === "admin" ||
    user.id === activity.salesRepId ||
    user.id === activity.salesRepManagerId;

  if (!hasAccess) {
    return { status: "access_denied" as const, activity: null };
  }

  const [relatedOpportunity] = await db
    .select({
      id: opportunitiesTable.id,
      title: opportunitiesTable.title,
      stage: opportunitiesTable.stage,
      status: opportunitiesTable.status,
    })
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.customerId, activity.customerId))
    .orderBy(desc(opportunitiesTable.updatedAt))
    .limit(1);

  const [relatedOffer] = await db
    .select({
      id: offersTable.id,
      offerNumber: offersTable.offerNumber,
      title: offersTable.title,
      status: offersTable.status,
    })
    .from(offersTable)
    .where(eq(offersTable.customerId, activity.customerId))
    .orderBy(desc(offersTable.updatedAt))
    .limit(1);

  return {
    status: "ok" as const,
    activity: {
      ...activity,
      state: getActivityState(activity),
      relatedOpportunity: relatedOpportunity ?? null,
      relatedOffer: relatedOffer ?? null,
    },
  };
}

export async function getCustomerDetail(customerId: number, user: DashboardUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  const [customer] = await db
    .select({
      id: customersTable.id,
      companyName: customersTable.companyName,
      industrySector: customersTable.industrySector,
      status: customersTable.status,
      mainContactName: customersTable.mainContactName,
      contactPosition: customersTable.contactPosition,
      phone: customersTable.phone,
      email: customersTable.email,
      deliveryAddress: customersTable.deliveryAddress,
      administrativeAddress: customersTable.administrativeAddress,
      communicationAddress: customersTable.communicationAddress,
      notes: customersTable.notes,
      lastActivityDate: customersTable.lastActivityDate,
      salesRepName: usersTable.name,
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

export async function getOpportunityDetail(opportunityId: number, user: DashboardUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  const [opportunity] = await db
    .select({
      id: opportunitiesTable.id,
      title: opportunitiesTable.title,
      description: opportunitiesTable.description,
      estimatedValue: opportunitiesTable.estimatedValue,
      probability: opportunitiesTable.probability,
      stage: opportunitiesTable.stage,
      status: opportunitiesTable.status,
      expectedCloseDate: opportunitiesTable.expectedCloseDate,
      customerName: customersTable.companyName,
      salesRepName: usersTable.name,
    })
    .from(opportunitiesTable)
    .innerJoin(customersTable, eq(opportunitiesTable.customerId, customersTable.id))
    .innerJoin(usersTable, eq(opportunitiesTable.salesRepId, usersTable.id))
    .where(
      and(
        eq(opportunitiesTable.id, opportunityId),
        inArray(opportunitiesTable.salesRepId, visibleSalesRepIds)
      )
    )
    .limit(1);

  return opportunity ?? null;
}
