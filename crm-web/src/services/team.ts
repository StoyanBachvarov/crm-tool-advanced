import { db } from "@/db";
import {
  activitiesTable,
  customersTable,
  offersTable,
  opportunitiesTable,
  salesRecordsTable,
  usersTable,
} from "@/db/schema";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

type TeamUser = {
  id: number;
  role: string;
};

export function canManageTeam(user: TeamUser) {
  return user.role === "sales_manager" || user.role === "admin";
}

export function canAdminUsers(user: TeamUser) {
  return user.role === "admin";
}

export async function getTeamSalesRepIds(user: TeamUser) {
  if (user.role === "admin") {
    const users = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.role, ["sales_rep", "sales_manager"]));
    return users.map((row) => row.id);
  }

  if (user.role === "sales_manager") {
    const reps = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.managerId, user.id));
    return reps.map((row) => row.id);
  }

  return [];
}

export async function canAccessTeamMember(user: TeamUser, memberId: number) {
  if (user.role === "admin") {
    return true;
  }

  if (user.role !== "sales_manager") {
    return false;
  }

  const [member] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.id, memberId), eq(usersTable.managerId, user.id)))
    .limit(1);

  return Boolean(member);
}

export async function getManagerOptions() {
  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(inArray(usersTable.role, ["sales_manager", "admin"]))
    .orderBy(usersTable.name);
}

export async function getTeamMembers(user: TeamUser) {
  if (!canManageTeam(user)) {
    return [];
  }

  const memberIds = await getTeamSalesRepIds(user);

  if (memberIds.length === 0) {
    return [];
  }

  const members = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      managerId: usersTable.managerId,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(inArray(usersTable.id, memberIds))
    .orderBy(usersTable.name);

  const [customerCounts, activityCounts, opportunityRows, salesRows] = await Promise.all([
    db
      .select({
        salesRepId: customersTable.assignedSalesRepId,
        total: count(),
      })
      .from(customersTable)
      .where(inArray(customersTable.assignedSalesRepId, memberIds))
      .groupBy(customersTable.assignedSalesRepId),
    db
      .select({
        salesRepId: activitiesTable.salesRepId,
        total: count(),
      })
      .from(activitiesTable)
      .where(inArray(activitiesTable.salesRepId, memberIds))
      .groupBy(activitiesTable.salesRepId),
    db
      .select({
        salesRepId: opportunitiesTable.salesRepId,
        openCount: count(),
        openValue: sql<string>`coalesce(sum(${opportunitiesTable.estimatedValue}), 0)`,
      })
      .from(opportunitiesTable)
      .where(and(inArray(opportunitiesTable.salesRepId, memberIds), eq(opportunitiesTable.status, "open")))
      .groupBy(opportunitiesTable.salesRepId),
    db
      .select({
        salesRepId: salesRecordsTable.salesRepId,
        salesCount: count(),
        salesValue: sql<string>`coalesce(sum(${salesRecordsTable.amount}), 0)`,
      })
      .from(salesRecordsTable)
      .where(inArray(salesRecordsTable.salesRepId, memberIds))
      .groupBy(salesRecordsTable.salesRepId),
  ]);

  return members.map((member) => {
    const customerCount = customerCounts.find((row) => row.salesRepId === member.id)?.total ?? 0;
    const activityCount = activityCounts.find((row) => row.salesRepId === member.id)?.total ?? 0;
    const pipeline = opportunityRows.find((row) => row.salesRepId === member.id);
    const sales = salesRows.find((row) => row.salesRepId === member.id);

    return {
      ...member,
      metrics: {
        customers: customerCount,
        activities: activityCount,
        openOpportunities: pipeline?.openCount ?? 0,
        openPipelineValue: pipeline?.openValue ?? "0",
        salesCount: sales?.salesCount ?? 0,
        salesValue: sales?.salesValue ?? "0",
      },
    };
  });
}

export async function getTeamMemberDetail(memberId: number, user: TeamUser) {
  if (!(await canAccessTeamMember(user, memberId))) {
    return null;
  }

  const [member] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      managerId: usersTable.managerId,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, memberId))
    .limit(1);

  if (!member) {
    return null;
  }

  const [customers, activities, opportunities, offers, sales] = await Promise.all([
    db
      .select({
        id: customersTable.id,
        companyName: customersTable.companyName,
        status: customersTable.status,
        industrySector: customersTable.industrySector,
        lastActivityDate: customersTable.lastActivityDate,
      })
      .from(customersTable)
      .where(eq(customersTable.assignedSalesRepId, memberId))
      .orderBy(customersTable.companyName)
      .limit(10),
    db
      .select({
        id: activitiesTable.id,
        title: activitiesTable.title,
        type: activitiesTable.type,
        status: activitiesTable.status,
        startDate: activitiesTable.startDate,
        customerName: customersTable.companyName,
      })
      .from(activitiesTable)
      .innerJoin(customersTable, eq(activitiesTable.customerId, customersTable.id))
      .where(eq(activitiesTable.salesRepId, memberId))
      .orderBy(desc(activitiesTable.startDate))
      .limit(10),
    db
      .select({
        id: opportunitiesTable.id,
        title: opportunitiesTable.title,
        stage: opportunitiesTable.stage,
        status: opportunitiesTable.status,
        estimatedValue: opportunitiesTable.estimatedValue,
        customerName: customersTable.companyName,
      })
      .from(opportunitiesTable)
      .innerJoin(customersTable, eq(opportunitiesTable.customerId, customersTable.id))
      .where(eq(opportunitiesTable.salesRepId, memberId))
      .orderBy(desc(opportunitiesTable.updatedAt))
      .limit(10),
    db
      .select({
        id: offersTable.id,
        offerNumber: offersTable.offerNumber,
        title: offersTable.title,
        status: offersTable.status,
        amount: offersTable.amount,
        currency: offersTable.currency,
        customerName: customersTable.companyName,
      })
      .from(offersTable)
      .innerJoin(customersTable, eq(offersTable.customerId, customersTable.id))
      .where(eq(offersTable.createdByUserId, memberId))
      .orderBy(desc(offersTable.updatedAt))
      .limit(10),
    db
      .select({
        id: salesRecordsTable.id,
        amount: salesRecordsTable.amount,
        currency: salesRecordsTable.currency,
        saleDate: salesRecordsTable.saleDate,
        customerName: customersTable.companyName,
      })
      .from(salesRecordsTable)
      .innerJoin(customersTable, eq(salesRecordsTable.customerId, customersTable.id))
      .where(eq(salesRecordsTable.salesRepId, memberId))
      .orderBy(desc(salesRecordsTable.saleDate))
      .limit(10),
  ]);

  return {
    member,
    customers,
    activities,
    opportunities,
    offers,
    sales,
  };
}

export async function getTeamMemberCustomers(memberId: number, user: TeamUser) {
  if (!(await canAccessTeamMember(user, memberId))) {
    return null;
  }

  return db
    .select({
      id: customersTable.id,
      companyName: customersTable.companyName,
      industrySector: customersTable.industrySector,
      status: customersTable.status,
      mainContactName: customersTable.mainContactName,
      phone: customersTable.phone,
      email: customersTable.email,
      lastActivityDate: customersTable.lastActivityDate,
    })
    .from(customersTable)
    .where(eq(customersTable.assignedSalesRepId, memberId))
    .orderBy(customersTable.companyName);
}

export async function getTeamMemberActivities(memberId: number, user: TeamUser) {
  if (!(await canAccessTeamMember(user, memberId))) {
    return null;
  }

  return db
    .select({
      id: activitiesTable.id,
      title: activitiesTable.title,
      type: activitiesTable.type,
      status: activitiesTable.status,
      startDate: activitiesTable.startDate,
      customerName: customersTable.companyName,
    })
    .from(activitiesTable)
    .innerJoin(customersTable, eq(activitiesTable.customerId, customersTable.id))
    .where(eq(activitiesTable.salesRepId, memberId))
    .orderBy(desc(activitiesTable.startDate));
}
