import { pgTable, serial, varchar, timestamp, integer, decimal, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  photoUrl: varchar("photo_url", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("sales_rep"),
  managerId: integer("manager_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  industrySector: varchar("industry_sector", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("lead"),
  deliveryAddress: text("delivery_address"),
  administrativeAddress: text("administrative_address"),
  communicationAddress: text("communication_address"),
  mainContactName: varchar("main_contact_name", { length: 255 }),
  contactPosition: varchar("contact_position", { length: 255 }),
  phone: varchar("phone", { length: 255 }),
  email: varchar("email", { length: 255 }),
  assignedSalesRepId: integer("assigned_sales_rep_id").references(() => usersTable.id),
  notes: text("notes"),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activitiesTable = pgTable("activities", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  salesRepId: integer("sales_rep_id").notNull().references(() => usersTable.id),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 50 }).notNull().default("upcoming"),
  outcome: text("outcome"),
  nextAction: text("next_action"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const opportunitiesTable = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  salesRepId: integer("sales_rep_id").notNull().references(() => usersTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  probability: integer("probability"),
  stage: varchar("stage", { length: 100 }).notNull().default("new"),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  expectedCloseDate: timestamp("expected_close_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  opportunityId: integer("opportunity_id").references(() => opportunitiesTable.id),
  createdByUserId: integer("created_by_user_id").notNull().references(() => usersTable.id),
  offerNumber: varchar("offer_number", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  validUntilDate: timestamp("valid_until_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salesRecordsTable = pgTable("sales_records", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  opportunityId: integer("opportunity_id").references(() => opportunitiesTable.id),
  offerId: integer("offer_id").references(() => offersTable.id),
  salesRepId: integer("sales_rep_id").notNull().references(() => usersTable.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  saleDate: timestamp("sale_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("owner_user_id").notNull().references(() => usersTable.id),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerAssignmentsHistoryTable = pgTable("customer_assignments_history", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  previousSalesRepId: integer("previous_sales_rep_id").references(() => usersTable.id),
  newSalesRepId: integer("new_sales_rep_id").notNull().references(() => usersTable.id),
  changedByUserId: integer("changed_by_user_id").notNull().references(() => usersTable.id),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});
