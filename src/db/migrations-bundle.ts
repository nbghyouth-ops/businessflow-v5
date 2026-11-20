// Dihasilkan otomatis oleh scripts/bundle-sql.mjs (npm run db:bundle). JANGAN diedit manual.
export type BundledMigration = { id: string; checksum: string; sql: string };
export const BUNDLED_MIGRATIONS: BundledMigration[] = [
  { id: '0000_baseline', checksum: '167f277175fde37ec43c9200cc60daa91c4a96e551f323e8069c792615a20622', sql: `CREATE TABLE IF NOT EXISTS "accounting_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"location" text,
	"assigned_to" text,
	"purchase_date" date,
	"cost" numeric(18, 2) DEFAULT '0' NOT NULL,
	"useful_life_months" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"check_in" text,
	"check_out" text,
	"status" text DEFAULT 'hadir' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"device_id" uuid,
	"operator" text,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"client_id" uuid,
	"customer_name" text NOT NULL,
	"service" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"device_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_range" CHECK ("bookings"."ends_at" > "bookings"."starts_at")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"address" text,
	"is_main" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"month" text NOT NULL,
	"amount" numeric(18, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"trade_name" text,
	"slogan" text,
	"description" text,
	"template_key" text DEFAULT 'other' NOT NULL,
	"business_model" text,
	"industry" text,
	"status" text DEFAULT 'active' NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"language" text DEFAULT 'id' NOT NULL,
	"date_format" text DEFAULT 'DD/MM/YYYY' NOT NULL,
	"country" text,
	"province" text,
	"city" text,
	"address" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"channel" text,
	"budget" numeric(18, 2) DEFAULT '0' NOT NULL,
	"start_date" date,
	"end_date" date,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"result_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cash_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"coa_account_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cash_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"opening_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"expected_amount" numeric(18, 2),
	"counted_amount" numeric(18, 2),
	"variance" numeric(18, 2),
	"status" text DEFAULT 'open' NOT NULL,
	"note" text,
	"opened_by" uuid,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"summary" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"device_id" uuid,
	"operator" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"phone" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"code" text NOT NULL,
	"type" text DEFAULT 'individual' NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"phone" text,
	"email" text,
	"address" text,
	"industry" text,
	"status" text DEFAULT 'active' NOT NULL,
	"source" text,
	"notes" text,
	"merged_into_id" uuid,
	"last_activity_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coa_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"subtype" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "device_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"name" text DEFAULT 'Perangkat' NOT NULL,
	"operator_name" text,
	"pin_hash" text,
	"pin_length" integer,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone,
	CONSTRAINT "devices_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "doc_counters" (
	"workspace_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "doc_counters_workspace_id_key_pk" PRIMARY KEY("workspace_id","key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"position" text,
	"department" text,
	"phone" text,
	"email" text,
	"hire_date" date,
	"salary" numeric(18, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "finance_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"coa_account_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "finance_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid,
	"number" text NOT NULL,
	"type" text NOT NULL,
	"state" text DEFAULT 'draft' NOT NULL,
	"amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"category_id" uuid,
	"account_id" uuid NOT NULL,
	"to_account_id" uuid,
	"tx_date" date NOT NULL,
	"tx_time" text,
	"note" text,
	"reference" text,
	"client_id" uuid,
	"supplier_name" text,
	"project_id" uuid,
	"journal_id" uuid,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"device_id" uuid,
	"operator" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ft_amount_pos" CHECK ("finance_transactions"."amount" > 0),
	CONSTRAINT "ft_transfer_diff" CHECK ("finance_transactions"."type" <> 'transfer' OR "finance_transactions"."to_account_id" IS NOT NULL AND "finance_transactions"."to_account_id" <> "finance_transactions"."account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"key" text NOT NULL,
	"response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(18, 3) DEFAULT '0' NOT NULL,
	"unit_price" numeric(18, 2) DEFAULT '0' NOT NULL,
	"unit_cost" numeric(18, 2) DEFAULT '0' NOT NULL,
	"line_total" numeric(18, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid,
	"number" text NOT NULL,
	"client_id" uuid,
	"channel" text DEFAULT 'pos' NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"subtotal" numeric(18, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"tax" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total" numeric(18, 2) DEFAULT '0' NOT NULL,
	"paid" numeric(18, 2) DEFAULT '0' NOT NULL,
	"cogs" numeric(18, 2) DEFAULT '0' NOT NULL,
	"journal_id" uuid,
	"due_date" date,
	"note" text,
	"device_id" uuid,
	"operator" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inv_paid_range" CHECK ("invoices"."paid" >= 0 AND "invoices"."paid" <= "invoices"."total")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"payload_version" integer DEFAULT 1 NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"lease_owner" text,
	"lease_expires_at" timestamp with time zone,
	"next_run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checkpoint" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid,
	"number" text NOT NULL,
	"entry_date" date NOT NULL,
	"memo" text,
	"source" text NOT NULL,
	"source_id" uuid,
	"status" text DEFAULT 'posted' NOT NULL,
	"reverses_id" uuid,
	"reversed_by_id" uuid,
	"device_id" uuid,
	"operator" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"debit" numeric(18, 2) DEFAULT '0' NOT NULL,
	"credit" numeric(18, 2) DEFAULT '0' NOT NULL,
	"memo" text,
	CONSTRAINT "jl_amounts" CHECK ("journal_lines"."debit" >= 0 AND "journal_lines"."credit" >= 0 AND NOT ("journal_lines"."debit" > 0 AND "journal_lines"."credit" > 0))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legal_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"device_id" uuid,
	"document_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legal_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"version" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"effective_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"step" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_drafts_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ops_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"detail" text,
	"status" text DEFAULT 'open' NOT NULL,
	"device_id" uuid,
	"operator" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pairing_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_hash" text NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_by_device_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"used_by_device_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pairing_codes_code_hash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"invoice_id" uuid,
	"bill_id" uuid,
	"account_id" uuid NOT NULL,
	"amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"reference" text,
	"journal_id" uuid,
	"reversed" boolean DEFAULT false NOT NULL,
	"device_id" uuid,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pay_pos" CHECK ("payments"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"barcode" text,
	"name" text NOT NULL,
	"kind" text DEFAULT 'product' NOT NULL,
	"category" text,
	"unit" text DEFAULT 'pcs' NOT NULL,
	"price" numeric(18, 2) DEFAULT '0' NOT NULL,
	"avg_cost" numeric(18, 2) DEFAULT '0' NOT NULL,
	"track_stock" boolean DEFAULT true NOT NULL,
	"reorder_level" numeric(18, 3) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_price" CHECK ("products"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"client_id" uuid,
	"status" text DEFAULT 'planning' NOT NULL,
	"start_date" date,
	"end_date" date,
	"budget" numeric(18, 2) DEFAULT '0' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"po_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18, 3) DEFAULT '0' NOT NULL,
	"received_qty" numeric(18, 3) DEFAULT '0' NOT NULL,
	"unit_cost" numeric(18, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "pol_received" CHECK ("purchase_order_lines"."received_qty" <= "purchase_order_lines"."quantity")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"number" text NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" text DEFAULT 'ordered' NOT NULL,
	"total" numeric(18, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"unit_cost" numeric(18, 2) DEFAULT '0' NOT NULL,
	"kind" text NOT NULL,
	"ref_type" text,
	"ref_id" uuid,
	"note" text,
	"device_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"number" text NOT NULL,
	"supplier_id" uuid NOT NULL,
	"po_id" uuid,
	"total" numeric(18, 2) DEFAULT '0' NOT NULL,
	"paid" numeric(18, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"journal_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bill_paid" CHECK ("supplier_bills"."paid" >= 0 AND "supplier_bills"."paid" <= "supplier_bills"."total")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tab_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"device_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tab_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"due_date" date,
	"assignee" text,
	"project_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"branch_id" uuid,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "assets" ADD CONSTRAINT "assets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "assets" ADD CONSTRAINT "assets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "booking_resources" ADD CONSTRAINT "booking_resources_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "booking_resources" ADD CONSTRAINT "booking_resources_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_resource_id_booking_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."booking_resources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "branches" ADD CONSTRAINT "branches_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "branches" ADD CONSTRAINT "branches_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "budgets" ADD CONSTRAINT "budgets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "budgets" ADD CONSTRAINT "budgets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_finance_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."finance_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_coa_account_id_coa_accounts_id_fk" FOREIGN KEY ("coa_account_id") REFERENCES "public"."coa_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_account_id_cash_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "clients" ADD CONSTRAINT "clients_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "coa_accounts" ADD CONSTRAINT "coa_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "coa_accounts" ADD CONSTRAINT "coa_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "device_grants" ADD CONSTRAINT "device_grants_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "device_grants" ADD CONSTRAINT "device_grants_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "device_grants" ADD CONSTRAINT "device_grants_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "device_grants" ADD CONSTRAINT "device_grants_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "doc_counters" ADD CONSTRAINT "doc_counters_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "employees" ADD CONSTRAINT "employees_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "employees" ADD CONSTRAINT "employees_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_categories" ADD CONSTRAINT "finance_categories_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_categories" ADD CONSTRAINT "finance_categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_categories" ADD CONSTRAINT "finance_categories_coa_account_id_coa_accounts_id_fk" FOREIGN KEY ("coa_account_id") REFERENCES "public"."coa_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_category_id_finance_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."finance_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_account_id_cash_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_to_account_id_cash_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_entry_id_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_coa_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."coa_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_document_id_legal_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."legal_documents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "onboarding_drafts" ADD CONSTRAINT "onboarding_drafts_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "ops_logs" ADD CONSTRAINT "ops_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "ops_logs" ADD CONSTRAINT "ops_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "pairing_codes" ADD CONSTRAINT "pairing_codes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "pairing_codes" ADD CONSTRAINT "pairing_codes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "pairing_codes" ADD CONSTRAINT "pairing_codes_created_by_device_id_devices_id_fk" FOREIGN KEY ("created_by_device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "pairing_codes" ADD CONSTRAINT "pairing_codes_used_by_device_id_devices_id_fk" FOREIGN KEY ("used_by_device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_account_id_cash_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "projects" ADD CONSTRAINT "projects_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "supplier_bills" ADD CONSTRAINT "supplier_bills_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "supplier_bills" ADD CONSTRAINT "supplier_bills_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "supplier_bills" ADD CONSTRAINT "supplier_bills_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "supplier_bills" ADD CONSTRAINT "supplier_bills_po_id_purchase_orders_id_fk" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "tab_sessions" ADD CONSTRAINT "tab_sessions_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "periods_ws" ON "accounting_periods" USING btree ("workspace_id","start_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_ws_created" ON "audit_events" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_res" ON "bookings" USING btree ("resource_id","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "budget_cat_month" ON "budgets" USING btree ("workspace_id","category_id","month");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cash_one_open" ON "cash_sessions" USING btree ("workspace_id","account_id") WHERE "cash_sessions"."status" = 'open';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ca_client" ON "client_activities" USING btree ("client_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "clients_ws_code" ON "clients" USING btree ("workspace_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coa_ws_code" ON "coa_accounts" USING btree ("workspace_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "device_grants_device_ws" ON "device_grants" USING btree ("device_id","workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ft_ws_number" ON "finance_transactions" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ft_ws_date" ON "finance_transactions" USING btree ("workspace_id","tx_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idem_ws_key" ON "idempotency_keys" USING btree ("workspace_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "inv_ws_number" ON "invoices" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inv_ws_issued" ON "invoices" USING btree ("workspace_id","issued_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "jobs_idem" ON "jobs" USING btree ("workspace_id","idempotency_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_due" ON "jobs" USING btree ("status","next_run_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "je_ws_number" ON "journal_entries" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "je_ws_date" ON "journal_entries" USING btree ("workspace_id","entry_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jl_entry" ON "journal_lines" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jl_account" ON "journal_lines" USING btree ("workspace_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "legal_documents_kind_version" ON "legal_documents" USING btree ("kind","version");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_ws_sku" ON "products" USING btree ("workspace_id","sku");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "po_ws_number" ON "purchase_orders" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sm_product" ON "stock_movements" USING btree ("workspace_id","product_id","warehouse_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bill_ws_number" ON "supplier_bills" USING btree ("workspace_id","number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tab_sessions_device" ON "tab_sessions" USING btree ("device_id");` },
  { id: '001_integrity', checksum: '86f9da116df8865562f1c802e698a8286a209f64a41d7d24c27ac7ee4c3c7d2c', sql: `-- Integritas akuntansi (dijalankan eksplisit setelah migrasi; bukan saat startup aplikasi).
-- Jurnal posted immutable: baris jurnal tidak boleh diubah/dihapus; entry hanya boleh berubah status -> reversed.
CREATE OR REPLACE FUNCTION bf_block_journal_line_change() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'journal_lines is append-only (posted journal immutable)'; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS bf_jl_immutable ON journal_lines;
CREATE TRIGGER bf_jl_immutable BEFORE UPDATE OR DELETE ON journal_lines FOR EACH ROW EXECUTE FUNCTION bf_block_journal_line_change();

CREATE OR REPLACE FUNCTION bf_guard_journal_entry() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'journal_entries cannot be deleted'; END IF;
  IF NEW.entry_date <> OLD.entry_date OR NEW.number <> OLD.number OR NEW.workspace_id <> OLD.workspace_id OR NEW.memo IS DISTINCT FROM OLD.memo THEN
    RAISE EXCEPTION 'posted journal entry is immutable (use reversal)'; END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS bf_je_guard ON journal_entries;
CREATE TRIGGER bf_je_guard BEFORE UPDATE OR DELETE ON journal_entries FOR EACH ROW EXECUTE FUNCTION bf_guard_journal_entry();

-- Stock movements append-only.
CREATE OR REPLACE FUNCTION bf_block_stock_change() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'stock_movements is append-only'; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS bf_sm_immutable ON stock_movements;
CREATE TRIGGER bf_sm_immutable BEFORE UPDATE OR DELETE ON stock_movements FOR EACH ROW EXECUTE FUNCTION bf_block_stock_change();
` },
  { id: '002_rls_and_tenant_fk', checksum: 'edfc7a495f0265bc198ed43acc2c2ac7829d2af6715f75bcab1d3bce32c475b5', sql: `-- 002_rls_and_tenant_fk.sql
-- Row Level Security (fail-closed) + role runtime bf_app (NOBYPASSRLS) + composite tenant FKs

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bf_app') THEN
    CREATE ROLE bf_app NOLOGIN NOBYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;

-- Izinkan user koneksi saat ini melakukan SET LOCAL ROLE bf_app dalam transaksi
DO $$
BEGIN
  EXECUTE format('GRANT bf_app TO %I', current_user);
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

GRANT USAGE ON SCHEMA public TO bf_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bf_app;

-- Hak akses minimum pada tabel-tabel yang ada
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bf_app;

-- Tabel append-only: cabut UPDATE & DELETE dari role aplikasi
REVOKE UPDATE, DELETE ON TABLE journal_entries, journal_lines, stock_movements, audit_events FROM bf_app;

-- Daftar tabel bertenant yang wajib ENABLE + FORCE ROW LEVEL SECURITY
DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'businesses', 'branches', 'warehouses', 'device_grants', 'pairing_codes',
    'legal_acceptances', 'audit_events', 'idempotency_keys', 'doc_counters',
    'notifications', 'coa_accounts', 'cash_accounts', 'finance_categories',
    'accounting_periods', 'journal_entries', 'journal_lines', 'finance_transactions',
    'budgets', 'clients', 'client_contacts', 'client_activities', 'products',
    'stock_movements', 'invoices', 'invoice_lines', 'payments', 'suppliers',
    'purchase_orders', 'purchase_order_lines', 'supplier_bills', 'employees',
    'attendance', 'tasks', 'projects', 'assets', 'campaigns', 'ops_logs',
    'cash_sessions', 'booking_resources', 'bookings'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid) WITH CHECK (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid)',
      t
    );
  END LOOP;
END
$$;

-- Composite unique (workspace_id, id) untuk composite FK lintas-tabel yang tenant-aware
DO $$
BEGIN
  ALTER TABLE clients ADD CONSTRAINT uq_clients_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE products ADD CONSTRAINT uq_products_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE invoices ADD CONSTRAINT uq_invoices_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE coa_accounts ADD CONSTRAINT uq_coa_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE journal_entries ADD CONSTRAINT uq_je_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE suppliers ADD CONSTRAINT uq_suppliers_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE purchase_orders ADD CONSTRAINT uq_po_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE booking_resources ADD CONSTRAINT uq_bres_ws_id UNIQUE (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Composite FK tenant-aware
DO $$
BEGIN
  ALTER TABLE invoice_lines ADD CONSTRAINT fk_inv_lines_ws_inv FOREIGN KEY (workspace_id, invoice_id) REFERENCES invoices (workspace_id, id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE journal_lines ADD CONSTRAINT fk_jl_ws_je FOREIGN KEY (workspace_id, entry_id) REFERENCES journal_entries (workspace_id, id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE journal_lines ADD CONSTRAINT fk_jl_ws_coa FOREIGN KEY (workspace_id, account_id) REFERENCES coa_accounts (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE client_contacts ADD CONSTRAINT fk_cc_ws_client FOREIGN KEY (workspace_id, client_id) REFERENCES clients (workspace_id, id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE client_activities ADD CONSTRAINT fk_ca_ws_client FOREIGN KEY (workspace_id, client_id) REFERENCES clients (workspace_id, id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE purchase_order_lines ADD CONSTRAINT fk_pol_ws_po FOREIGN KEY (workspace_id, po_id) REFERENCES purchase_orders (workspace_id, id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER TABLE bookings ADD CONSTRAINT fk_bk_ws_res FOREIGN KEY (workspace_id, resource_id) REFERENCES booking_resources (workspace_id, id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;
` },
  { id: '003_features_and_exports', checksum: 'a4322bfe4d1cfbe78ac4b621415f4ec2110d553f4f9983299b9cb5e54fd5acb1', sql: `-- 003_features_and_exports.sql
-- Rate limiting serverless, pg-bytea StorageAdapter, Export Center (F-17), dan modul P2 (F-13)

-- F-10: Rate limit lintas-instance berbasis SQL atomik (non-tenant)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_reset ON api_rate_limits (reset_at);

-- F-11: StorageAdapter (pg-bytea, maks 3 MB)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 3145728),
  sha256 TEXT NOT NULL,
  data BYTEA NOT NULL,
  uploaded_by_device_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_ws_entity ON files (workspace_id, entity_type, entity_id);

-- F-17: Export & Activity Center
CREATE TABLE IF NOT EXISTS receipt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_preset TEXT NOT NULL DEFAULT '80mm',
  is_default BOOLEAN NOT NULL DEFAULT false,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES receipt_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_device_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, version)
);

CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  preset TEXT NOT NULL DEFAULT 'executive',
  is_default BOOLEAN NOT NULL DEFAULT false,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_device_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, version)
);

CREATE TABLE IF NOT EXISTS export_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('receipt', 'activity_summary')),
  format TEXT NOT NULL CHECK (format IN ('pdf', 'jpg', 'png', 'xlsx', 'csv')),
  template_preset TEXT NOT NULL,
  template_id UUID,
  template_version INTEGER NOT NULL DEFAULT 1,
  source_id UUID,
  report_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  snapshot JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by_device_id UUID,
  created_by_operator TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_export_records_ws_created ON export_records (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_records_code ON export_records (workspace_id, verification_code);

-- F-13: Penambahan kolom CRM segment/tag & price tier
ALTER TABLE clients ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_tiers JSONB NOT NULL DEFAULT '[]'::jsonb;

-- F-13: Quotation & Sales Order
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  branch_id UUID,
  number TEXT NOT NULL,
  client_id UUID,
  status TEXT NOT NULL DEFAULT 'draft',
  valid_until DATE,
  subtotal BIGINT NOT NULL DEFAULT 0,
  discount BIGINT NOT NULL DEFAULT 0,
  tax BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL DEFAULT 0,
  notes TEXT,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  branch_id UUID,
  number TEXT NOT NULL,
  quotation_id UUID,
  client_id UUID,
  status TEXT NOT NULL DEFAULT 'confirmed',
  subtotal BIGINT NOT NULL DEFAULT 0,
  discount BIGINT NOT NULL DEFAULT 0,
  tax BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL DEFAULT 0,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  invoice_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- F-13: Stock Transfer & Stock Count (Opname)
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  from_warehouse_id UUID NOT NULL,
  to_warehouse_id UUID NOT NULL,
  product_id UUID NOT NULL,
  qty_milli BIGINT NOT NULL CHECK (qty_milli > 0),
  status TEXT NOT NULL DEFAULT 'completed',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  warehouse_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- F-13: Purchase Request & Supplier Return
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  requester TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_total BIGINT NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  supplier_id UUID,
  po_id UUID,
  total BIGINT NOT NULL DEFAULT 0,
  reason TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- F-13: HR Leave, Shift, Payroll
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  overtime_minutes INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_month TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'posted',
  total_gross BIGINT NOT NULL DEFAULT 0,
  total_deductions BIGINT NOT NULL DEFAULT 0,
  total_net BIGINT NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- F-13: Task Comments, Bank Reconciliation, Credit Notes, Import Batches, Privacy DSR
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  task_id UUID NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  statement_date DATE NOT NULL,
  statement_balance BIGINT NOT NULL,
  book_balance BIGINT NOT NULL,
  difference BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reconciled',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  invoice_id UUID,
  client_id UUID,
  amount BIGINT NOT NULL CHECK (amount > 0),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'committed',
  inserted_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'restriction')),
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Berikan hak akses ke bf_app & aktifkan FORCE RLS pada semua tabel baru bertenant
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bf_app;
REVOKE UPDATE, DELETE ON TABLE export_records FROM bf_app;

DO $$
DECLARE
  t text;
  new_tenant_tables text[] := ARRAY[
    'files', 'receipt_templates', 'receipt_template_versions',
    'report_templates', 'report_template_versions', 'export_records',
    'quotations', 'sales_orders', 'stock_transfers', 'stock_counts',
    'purchase_requests', 'supplier_returns', 'leave_requests', 'shifts',
    'payroll_runs', 'task_comments', 'bank_reconciliations', 'credit_notes',
    'import_batches', 'data_subject_requests'
  ];
BEGIN
  FOREACH t IN ARRAY new_tenant_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid) WITH CHECK (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid)',
      t
    );
  END LOOP;
END
$$;
` },
  { id: '004_prd_157_modules', checksum: '358e31a0ee09f012a1f145b2f69d1a9b28593e82ad21ae0b1ef76caed22f7682', sql: `-- 004_prd_157_modules.sql — Tabel pendukung 10 paket kemampuan PRD (157 Fitur)
-- Idempotent & RLS-enabled untuk auto-migrate via ensureSchemaMigrated()

CREATE TABLE IF NOT EXISTS cashier_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  device_id uuid,
  operator text,
  opening_cash bigint NOT NULL DEFAULT 0,
  cash_in bigint NOT NULL DEFAULT 0,
  cash_out bigint NOT NULL DEFAULT 0,
  cash_sales bigint NOT NULL DEFAULT 0,
  cash_refunds bigint NOT NULL DEFAULT 0,
  expected_cash bigint NOT NULL DEFAULT 0,
  counted_cash bigint,
  variance bigint,
  status text NOT NULL DEFAULT 'open',
  note text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS pos_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  capacity int NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'available',
  active_note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  warehouse_id uuid,
  batch_no text NOT NULL,
  serial_no text,
  qty_milli bigint NOT NULL DEFAULT 0,
  expiry_date date,
  cost_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_waste (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  warehouse_id uuid,
  qty_milli bigint NOT NULL DEFAULT 0,
  reason text NOT NULL,
  cost_cents bigint NOT NULL DEFAULT 0,
  operator text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id uuid,
  version int NOT NULL DEFAULT 1,
  name text NOT NULL,
  yield_qty numeric(18,3) NOT NULL DEFAULT 1,
  yield_unit text NOT NULL DEFAULT 'pcs',
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  number text NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  product_id uuid,
  planned_qty numeric(18,3) NOT NULL DEFAULT 1,
  actual_qty numeric(18,3) NOT NULL DEFAULT 0,
  waste_qty numeric(18,3) NOT NULL DEFAULT 0,
  labor_cost_cents bigint NOT NULL DEFAULT 0,
  overhead_cost_cents bigint NOT NULL DEFAULT 0,
  total_cost_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS fixed_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Peralatan',
  location text,
  responsible text,
  acquisition_date date NOT NULL DEFAULT CURRENT_DATE,
  acquisition_cost_cents bigint NOT NULL DEFAULT 0,
  residual_value_cents bigint NOT NULL DEFAULT 0,
  useful_life_months int NOT NULL DEFAULT 36,
  method text NOT NULL DEFAULT 'straight_line',
  accumulated_dep_cents bigint NOT NULL DEFAULT 0,
  book_value_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asset_depreciation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
  period_month text NOT NULL,
  amount_cents bigint NOT NULL DEFAULT 0,
  book_value_after_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  basis text NOT NULL DEFAULT 'product',
  rate_percent numeric(6,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  standard_cost_cents bigint NOT NULL DEFAULT 0,
  labor_cost_cents bigint NOT NULL DEFAULT 0,
  material_cost_cents bigint NOT NULL DEFAULT 0,
  equipment_cost_cents bigint NOT NULL DEFAULT 0,
  facility_cost_cents bigint NOT NULL DEFAULT 0,
  revenue_cents bigint NOT NULL DEFAULT 0,
  wait_minutes int NOT NULL DEFAULT 0,
  process_minutes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operational_displays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  ticket_no text NOT NULL,
  station text NOT NULL DEFAULT 'kitchen',
  title text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'cashier_shifts', 'pos_tables', 'product_batches', 'stock_waste',
    'recipes', 'work_orders', 'fixed_assets', 'asset_depreciation_logs',
    'commission_rules', 'service_costs', 'operational_displays'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid) WITH CHECK (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid)',
      tbl
    );
    BEGIN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO bf_app', tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;
` },
  { id: '005_remediation_hardening', checksum: '32cf351ed32717a6f8d07fcd5fb20072d8c55d197e10f871dcd21a46d6e65343', sql: `-- 005_remediation_hardening.sql
-- Hardening skema untuk BF-010, BF-013, BF-017, BF-035, BF-036, NF-12, NF-14, NF-16

-- 1. Idempotency keys: simpan route, request_hash, response_status, response_body (BF-036)
ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS route TEXT NOT NULL DEFAULT '';
ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS request_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS response_status INTEGER NOT NULL DEFAULT 201;
DROP INDEX IF EXISTS idem_ws_key;
CREATE UNIQUE INDEX IF NOT EXISTS idem_ws_route_key ON idempotency_keys (workspace_id, route, key);

-- 2. Cashier shifts: pastikan hanya 1 shift terbuka per workspace (atau branch) secara atomik (BF-017)
CREATE UNIQUE INDEX IF NOT EXISTS uq_cashier_shifts_one_open
  ON cashier_shifts (workspace_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE status = 'open';

-- 3. Fixed asset depreciation: cegah double depreciation pada periode yang sama (BF-010)
CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_dep_period
  ON asset_depreciation_logs (workspace_id, asset_id, period_month);

-- 4. Export records / durable artifact metadata (BF-013, BF-035, NF-16)
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS object_key TEXT;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS size_bytes INTEGER;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS artifact_data BYTEA;

-- 5. Least privilege untuk api_rate_limits (NF-12, NF-14)
DO $$
BEGIN
  IF to_regclass('public.api_rate_limits') IS NOT NULL THEN
    REVOKE ALL ON TABLE api_rate_limits FROM bf_app;
  END IF;
END
$$;

-- 6. RLS fail-closed untuk jobs (NF-04)
DO $$
BEGIN
  IF to_regclass('public.jobs') IS NOT NULL THEN
    ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE jobs FORCE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation ON jobs;
    CREATE POLICY tenant_isolation ON jobs
      USING (
        workspace_id = NULLIF(current_setting('app.workspace_id', true), '')::uuid
        OR (workspace_id IS NULL AND NULLIF(current_setting('app.workspace_id', true), '') IS NULL)
      )
      WITH CHECK (
        workspace_id = NULLIF(current_setting('app.workspace_id', true), '')::uuid
        OR (workspace_id IS NULL AND NULLIF(current_setting('app.workspace_id', true), '') IS NULL)
      );
    BEGIN
      GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO bf_app;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END
$$;

-- 7. Remediasi drift tabel devices (BF-002: default gen_random_uuid pada devices.id)
DO $$
BEGIN
  IF to_regclass('public.devices') IS NOT NULL THEN
    ALTER TABLE devices ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE devices ALTER COLUMN name SET DEFAULT 'Perangkat';
    ALTER TABLE devices ALTER COLUMN failed_attempts SET DEFAULT 0;
    ALTER TABLE devices ALTER COLUMN status SET DEFAULT 'active';
  END IF;
END
$$;


` },
  { id: '006_auth_identity', checksum: '3a250889232159f7f25970eace4d3b405f938b0d927eee185eba67627e10af6d', sql: `-- 006_auth_identity.sql
-- Identitas akun Google (Better Auth), keanggotaan workspace, undangan, audit keamanan.
-- Aditif dan idempoten. Tabel auth bersifat NON-TENANT dan tidak boleh disentuh role aplikasi bf_app.

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled'))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_email ON "user" (lower(email));

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_session_user ON session (user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires ON session (expires_at);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Kunci identitas = (provider, sub), BUKAN email.
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_provider_sub ON account (provider_id, account_id);
CREATE INDEX IF NOT EXISTS idx_account_user ON account (user_id);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification (identifier);

CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','removed')),
  branch_id UUID,
  warehouse_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_wm_user ON workspace_members (user_id) WHERE status = 'active';
-- Tepat satu owner aktif per workspace saat ini (transfer owner = fase CP3, dalam satu transaksi).
CREATE UNIQUE INDEX IF NOT EXISTS uq_wm_one_owner ON workspace_members (workspace_id) WHERE role = 'owner' AND status = 'active';

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'staff',
  branch_id UUID,
  warehouse_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by TEXT NOT NULL REFERENCES "user"(id),
  accepted_by TEXT REFERENCES "user"(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_events (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID,
  user_id TEXT,
  type TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_events_ws ON auth_events (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_events_user ON auth_events (user_id, created_at DESC);

ALTER TABLE devices ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE onboarding_drafts ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;

-- RLS: tabel bertenant baru
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['workspace_members','workspace_invitations','auth_events'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid) WITH CHECK (workspace_id = NULLIF(current_setting(''app.workspace_id'', true), '''')::uuid)',
      t);
  END LOOP;
END $$;
-- Pemilik koneksi (service auth) boleh membaca keanggotaan miliknya sendiri lewat app.user_id (tanpa konteks tenant).
DROP POLICY IF EXISTS member_self_read ON workspace_members;
CREATE POLICY member_self_read ON workspace_members FOR SELECT
  USING (user_id = NULLIF(current_setting('app.user_id', true), ''));

-- Hak akses: role aplikasi TIDAK boleh menyentuh tabel auth; audit & keanggotaan hanya baca/tambah via tenant.
REVOKE ALL ON TABLE "user", session, account, verification FROM bf_app;
GRANT SELECT ON workspace_members TO bf_app;
GRANT SELECT, INSERT ON auth_events TO bf_app;
GRANT SELECT ON workspace_invitations TO bf_app;
` },
  { id: '007_depreciation_journal', checksum: 'fb46eca4f62f587bc4a0f4b329be69f977dc873fc13f2e5b1d76ccb6be15f2d8', sql: `-- 007_depreciation_journal.sql — depresiasi aset mem-post jurnal; koreksi via jurnal balik
ALTER TABLE asset_depreciation_logs ADD COLUMN IF NOT EXISTS journal_entry_id uuid;
ALTER TABLE asset_depreciation_logs ADD COLUMN IF NOT EXISTS reversal_entry_id uuid;
ALTER TABLE asset_depreciation_logs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'posted';
ALTER TABLE asset_depreciation_logs ADD COLUMN IF NOT EXISTS reversed_at timestamptz;
DO $$ BEGIN
  ALTER TABLE asset_depreciation_logs ADD CONSTRAINT adl_status CHECK (status IN ('posted','reversed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- unik hanya untuk yang masih berlaku: periode yang dibalik dapat diposting ulang
DROP INDEX IF EXISTS uq_asset_dep_period;
CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_dep_period_posted
  ON asset_depreciation_logs (workspace_id, asset_id, period_month) WHERE status = 'posted';
` },
  { id: '008_payroll_server_side', checksum: 'b40b03c0645b9ac9980298cf8b94b9213985347e2359556d6d79c3309ec120eb', sql: `-- 008_payroll_server_side.sql — payroll dihitung server, bertahap draft → posted (jurnal) → reversed
ALTER TABLE payroll_runs ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS policy jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS journal_entry_id uuid;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS reversal_entry_id uuid;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS posted_at timestamptz;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS created_by text;
DO $$ BEGIN
  ALTER TABLE payroll_runs ADD CONSTRAINT payroll_status CHECK (status IN ('draft','posted','reversed','cancelled','legacy'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- run lama (diisi manual dari klien) ditandai legacy agar tidak dianggap hasil hitung server
UPDATE payroll_runs SET status = 'legacy' WHERE status = 'posted' AND journal_entry_id IS NULL AND posted_at IS NULL;
-- satu run aktif per periode (draft/posted); aman bila data lama bentrok
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_period_active ON payroll_runs (workspace_id, period_month) WHERE status IN ('draft','posted');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_payroll_period_active dilewati: %', SQLERRM; END $$;
` },
  { id: '009_export_lifecycle', checksum: '95d69afa6c9d350d277205f35b68325440dd2c677c1e9b52feae75bbf562fcf1', sql: `-- 009_export_lifecycle.sql — status ekspor nyata: pending → completed | failed (dikonfirmasi setelah file benar-benar dibuat)
ALTER TABLE export_records ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE export_records ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
DO $$ BEGIN
  ALTER TABLE export_records ADD CONSTRAINT export_status CHECK (status IN ('pending','completed','failed','preview','reversed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Role aplikasi hanya boleh mengubah kolom status siklus hidup (snapshot/riwayat tetap immutable).
GRANT UPDATE (status, error, completed_at) ON export_records TO bf_app;
` },
  { id: '010_auth_rate_limits', checksum: '31e729c2786c51ddfedc0ad301bed1a97703a1126f1cc0ff4213a3ac4c1ddf1f', sql: `-- 010_auth_rate_limits.sql — rate limit login/callback lintas instance (non-tenant, bukan untuk bf_app)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  last_request BIGINT NOT NULL
);
REVOKE ALL ON TABLE auth_rate_limits FROM bf_app;
` },
  { id: '011_fallback_resilience', checksum: 'a2858513dfc2266e3699b003f218f0f46bb94ba935136b7b71025a161607f50d', sql: `-- 011_fallback_resilience.sql
-- Fondasi sistem FALLBACK (tanpa ENV baru).
-- Semua tabel di sini NON-TENANT dan HANYA diakses role pemilik (server).
-- Tidak ada kolom workspace_id (sengaja) sehingga tidak masuk inventaris RLS bertenant;
-- rujukan workspace memakai kolom workspace_ref tanpa foreign key.
-- Tabel-tabel ini TIDAK diberikan akses ke role aplikasi bf_app (defense in depth).

-- Secret aplikasi hasil pembangkitan (F-02). Nilai tidak pernah dikirim ke klien/log.
CREATE TABLE IF NOT EXISTS app_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE app_secrets FROM bf_app;

-- Saklar sistem (F-01/F-15). Baris fallbacks_enabled default true.
CREATE TABLE IF NOT EXISTS system_flags (
  key TEXT PRIMARY KEY,
  value BOOLEAN NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO system_flags (key, value) VALUES ('fallbacks_enabled', TRUE)
  ON CONFLICT (key) DO NOTHING;
REVOKE ALL ON TABLE system_flags FROM bf_app;

-- Catatan aktivasi fallback (F-16). Tanpa PII/secret.
CREATE TABLE IF NOT EXISTS fallback_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  workspace_ref UUID,
  fallback_id TEXT NOT NULL,
  trigger TEXT NOT NULL,
  outcome TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_fallback_events_created ON fallback_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fallback_events_fallback ON fallback_events (fallback_id, created_at DESC);
REVOKE ALL ON TABLE fallback_events FROM bf_app;

-- Sesi darurat perangkat (F-06 / 4.5.2). Hash token, maksimum 8 jam, tidak dapat diperpanjang.
CREATE TABLE IF NOT EXISTS emergency_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  device_id UUID NOT NULL,
  workspace_ref UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_emergency_sessions_device ON emergency_sessions (device_id, created_at DESC);
REVOKE ALL ON TABLE emergency_sessions FROM bf_app;

-- Metadata auth workspace (4.5.1). Default google supaya perilaku lama tidak berubah.
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS auth_mode TEXT NOT NULL DEFAULT 'google';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS emergency_login_enabled BOOLEAN NOT NULL DEFAULT TRUE;
DO $$ BEGIN
  ALTER TABLE workspaces ADD CONSTRAINT workspaces_auth_mode_check CHECK (auth_mode IN ('google','device'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sinkronisasi onboarding draft lintas perangkat: ikat ke user_id (bukan hanya device).
ALTER TABLE onboarding_drafts ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_onboarding_drafts_user ON onboarding_drafts (user_id) WHERE user_id IS NOT NULL;

-- Tandai audit yang berasal dari sesi darurat (4.5.2).
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS via_emergency BOOLEAN NOT NULL DEFAULT FALSE;
` },
  { id: '012_pairing_claim_context', checksum: '7f36c4ae50a713e21f34f0aa12158ec5f08e690028d002c73d52b28bde459066', sql: `-- 012_pairing_claim_context.sql
-- Klaim kode pairing berjalan TANPA sesi dan TANPA konteks tenant (POST /api/v1/device/pair),
-- sementara pairing_codes memakai ENABLE + FORCE ROW LEVEL SECURITY. Akibatnya klaim selalu
-- gagal: UPDATE tidak mengenai baris apa pun (0 rows) sehingga kode valid ditolak selamanya.
--
-- Perbaikan tanpa melemahkan isolasi: policy tambahan (permissive, di-OR dengan tenant_isolation)
-- yang hanya membuka SATU baris dengan hash kode yang dipegang pemanggil. Hash 8 karakter acak
-- bersifat rahasia, sekali pakai, berumur 10 menit, dan laju pembuatan/penebusan sudah dibatasi.

DROP POLICY IF EXISTS pairing_claim_select ON pairing_codes;
CREATE POLICY pairing_claim_select ON pairing_codes FOR SELECT
  USING (
    code_hash = NULLIF(current_setting('app.pairing_code', true), '')
    AND used_at IS NULL
  );

DROP POLICY IF EXISTS pairing_claim_update ON pairing_codes;
CREATE POLICY pairing_claim_update ON pairing_codes FOR UPDATE
  USING (
    code_hash = NULLIF(current_setting('app.pairing_code', true), '')
    AND used_at IS NULL
    AND expires_at > now()
  )
  WITH CHECK (code_hash = NULLIF(current_setting('app.pairing_code', true), ''));
` },
];

export const CANONICAL_MIGRATION_MANIFEST: Array<{ id: string; checksum: string }> =
  BUNDLED_MIGRATIONS.map(({ id, checksum }) => ({ id, checksum }));
