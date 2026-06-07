import { db } from "@/db";
import {
  activitiesTable,
  customersTable,
  offersTable,
  opportunitiesTable,
  salesRecordsTable,
  usersTable,
} from "@/db/schema";
import { getActivityState, getVisibleSalesRepIds } from "@/services/dashboard";
import { and, desc, eq, inArray } from "drizzle-orm";

type CrmUser = {
  id: number;
  role: string;
};

export async function getCrmListData(user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  const [customers, rawActivities, opportunities, offers, salesRecords] =
    await Promise.all([
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
        .where(inArray(customersTable.assignedSalesRepId, visibleSalesRepIds))
        .orderBy(customersTable.companyName),
      db
        .select({
          id: activitiesTable.id,
          customerId: activitiesTable.customerId,
          salesRepId: activitiesTable.salesRepId,
          title: activitiesTable.title,
          type: activitiesTable.type,
          startDate: activitiesTable.startDate,
          status: activitiesTable.status,
          outcome: activitiesTable.outcome,
          customerName: customersTable.companyName,
          salesRepName: usersTable.name,
        })
        .from(activitiesTable)
        .innerJoin(customersTable, eq(activitiesTable.customerId, customersTable.id))
        .innerJoin(usersTable, eq(activitiesTable.salesRepId, usersTable.id))
        .where(inArray(activitiesTable.salesRepId, visibleSalesRepIds))
        .orderBy(desc(activitiesTable.startDate)),
      db
        .select({
          id: opportunitiesTable.id,
          customerId: opportunitiesTable.customerId,
          salesRepId: opportunitiesTable.salesRepId,
          title: opportunitiesTable.title,
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
        .where(inArray(opportunitiesTable.salesRepId, visibleSalesRepIds))
        .orderBy(desc(opportunitiesTable.updatedAt)),
      db
        .select({
          id: offersTable.id,
          customerId: offersTable.customerId,
          opportunityId: offersTable.opportunityId,
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
        .orderBy(desc(offersTable.createdAt)),
      db
        .select({
          id: salesRecordsTable.id,
          customerId: salesRecordsTable.customerId,
          opportunityId: salesRecordsTable.opportunityId,
          offerId: salesRecordsTable.offerId,
          amount: salesRecordsTable.amount,
          currency: salesRecordsTable.currency,
          saleDate: salesRecordsTable.saleDate,
          customerName: customersTable.companyName,
          salesRepName: usersTable.name,
        })
        .from(salesRecordsTable)
        .innerJoin(customersTable, eq(salesRecordsTable.customerId, customersTable.id))
        .innerJoin(usersTable, eq(salesRecordsTable.salesRepId, usersTable.id))
        .where(inArray(salesRecordsTable.salesRepId, visibleSalesRepIds))
        .orderBy(desc(salesRecordsTable.saleDate)),
    ]);

  const activities = rawActivities.map((activity) => ({
    ...activity,
    state: getActivityState(activity),
  }));

  return {
    customers,
    activities,
    opportunities,
    offers,
    salesRecords,
  };
}

export async function getAccessibleCustomer(customerId: number, user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  const [customer] = await db
    .select({
      id: customersTable.id,
      assignedSalesRepId: customersTable.assignedSalesRepId,
    })
    .from(customersTable)
    .where(
      and(
        eq(customersTable.id, customerId),
        inArray(customersTable.assignedSalesRepId, visibleSalesRepIds)
      )
    )
    .limit(1);

  return customer ?? null;
}
