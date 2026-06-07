import { db } from "@/db";
import {
  activitiesTable,
  customersTable,
  offersTable,
  opportunitiesTable,
  salesRecordsTable,
  usersTable,
} from "@/db/schema";
import { getVisibleSalesRepIds } from "@/services/dashboard";
import { and, count, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";

type ReportsUser = {
  id: number;
  role: string;
};

export async function getReportsData(user: ReportsUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    salesByMonth,
    salesByRep,
    openPipeline,
    opportunitiesByStage,
    activitiesByType,
    activitiesByRep,
    customersWithoutRecentActivity,
    offersByStatus,
  ] = await Promise.all([
    db
      .select({
        label: sql<string>`to_char(date_trunc('month', ${salesRecordsTable.saleDate}), 'YYYY-MM')`,
        value: sql<string>`coalesce(sum(${salesRecordsTable.amount}), 0)`,
      })
      .from(salesRecordsTable)
      .where(inArray(salesRecordsTable.salesRepId, visibleSalesRepIds))
      .groupBy(sql`date_trunc('month', ${salesRecordsTable.saleDate})`)
      .orderBy(sql`date_trunc('month', ${salesRecordsTable.saleDate})`),
    db
      .select({
        label: usersTable.name,
        value: sql<string>`coalesce(sum(${salesRecordsTable.amount}), 0)`,
      })
      .from(salesRecordsTable)
      .innerJoin(usersTable, eq(salesRecordsTable.salesRepId, usersTable.id))
      .where(inArray(salesRecordsTable.salesRepId, visibleSalesRepIds))
      .groupBy(usersTable.name)
      .orderBy(usersTable.name),
    db
      .select({
        label: sql<string>`'Open pipeline'`,
        value: sql<string>`coalesce(sum(${opportunitiesTable.estimatedValue}), 0)`,
      })
      .from(opportunitiesTable)
      .where(and(inArray(opportunitiesTable.salesRepId, visibleSalesRepIds), eq(opportunitiesTable.status, "open"))),
    db
      .select({
        label: opportunitiesTable.stage,
        value: count(),
      })
      .from(opportunitiesTable)
      .where(inArray(opportunitiesTable.salesRepId, visibleSalesRepIds))
      .groupBy(opportunitiesTable.stage)
      .orderBy(opportunitiesTable.stage),
    db
      .select({
        label: activitiesTable.type,
        value: count(),
      })
      .from(activitiesTable)
      .where(inArray(activitiesTable.salesRepId, visibleSalesRepIds))
      .groupBy(activitiesTable.type)
      .orderBy(activitiesTable.type),
    db
      .select({
        label: usersTable.name,
        value: count(),
      })
      .from(activitiesTable)
      .innerJoin(usersTable, eq(activitiesTable.salesRepId, usersTable.id))
      .where(inArray(activitiesTable.salesRepId, visibleSalesRepIds))
      .groupBy(usersTable.name)
      .orderBy(usersTable.name),
    db
      .select({
        id: customersTable.id,
        companyName: customersTable.companyName,
        lastActivityDate: customersTable.lastActivityDate,
        salesRepName: usersTable.name,
      })
      .from(customersTable)
      .innerJoin(usersTable, eq(customersTable.assignedSalesRepId, usersTable.id))
      .where(
        and(
          inArray(customersTable.assignedSalesRepId, visibleSalesRepIds),
          or(isNull(customersTable.lastActivityDate), lt(customersTable.lastActivityDate, thirtyDaysAgo))
        )
      )
      .orderBy(customersTable.companyName)
      .limit(20),
    db
      .select({
        label: offersTable.status,
        value: count(),
      })
      .from(offersTable)
      .where(inArray(offersTable.createdByUserId, visibleSalesRepIds))
      .groupBy(offersTable.status)
      .orderBy(offersTable.status),
  ]);

  return {
    salesByMonth,
    salesByRep,
    openPipeline,
    opportunitiesByStage,
    activitiesByType,
    activitiesByRep,
    customersWithoutRecentActivity,
    offersByStatus,
  };
}
