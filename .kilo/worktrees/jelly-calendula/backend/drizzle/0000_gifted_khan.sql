CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."contact_message_category" AS ENUM('Admissions Inquiry', 'School Fees Question', 'Academic Programs & Support', 'Schedule Visit', 'Other Inquiries');--> statement-breakpoint
CREATE TYPE "public"."contact_message_status" AS ENUM('New', 'Pending', 'Reviewed', 'Responded');--> statement-breakpoint
CREATE TYPE "public"."downloads_category" AS ENUM('General', 'Admissions', 'Academic', 'Fees', 'Requirements');--> statement-breakpoint
CREATE TYPE "public"."gallery_category" AS ENUM('campus', 'academics', 'tvet', 'sports', 'events');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('Male', 'Female');--> statement-breakpoint
CREATE TYPE "public"."inventory_meal_type" AS ENUM('Breakfast', 'Lunch', 'Dinner', 'Special Event', 'Other');--> statement-breakpoint
CREATE TYPE "public"."news_category" AS ENUM('General', 'Admissions', 'Facilities', 'Events');--> statement-breakpoint
CREATE TYPE "public"."news_status" AS ENUM('Published', 'Draft');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE');--> statement-breakpoint
CREATE TYPE "public"."relationship" AS ENUM('Father', 'Mother', 'Guardian', 'Other Relative');--> statement-breakpoint
CREATE TYPE "public"."requirement_category" AS ENUM('Boarding / Tools', 'Academic Supplies', 'Personal Care / Fees');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Secondary-HeadMaster', 'Primary-HeadMaster', 'DOS-Secondary', 'DOS-Tvet', 'Admin', 'Bursar', 'Cashier', 'School-receptionist', 'Store-Manager');--> statement-breakpoint
CREATE TYPE "public"."section_scope" AS ENUM('PRIMARY', 'LOWER SECONDARY', 'TVET', 'NURSERY', 'All');--> statement-breakpoint
CREATE TYPE "public"."spoilage_reason" AS ENUM('Water Damage / Rain', 'Pest Infestation', 'Expired', 'Transportation / Bag Tear', 'Other Spoilage');--> statement-breakpoint
CREATE TYPE "public"."store_tx_type" AS ENUM('STUDENT_DEPOSIT', 'ISSUED_OUT', 'DISPOSED');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('ACTIVE', 'TRANSFERRED', 'GRADUATED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."student_type" AS ENUM('DAY', 'BOARDING');--> statement-breakpoint
CREATE TYPE "public"."term_enum" AS ENUM('TERM_1', 'TERM_2', 'TERM_3');--> statement-breakpoint
CREATE TYPE "public"."inventory_tx_type" AS ENUM('STOCK_IN', 'STOCK_OUT', 'SPOILAGE');--> statement-breakpoint
CREATE TYPE "public"."inventory_unit" AS ENUM('kg', 'liters', 'bags');--> statement-breakpoint
CREATE TABLE "application_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"student_first_name" text NOT NULL,
	"student_last_name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"education_level" "section_scope" NOT NULL,
	"trade_name" text,
	"applied_class" text NOT NULL,
	"previous_school" text,
	"parent_name" text NOT NULL,
	"parent_phone" text NOT NULL,
	"parent_email" text,
	"residential_description" text NOT NULL,
	"relationship_to_student" "relationship" NOT NULL,
	"student_type" "student_type" DEFAULT 'DAY' NOT NULL,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_name" text NOT NULL,
	"scope" "section_scope" NOT NULL,
	"trade_name" text
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"category" "contact_message_category" DEFAULT 'Other Inquiries' NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "contact_message_status" DEFAULT 'New' NOT NULL,
	"reply_message" text,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "downloads_category" NOT NULL,
	"file_size" text NOT NULL,
	"file_format" text NOT NULL,
	"download_url" text NOT NULL,
	"file_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year" text NOT NULL,
	"term" "term_enum" NOT NULL,
	"scope" "section_scope" NOT NULL,
	"trade_name" text,
	"name" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"is_boarding_only" boolean DEFAULT false NOT NULL,
	"is_day_only" boolean DEFAULT false NOT NULL,
	"is_new_student_only" boolean DEFAULT false NOT NULL,
	"custom_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" "gallery_category" NOT NULL,
	"image_url" text NOT NULL,
	"public_id" text,
	"date" text NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"category" varchar(100) NOT NULL,
	"unit" "inventory_unit" DEFAULT 'kg' NOT NULL,
	"available_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"type" "inventory_tx_type" NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"supplier" varchar(150),
	"invoice_number" varchar(100),
	"date_received" varchar(20),
	"meal_type" "inventory_meal_type",
	"issued_to" varchar(150),
	"date_issued" varchar(20),
	"time_issued" varchar(20),
	"spoilage_reason" "spoilage_reason",
	"date_reported" varchar(20),
	"time_reported" varchar(20),
	"recorded_by" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text,
	"category" "news_category" DEFAULT 'General' NOT NULL,
	"status" "news_status" DEFAULT 'Published' NOT NULL,
	"author_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_no" text NOT NULL,
	"student_id" uuid NOT NULL,
	"amount_paid" numeric(12, 2) NOT NULL,
	"academic_period" text NOT NULL,
	"remarks" text,
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_receipt_no_unique" UNIQUE("receipt_no")
);
--> statement-breakpoint
CREATE TABLE "requirement_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" "requirement_category" NOT NULL,
	"scope" "section_scope" DEFAULT 'All' NOT NULL,
	"class_id" uuid,
	"academic_year" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" "requirement_category" NOT NULL,
	"available_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"unit" varchar(50) DEFAULT 'pcs' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_items_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "store_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_item_id" uuid NOT NULL,
	"deposit_id" uuid,
	"type" "store_tx_type" NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"issued_to" varchar(150),
	"recorded_by" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_requirement_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"requirement_item_id" uuid NOT NULL,
	"is_brought" boolean DEFAULT false NOT NULL,
	"inspected_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_requirement_notes" (
	"student_id" uuid PRIMARY KEY NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_store_deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"store_item_id" uuid NOT NULL,
	"requirement_item_id" uuid,
	"quantity_brought" numeric(12, 2) DEFAULT '1' NOT NULL,
	"received_by" uuid NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"term" "term_enum" NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reg_number" text NOT NULL,
	"student_name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"education_level" "section_scope" NOT NULL,
	"trade_name" text,
	"class_id" uuid,
	"parent_name" text NOT NULL,
	"parent_phone" text NOT NULL,
	"student_type" "student_type" DEFAULT 'DAY' NOT NULL,
	"is_new_student" boolean DEFAULT true NOT NULL,
	"status" "student_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_reg_number_unique" UNIQUE("reg_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" NOT NULL,
	"scope" "section_scope" DEFAULT 'All' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_items" ADD CONSTRAINT "requirement_items_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_store_item_id_store_items_id_fk" FOREIGN KEY ("store_item_id") REFERENCES "public"."store_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_deposit_id_student_store_deposits_id_fk" FOREIGN KEY ("deposit_id") REFERENCES "public"."student_store_deposits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_requirement_checks" ADD CONSTRAINT "student_requirement_checks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_requirement_checks" ADD CONSTRAINT "student_requirement_checks_requirement_item_id_requirement_items_id_fk" FOREIGN KEY ("requirement_item_id") REFERENCES "public"."requirement_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_requirement_checks" ADD CONSTRAINT "student_requirement_checks_inspected_by_users_id_fk" FOREIGN KEY ("inspected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_requirement_notes" ADD CONSTRAINT "student_requirement_notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_store_deposits" ADD CONSTRAINT "student_store_deposits_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_store_deposits" ADD CONSTRAINT "student_store_deposits_store_item_id_store_items_id_fk" FOREIGN KEY ("store_item_id") REFERENCES "public"."store_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_store_deposits" ADD CONSTRAINT "student_store_deposits_requirement_item_id_requirement_items_id_fk" FOREIGN KEY ("requirement_item_id") REFERENCES "public"."requirement_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_store_deposits" ADD CONSTRAINT "student_store_deposits_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;