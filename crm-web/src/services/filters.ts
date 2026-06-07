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
import { and, count, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";

type FilterUser = {
  id: number;
  role: string;
};

export type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const raw = params[key];
  const first = Array.isArray(raw) ? raw[0] : raw;
  return first?.trim() || null;
}

function numberValue(params: SearchParams, key: string) {
  const raw = value(params, key);
  const parsed = raw ? Number(raw) : null;
  return parsed && Number.isFinite(parsed) ? parsed : null;
}

function dateValue(params: SearchParams, key: string) {
  const raw = value(params, key);
  return raw ? new Date(raw) : null;
}

function pageInput(params: SearchParams) {
  const parsed = Number(value(params, "page") ?? "1");
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  const pageSize = 20;

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

function paging(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function salesRepFilter(params: SearchParams, key = "salesRepId") {
  return numberValue(params, key);
}

export async function listFilteredCustomers(user: FilterUser, params: SearchParams) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const requestedSalesRepId = salesRepFilter(params);
  const selectedSalesRepIds =
    requestedSalesRepId && visibleSalesRepIds.includes(requestedSalesRepId)
      ? [requestedSalesRepId]
      : visibleSalesRepIds;
  const conditions = [inArray(customersTable.assignedSalesRepId, selectedSalesRepIds)];
  const companyName = value(params, "companyName");
  const industrySector = value(params, "industrySector");
  const status = value(params, "status");
  const page = pageInput(params);

  if (companyName) conditions.push(ilike(customersTable.companyName, `%${companyName}%`));
  if (industrySector) conditions.push(ilike(customersTable.industrySector, `%${industrySector}%`));
  if (status) conditions.push(eq(customersTable.status, status));

  const where = and(...conditions);
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
      .limit(page.pageSize)
      .offset(page.offset),
    db.select({ value: count() }).from(customersTable).where(where),
  ]);

  return { rows, paging: paging(page.page, page.pageSize, totals[0]?.value ?? 0) };
}

export async function listFilteredActivities(user: FilterUser, params: SearchParams) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const requestedSalesRepId = salesRepFilter(params);
  const selectedSalesRepIds =
    requestedSalesRepId && visibleSalesRepIds.includes(requestedSalesRepId)
      ? [requestedSalesRepId]
      : visibleSalesRepIds;
  const conditions = [inArray(activitiesTable.salesRepId, selectedSalesRepIds)];
  const fromDate = dateValue(params, "fromDate");
  const toDate = dateValue(params, "toDate");
  const type = value(params, "type");
  const status = value(params, "status");
  const customerId = numberValue(params, "customerId");
  const page = pageInput(params);

  if (fromDate) conditions.push(gte(activitiesTable.startDate, fromDate));
  if (toDate) conditions.push(lte(activitiesTable.startDate, toDate));
  if (type) conditions.push(eq(activitiesTable.type, type));
  if (status) conditions.push(eq(activitiesTable.status, status));
  if (customerId) conditions.push(eq(activitiesTable.customerId, customerId));

  const where = and(...conditions);
  const [rows, totals] = await Promise.all([
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
      .where(where)
      .orderBy(desc(activitiesTable.startDate))
      .limit(page.pageSize)
      .offset(page.offset),
    db.select({ value: count() }).from(activitiesTable).where(where),
  ]);

  return {
    rows: rows.map((row) => ({ ...row, state: getActivityState(row) })),
    paging: paging(page.page, page.pageSize, totals[0]?.value ?? 0),
  };
}

export async function listFilteredOpportunities(user: FilterUser, params: SearchParams) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const requestedSalesRepId = salesRepFilter(params);
  const selectedSalesRepIds =
    requestedSalesRepId && visibleSalesRepIds.includes(requestedSalesRepId)
      ? [requestedSalesRepId]
      : visibleSalesRepIds;
  const conditions = [inArray(opportunitiesTable.salesRepId, selectedSalesRepIds)];
  const stage = value(params, "stage");
  const status = value(params, "status");
  const minValue = numberValue(params, "minValue");
  const maxValue = numberValue(params, "maxValue");
  const expectedCloseFrom = dateValue(params, "expectedCloseFrom");
  const expectedCloseTo = dateValue(params, "expectedCloseTo");
  const page = pageInput(params);

  if (stage) conditions.push(eq(opportunitiesTable.stage, stage));
  if (status) conditions.push(eq(opportunitiesTable.status, status));
  if (minValue) conditions.push(sql`${opportunitiesTable.estimatedValue} >= ${minValue}`);
  if (maxValue) conditions.push(sql`${opportunitiesTable.estimatedValue} <= ${maxValue}`);
  if (expectedCloseFrom) conditions.push(gte(opportunitiesTable.expectedCloseDate, expectedCloseFrom));
  if (expectedCloseTo) conditions.push(lte(opportunitiesTable.expectedCloseDate, expectedCloseTo));

  const where = and(...conditions);
  const [rows, totals] = await Promise.all([
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
      .where(where)
      .orderBy(desc(opportunitiesTable.updatedAt))
      .limit(page.pageSize)
      .offset(page.offset),
    db.select({ value: count() }).from(opportunitiesTable).where(where),
  ]);

  return { rows, paging: paging(page.page, page.pageSize, totals[0]?.value ?? 0) };
}

export async function listFilteredOffers(user: FilterUser, params: SearchParams) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const conditions = [inArray(offersTable.createdByUserId, visibleSalesRepIds)];
  const status = value(params, "status");
  const minAmount = numberValue(params, "minAmount");
  const maxAmount = numberValue(params, "maxAmount");
  const validUntilFrom = dateValue(params, "validUntilFrom");
  const validUntilTo = dateValue(params, "validUntilTo");
  const page = pageInput(params);

  if (status) conditions.push(eq(offersTable.status, status));
  if (minAmount) conditions.push(sql`${offersTable.amount} >= ${minAmount}`);
  if (maxAmount) conditions.push(sql`${offersTable.amount} <= ${maxAmount}`);
  if (validUntilFrom) conditions.push(gte(offersTable.validUntilDate, validUntilFrom));
  if (validUntilTo) conditions.push(lte(offersTable.validUntilDate, validUntilTo));

  const where = and(...conditions);
  const [rows, totals] = await Promise.all([
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
      .where(where)
      .orderBy(desc(offersTable.createdAt))
      .limit(page.pageSize)
      .offset(page.offset),
    db.select({ value: count() }).from(offersTable).where(where),
  ]);

  return { rows, paging: paging(page.page, page.pageSize, totals[0]?.value ?? 0) };
}

export async function listFilteredSalesRecords(user: FilterUser, params: SearchParams) {
  const visibleSalesRepIds = await getVisibleSalesRepIds(user);
  const requestedSalesRepId = salesRepFilter(params);
  const selectedSalesRepIds =
    requestedSalesRepId && visibleSalesRepIds.includes(requestedSalesRepId)
      ? [requestedSalesRepId]
      : visibleSalesRepIds;
  const conditions = [inArray(salesRecordsTable.salesRepId, selectedSalesRepIds)];
  const customerId = numberValue(params, "customerId");
  const fromDate = dateValue(params, "fromDate");
  const toDate = dateValue(params, "toDate");
  const minAmount = numberValue(params, "minAmount");
  const maxAmount = numberValue(params, "maxAmount");
  const page = pageInput(params);

  if (customerId) conditions.push(eq(salesRecordsTable.customerId, customerId));
  if (fromDate) conditions.push(gte(salesRecordsTable.saleDate, fromDate));
  if (toDate) conditions.push(lte(salesRecordsTable.saleDate, toDate));
  if (minAmount) conditions.push(sql`${salesRecordsTable.amount} >= ${minAmount}`);
  if (maxAmount) conditions.push(sql`${salesRecordsTable.amount} <= ${maxAmount}`);

  const where = and(...conditions);
  const [rows, totals] = await Promise.all([
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
      .where(where)
      .orderBy(desc(salesRecordsTable.saleDate))
      .limit(page.pageSize)
      .offset(page.offset),
    db.select({ value: count() }).from(salesRecordsTable).where(where),
  ]);

  return { rows, paging: paging(page.page, page.pageSize, totals[0]?.value ?? 0) };
}
