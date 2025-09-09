import { eq, and } from "drizzle-orm";
import { db } from "./drizzle/migration/db";
import { users, medications, schedules, reminders } from "@shared/schema"; // adjust if needed

import {
  type User,
  type InsertUser,
  type Medication,
  type InsertMedication,
  type Schedule,
  type InsertSchedule,
  type Reminder,
  type InsertReminder,
} from "@shared/schema";
import { between } from "drizzle-orm";
export class PostgresStorage {
  // ----- USER -----
  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByemail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async createUser(data: InsertUser): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }

  async deleteuserbyemail(email:string): Promise<boolean>{
    const result = await db.delete(users).where(eq(users.email,email));
    return true
  }

  // ----- MEDICATION -----
  async getMedications(userId?: string): Promise<Medication[]> {
    if (userId) {
      return await db
        .select()
        .from(medications)
        .where(eq(medications.userId, userId));
    }
    return await db.select().from(medications);
  }

  async getMedicationById(id: string): Promise<Medication | undefined> {
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id))
      .limit(1);
    return result[0];
  }

  async createMedication(data: InsertMedication): Promise<Medication> {
    const result = await db.insert(medications).values(data).returning();
    return result[0];
  }

  async updateMedication(
    id: string,
    data: Partial<InsertMedication>
  ): Promise<Medication | undefined> {
    const result = await db
      .update(medications)
      .set(data)
      .where(eq(medications.id, id))
      .returning();
    return result[0];
  }

  async deleteMedication(id: string): Promise<boolean> {
    const result = await db.delete(medications).where(eq(medications.id, id));
    return result.length > 0;
  }

  // // ----- SCHEDULE -----
  async getSchedules(medicationId?: string, date?: Date): Promise<Schedule[]> {
    let query = db.select().from(schedules);

    if (medicationId && date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return await query.where(
        and(
          eq(schedules.medicationId, medicationId),
          between(schedules.scheduledDate, start, end)
        )
      );
    } else if (medicationId) {
      return await query.where(eq(schedules.medicationId, medicationId));
    } else if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return await query.where(between(schedules.scheduledDate, start, end));
    }

    return await query;
  }

  async getScheduleById(id: number): Promise<Schedule | undefined> {
    const result = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, id))
      .limit(1);
    return result[0];
  }

  async createSchedule(data: InsertSchedule): Promise<Schedule> {
    const result = await db.insert(schedules).values(data).returning();
    return result[0];
  }

  async updateSchedule(
    id: number,
    data: Partial<InsertSchedule>
  ): Promise<Schedule | undefined> {
    const result = await db
      .update(schedules)
      .set(data)
      .where(eq(schedules.id, id))
      .returning();
    return result[0];
  }

  async markScheduleAsTaken(
    id: number,
    takenAt: Date = new Date()
  ): Promise<Schedule | undefined> {
    const result = await db
      .update(schedules)
      .set({
        taken: true,
        takenAt,
      })
      .where(eq(schedules.id, id))
      .returning();
    return result[0];
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id));
    return result.length > 0;
  }

  // ----- REMINDER -----
  async getReminders(medicationId?: string): Promise<Reminder[]> {
    if (medicationId) {
      return await db
        .select()
        .from(reminders)
        .where(eq(reminders.medicationId, medicationId));
    }
    return await db.select().from(reminders);
  }

  async getReminderById(id: number): Promise<Reminder | undefined> {
    const result = await db
      .select()
      .from(reminders)
      .where(eq(reminders.id, id))
      .limit(1);
    return result[0];
  }

  async createReminder(data: InsertReminder): Promise<Reminder> {
    const result = await db.insert(reminders).values(data).returning();
    return result[0];
  }

  async updateReminder(
    id: number,
    data: Partial<InsertReminder>
  ): Promise<Reminder | undefined> {
    const result = await db
      .update(reminders)
      .set(data)
      .where(eq(reminders.id, id))
      .returning();
    return result[0];
  }

  async deleteReminder(id: number): Promise<boolean> {
    const result = await db.delete(reminders).where(eq(reminders.id, id));
    return result.length > 0;
  }
}

// Use like this:
export const storage = new PostgresStorage();
