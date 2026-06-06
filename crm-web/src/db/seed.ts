import "dotenv/config";
import { db } from './index';
import { usersTable, customersTable, activitiesTable, opportunitiesTable, offersTable, salesRecordsTable, notesTable } from './schema';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding database...");

  // Clean DB (delete in reverse order of foreign keys to avoid conflict)
  await db.delete(notesTable);
  await db.delete(salesRecordsTable);
  await db.delete(offersTable);
  await db.delete(opportunitiesTable);
  await db.delete(activitiesTable);
  await db.delete(customersTable);
  await db.delete(usersTable);

  const hash = await bcrypt.hash("pass123", 10);

  // 1. Users
  const [steve] = await db.insert(usersTable).values({
    email: "steve.manager@example.com",
    name: "Steve Manager",
    passwordHash: hash,
    role: "sales_manager",
  }).returning({ id: usersTable.id });

  const repsToInsert = [
    { email: "peter.rep@example.com", name: "Peter Rep" },
    { email: "dave.rep@example.com", name: "Dave Rep" },
    { email: "john.rep@example.com", name: "John Rep" },
    { email: "nick.rep@example.com", name: "Nick Rep" },
  ];
  for (let i = 1; i <= 9; i++) {
    repsToInsert.push({ email: `user${i}@example.com`, name: `User ${i}` });
  }

  const reps = await db.insert(usersTable).values(
    repsToInsert.map(r => ({
      ...r,
      passwordHash: hash,
      role: "sales_rep",
      managerId: steve.id
    }))
  ).returning({ id: usersTable.id, email: usersTable.email });

  const getRep = (email: string) => reps.find(r => r.email === email)!.id;

  const peterId = getRep("peter.rep@example.com");
  const daveId = getRep("dave.rep@example.com");
  const johnId = getRep("john.rep@example.com");
  const nickId = getRep("nick.rep@example.com");

  // 2. Customers
  const [acme, sofia, green, balkan, digital] = await db.insert(customersTable).values([
    { companyName: "Acme Retail Ltd.", assignedSalesRepId: peterId },
    { companyName: "Sofia Industrial Group", assignedSalesRepId: daveId },
    { companyName: "Green Foods Market", assignedSalesRepId: johnId },
    { companyName: "Balkan Logistics", assignedSalesRepId: nickId },
    { companyName: "Digital Office Solutions", assignedSalesRepId: peterId },
  ]).returning({ id: customersTable.id, name: customersTable.companyName });

  const acmeId = acme.id;
  const sofiaId = sofia.id;
  const greenId = green.id;
  const balkanId = balkan.id;
  const digitalId = digital.id;

  // 3. Activities
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  await db.insert(activitiesTable).values([
    { customerId: acmeId, salesRepId: peterId, type: "Visit", title: "Acme Visit", startDate: new Date(now + 1 * dayMs), status: "upcoming" },
    { customerId: sofiaId, salesRepId: daveId, type: "Phone Call", title: "Sofia Call", startDate: new Date(now + 2 * dayMs), status: "upcoming" },
    { customerId: greenId, salesRepId: johnId, type: "Meeting", title: "Green Foods Meeting", startDate: new Date(now + 3 * dayMs), status: "upcoming" },
    { customerId: balkanId, salesRepId: nickId, type: "Visit", title: "Balkan Initial Visit", startDate: new Date(now - 10 * dayMs), status: "completed", outcome: "Met with logistics head, interested in our solutions." },
    { customerId: digitalId, salesRepId: peterId, type: "Phone Call", title: "Digital Office Intro", startDate: new Date(now - 20 * dayMs), status: "completed", outcome: "Discussed software licenses. Positive feedback." },
  ]);

  // 4. Opportunities
  const opps = await db.insert(opportunitiesTable).values([
    { customerId: acmeId, salesRepId: peterId, title: "Acme Retail Expansion Project", estimatedValue: "15000.00", stage: "Qualified" },
    { customerId: sofiaId, salesRepId: daveId, title: "Sofia Industrial Equipment Renewal", estimatedValue: "42000.00", stage: "Offer Sent" },
    { customerId: greenId, salesRepId: johnId, title: "Green Foods Delivery Optimization", estimatedValue: "9000.00", stage: "New" },
  ]).returning({ id: opportunitiesTable.id, title: opportunitiesTable.title });

  const acmeOppId = opps.find(o => o.title.includes("Acme"))!.id;
  const sofiaOppId = opps.find(o => o.title.includes("Sofia"))!.id;

  // 5. Offers
  await db.insert(offersTable).values([
    { customerId: sofiaId, opportunityId: sofiaOppId, createdByUserId: daveId, offerNumber: "OFF-1001", title: "Offer for Sofia Industrial Equipment Renewal", amount: "42000.00", status: "Sent" },
    { customerId: acmeId, opportunityId: acmeOppId, createdByUserId: peterId, offerNumber: "OFF-1002", title: "Offer for Acme Retail Expansion Project", amount: "15000.00", status: "Draft" },
  ]);

  // 6. Sales Records
  await db.insert(salesRecordsTable).values([
    { customerId: digitalId, salesRepId: peterId, amount: "5200.00", saleDate: new Date(now - 15 * dayMs) },
    { customerId: balkanId, salesRepId: nickId, amount: "11800.00", saleDate: new Date(now - 25 * dayMs) },
  ]);

  // 7. Notes
  await db.insert(notesTable).values([
    { ownerUserId: peterId, entityType: "customer", entityId: acmeId, text: "Acme is planning a big expansion this year." },
    { ownerUserId: daveId, entityType: "customer", entityId: sofiaId, text: "Sofia group requires custom equipment specs." },
    { ownerUserId: johnId, entityType: "customer", entityId: greenId, text: "Green Foods needs better delivery routes." },
    { ownerUserId: nickId, entityType: "customer", entityId: balkanId, text: "Balkan wants a volume discount." },
    { ownerUserId: peterId, entityType: "customer", entityId: digitalId, text: "Digital Office is a fast growing startup." },
  ]);

  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
