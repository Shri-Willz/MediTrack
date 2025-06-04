import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("Email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email : true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Medication related schemas
export const medicationFormEnum = pgEnum("medication_form", [
  "tablet",
  "capsule",
  "liquid",
  "injection",
  "patch",
  "inhaler",
  "cream",
  "other"
]);

export const frequencyEnum = pgEnum("frequency", [
  "once_daily",
  "twice_daily",
  "three_times_daily",
  "four_times_daily",
  "as_needed",
  "weekly",
  "monthly",
  "other"
]);

export const statusEnum = pgEnum("status", [
  "active",
  "inactive",
  "completed"
]);

// Main medication table
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  form: medicationFormEnum("form").notNull(),
  instructions: text("instructions"),
  frequency: frequencyEnum("frequency").notNull(),
  purpose: text("purpose"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  quantity: integer("quantity").notNull(),
  refills: integer("refills").default(0),
  status: statusEnum("status").default("active").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertMedicationSchema = createInsertSchema(medications)
  .omit({ id: true })
  .extend({
    userId: z.number().optional(),
  });

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

// Medication schedule/dosage times
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").references(() => medications.id).notNull(),
  timeOfDay: text("time_of_day").notNull(), // stored as HH:MM in 24-hour format
  taken: boolean("taken").default(false),
  scheduledDate: timestamp("scheduled_date").notNull(), // When this dose should be taken
  takenAt: timestamp("taken_at"), // When it was actually taken (if at all)
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

// Reminders table
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").references(() => medications.id).notNull(),
  time: text("time").notNull(), // stored as HH:MM in 24-hour format
  enabled: boolean("enabled").default(true),
  days: text("days").notNull(), // Comma-separated list of days (e.g., "1,2,3,4,5,6,7" for every day)
});

export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true });

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;
