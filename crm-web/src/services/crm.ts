import { db } from "@/db";
import {
  activitiesTable,
  customerAssignmentsHistoryTable,
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

export async function getAssignableSalesRepsForCustomer(customerId: number, user: CrmUser) {
  const customer = await getAccessibleCustomer(customerId, user);

  if (!customer) {
    return null;
  }

  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const salesReps = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(inArray(usersTable.id, visibleSalesRepIds))
    .orderBy(usersTable.name);

  const history = await db
    .select({
      id: customerAssignmentsHistoryTable.id,
      previousSalesRepId: customerAssignmentsHistoryTable.previousSalesRepId,
      newSalesRepId: customerAssignmentsHistoryTable.newSalesRepId,
      changedAt: customerAssignmentsHistoryTable.changedAt,
      changedByName: usersTable.name,
    })
    .from(customerAssignmentsHistoryTable)
    .innerJoin(usersTable, eq(customerAssignmentsHistoryTable.changedByUserId, usersTable.id))
    .where(eq(customerAssignmentsHistoryTable.customerId, customerId))
    .orderBy(desc(customerAssignmentsHistoryTable.changedAt))
    .limit(10);

  return {
    customer,
    salesReps,
    history,
  };
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

export async function getAccessibleOpportunity(opportunityId: number, user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [opportunity] = await db
    .select({
      id: opportunitiesTable.id,
      customerId: opportunitiesTable.customerId,
      salesRepId: opportunitiesTable.salesRepId,
    })
    .from(opportunitiesTable)
    .where(
      and(
        eq(opportunitiesTable.id, opportunityId),
        inArray(opportunitiesTable.salesRepId, visibleSalesRepIds)
      )
    )
    .limit(1);

  return opportunity ?? null;
}

export async function getOpportunityManagementDetail(opportunityId: number, user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [opportunity] = await db
    .select({
      id: opportunitiesTable.id,
      customerId: opportunitiesTable.customerId,
      salesRepId: opportunitiesTable.salesRepId,
      title: opportunitiesTable.title,
      description: opportunitiesTable.description,
      estimatedValue: opportunitiesTable.estimatedValue,
      probability: opportunitiesTable.probability,
      stage: opportunitiesTable.stage,
      status: opportunitiesTable.status,
      expectedCloseDate: opportunitiesTable.expectedCloseDate,
      createdAt: opportunitiesTable.createdAt,
      updatedAt: opportunitiesTable.updatedAt,
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

  if (!opportunity) {
    return null;
  }

  const [activities, offers, notes] = await Promise.all([
    db
      .select({
        id: activitiesTable.id,
        title: activitiesTable.title,
        type: activitiesTable.type,
        startDate: activitiesTable.startDate,
        status: activitiesTable.status,
      })
      .from(activitiesTable)
      .where(eq(activitiesTable.customerId, opportunity.customerId))
      .orderBy(desc(activitiesTable.startDate))
      .limit(10),
    db
      .select({
        id: offersTable.id,
        offerNumber: offersTable.offerNumber,
        title: offersTable.title,
        amount: offersTable.amount,
        currency: offersTable.currency,
        status: offersTable.status,
        validUntilDate: offersTable.validUntilDate,
      })
      .from(offersTable)
      .where(eq(offersTable.opportunityId, opportunityId))
      .orderBy(desc(offersTable.updatedAt))
      .limit(10),
    db
      .select({
        id: notesTable.id,
        text: notesTable.text,
        createdAt: notesTable.createdAt,
        ownerName: usersTable.name,
      })
      .from(notesTable)
      .innerJoin(usersTable, eq(notesTable.ownerUserId, usersTable.id))
      .where(and(eq(notesTable.entityType, "opportunity"), eq(notesTable.entityId, opportunityId)))
      .orderBy(desc(notesTable.createdAt))
      .limit(10),
  ]);

  return {
    opportunity,
    activities,
    offers,
    notes,
  };
}

export async function getAccessibleOffer(offerId: number, user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [offer] = await db
    .select({
      id: offersTable.id,
      customerId: offersTable.customerId,
      opportunityId: offersTable.opportunityId,
      createdByUserId: offersTable.createdByUserId,
    })
    .from(offersTable)
    .where(
      and(
        eq(offersTable.id, offerId),
        inArray(offersTable.createdByUserId, visibleSalesRepIds)
      )
    )
    .limit(1);

  return offer ?? null;
}

export async function getOfferManagementDetail(offerId: number, user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [offer] = await db
    .select({
      id: offersTable.id,
      customerId: offersTable.customerId,
      opportunityId: offersTable.opportunityId,
      createdByUserId: offersTable.createdByUserId,
      offerNumber: offersTable.offerNumber,
      title: offersTable.title,
      amount: offersTable.amount,
      currency: offersTable.currency,
      status: offersTable.status,
      validUntilDate: offersTable.validUntilDate,
      notes: offersTable.notes,
      createdAt: offersTable.createdAt,
      updatedAt: offersTable.updatedAt,
      customerName: customersTable.companyName,
      opportunityTitle: opportunitiesTable.title,
      createdByName: usersTable.name,
    })
    .from(offersTable)
    .innerJoin(customersTable, eq(offersTable.customerId, customersTable.id))
    .innerJoin(usersTable, eq(offersTable.createdByUserId, usersTable.id))
    .leftJoin(opportunitiesTable, eq(offersTable.opportunityId, opportunitiesTable.id))
    .where(
      and(
        eq(offersTable.id, offerId),
        inArray(offersTable.createdByUserId, visibleSalesRepIds)
      )
    )
    .limit(1);

  if (!offer) {
    return null;
  }

  const [noteRows, saleRows] = await Promise.all([
    db
      .select({
        id: notesTable.id,
        text: notesTable.text,
        createdAt: notesTable.createdAt,
        ownerName: usersTable.name,
      })
      .from(notesTable)
      .innerJoin(usersTable, eq(notesTable.ownerUserId, usersTable.id))
      .where(and(eq(notesTable.entityType, "offer"), eq(notesTable.entityId, offerId)))
      .orderBy(desc(notesTable.createdAt))
      .limit(10),
    db
      .select({
        id: salesRecordsTable.id,
        amount: salesRecordsTable.amount,
        currency: salesRecordsTable.currency,
        saleDate: salesRecordsTable.saleDate,
      })
      .from(salesRecordsTable)
      .where(eq(salesRecordsTable.offerId, offerId))
      .orderBy(desc(salesRecordsTable.saleDate))
      .limit(5),
  ]);

  return {
    offer,
    notes: noteRows,
    salesRecords: saleRows,
  };
}

export async function getSalesRecordDetail(saleId: number, user: CrmUser) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const [sale] = await db
    .select({
      id: salesRecordsTable.id,
      customerId: salesRecordsTable.customerId,
      opportunityId: salesRecordsTable.opportunityId,
      offerId: salesRecordsTable.offerId,
      salesRepId: salesRecordsTable.salesRepId,
      amount: salesRecordsTable.amount,
      currency: salesRecordsTable.currency,
      saleDate: salesRecordsTable.saleDate,
      notes: salesRecordsTable.notes,
      createdAt: salesRecordsTable.createdAt,
      customerName: customersTable.companyName,
      opportunityTitle: opportunitiesTable.title,
      offerNumber: offersTable.offerNumber,
      offerTitle: offersTable.title,
      salesRepName: usersTable.name,
    })
    .from(salesRecordsTable)
    .innerJoin(customersTable, eq(salesRecordsTable.customerId, customersTable.id))
    .innerJoin(usersTable, eq(salesRecordsTable.salesRepId, usersTable.id))
    .leftJoin(opportunitiesTable, eq(salesRecordsTable.opportunityId, opportunitiesTable.id))
    .leftJoin(offersTable, eq(salesRecordsTable.offerId, offersTable.id))
    .where(
      and(
        eq(salesRecordsTable.id, saleId),
        inArray(salesRecordsTable.salesRepId, visibleSalesRepIds)
      )
    )
    .limit(1);

  if (!sale) {
    return null;
  }

  const notes = await db
    .select({
      id: notesTable.id,
      text: notesTable.text,
      createdAt: notesTable.createdAt,
      ownerName: usersTable.name,
    })
    .from(notesTable)
    .innerJoin(usersTable, eq(notesTable.ownerUserId, usersTable.id))
    .where(and(eq(notesTable.entityType, "sales_record"), eq(notesTable.entityId, saleId)))
    .orderBy(desc(notesTable.createdAt))
    .limit(10);

  return {
    sale,
    notes,
  };
}
