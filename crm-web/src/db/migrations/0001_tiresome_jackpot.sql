ALTER TABLE "customers" ADD COLUMN "last_activity_date" timestamp;

UPDATE "customers"
SET "last_activity_date" = latest."last_activity_date"
FROM (
	SELECT "customer_id", max("start_date") AS "last_activity_date"
	FROM "activities"
	WHERE "status" = 'completed' OR "outcome" IS NOT NULL
	GROUP BY "customer_id"
) latest
WHERE "customers"."id" = latest."customer_id";
