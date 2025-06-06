CREATE TYPE "public"."frequency" AS ENUM('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed', 'weekly', 'monthly', 'other');--> statement-breakpoint
CREATE TYPE "public"."medication_form" AS ENUM('tablet', 'capsule', 'liquid', 'injection', 'patch', 'inhaler', 'cream', 'other');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'completed');--> statement-breakpoint
CREATE TABLE "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"dosage" text NOT NULL,
	"form" "medication_form" NOT NULL,
	"instructions" text,
	"frequency" "frequency" NOT NULL,
	"purpose" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"quantity" integer NOT NULL,
	"refills" integer DEFAULT 0,
	"status" "status" DEFAULT 'active' NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"medication_id" integer NOT NULL,
	"time" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"days" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"medication_id" integer NOT NULL,
	"time_of_day" text NOT NULL,
	"taken" boolean DEFAULT false,
	"scheduled_date" timestamp NOT NULL,
	"taken_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"phone number" text NOT NULL,
	"Email" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_phone number_unique" UNIQUE("phone number"),
	CONSTRAINT "users_Email_unique" UNIQUE("Email")
);
--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE no action ON UPDATE no action;