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

async function getVisibleSalesRepIds(user: DashboardUser) {
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
        phone: customersTable.phone,
        email: customersTable.email,
        salesRepName: usersTable.name,
      })
      .from(customersTable)
      .innerJoin(usersTable, eq(customersTable.assignedSalesRepId, usersTable.id))
      .where(inArray(customersTable.assignedSalesRepId, visibleSalesRepIds))
      .orderBy(customersTable.companyName)
      .limit(8),
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
      .limit(6),
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

  const recentlyCompletedActivities = activities
    .filter((activity) => activity.state === "completed")
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .slice(0, 6);

  const customers = assignedCustomers.map((customer) => {
    const customerOffers = allOffers.filter((offer) => offer.customerId === customer.id);
    const customerOpportunities = allOpportunities.filter(
      (opportunity) => opportunity.customerId === customer.id
    );

    return {
      ...customer,
      indicators: {
        noRecentActivity: !hasRecentActivity(customer.id, activities),
        offerPending: customerOffers.some(
          (offer) =>
            containsStatus(offer.status, "draft") || containsStatus(offer.status, "sent")
        ),
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
    assignedCustomers: customers,
    openOpportunities,
    recentOffers,
    recentSalesRecords,
  };
}

export async function getActivityDetail(activityId: number, user: DashboardUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  const [activity] = await db
    .select({
      id: activitiesTable.id,
      title: activitiesTable.title,
      type: activitiesTable.type,
      description: activitiesTable.description,
      startDate: activitiesTable.startDate,
      endDate: activitiesTable.endDate,
      status: activitiesTable.status,
      outcome: activitiesTable.outcome,
      nextAction: activitiesTable.nextAction,
      customerName: customersTable.companyName,
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

  if (!activity) {
    return null;
  }

  return {
    ...activity,
    state: getActivityState(activity),
  };
}
