CREATE TABLE "customer_assignments_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"previous_sales_rep_id" integer,
	"new_sales_rep_id" integer NOT NULL,
	"changed_by_user_id" integer NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_assignments_history" ADD CONSTRAINT "customer_assignments_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_assignments_history" ADD CONSTRAINT "customer_assignments_history_previous_sales_rep_id_users_id_fk" FOREIGN KEY ("previous_sales_rep_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_assignments_history" ADD CONSTRAINT "customer_assignments_history_new_sales_rep_id_users_id_fk" FOREIGN KEY ("new_sales_rep_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_assignments_history" ADD CONSTRAINT "customer_assignments_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;