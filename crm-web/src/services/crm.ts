import { db } from "@/db";
import {
  activitiesTable,
  customersTable,
  notesTable,
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

export async function getManageableSalesReps(user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);

  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(inArray(usersTable.id, visibleSalesRepIds))
    .orderBy(usersTable.name);
}

export async function getCustomerManagementDetail(customerId: number, user: CrmUser) {
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
      assignedSalesRepId: customersTable.assignedSalesRepId,
      notes: customersTable.notes,
      lastActivityDate: customersTable.lastActivityDate,
      createdAt: customersTable.createdAt,
      updatedAt: customersTable.updatedAt,
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

  if (!customer) {
    return null;
  }

  const [activities, opportunities, offers, salesRecords, notes] = await Promise.all([
    db
      .select({
        id: activitiesTable.id,
        title: activitiesTable.title,
        type: activitiesTable.type,
        startDate: activitiesTable.startDate,
        status: activitiesTable.status,
        outcome: activitiesTable.outcome,
      })
      .from(activitiesTable)
      .where(eq(activitiesTable.customerId, customerId))
      .orderBy(desc(activitiesTable.startDate))
      .limit(10),
    db
      .select({
        id: opportunitiesTable.id,
        title: opportunitiesTable.title,
        estimatedValue: opportunitiesTable.estimatedValue,
        probability: opportunitiesTable.probability,
        stage: opportunitiesTable.stage,
        status: opportunitiesTable.status,
      })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.customerId, customerId))
      .orderBy(desc(opportunitiesTable.updatedAt))
      .limit(10),
    db
      .select({
        id: offersTable.id,
        offerNumber: offersTable.offerNumber,
        title: offersTable.title,
        amount: offersTable.amount,
        currency: offersTable.currency,
        status: offersTable.status,
      })
      .from(offersTable)
      .where(eq(offersTable.customerId, customerId))
      .orderBy(desc(offersTable.updatedAt))
      .limit(10),
    db
      .select({
        id: salesRecordsTable.id,
        amount: salesRecordsTable.amount,
        currency: salesRecordsTable.currency,
        saleDate: salesRecordsTable.saleDate,
        notes: salesRecordsTable.notes,
      })
      .from(salesRecordsTable)
      .where(eq(salesRecordsTable.customerId, customerId))
      .orderBy(desc(salesRecordsTable.saleDate))
      .limit(10),
    db
      .select({
        id: notesTable.id,
        text: notesTable.text,
        createdAt: notesTable.createdAt,
        updatedAt: notesTable.updatedAt,
        ownerName: usersTable.name,
      })
      .from(notesTable)
      .innerJoin(usersTable, eq(notesTable.ownerUserId, usersTable.id))
      .where(and(eq(notesTable.entityType, "customer"), eq(notesTable.entityId, customerId)))
      .orderBy(desc(notesTable.createdAt))
      .limit(10),
  ]);

  return {
    customer,
    activities,
    opportunities,
    offers,
    salesRecords,
    notes,
  };
}
