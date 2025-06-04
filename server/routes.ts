import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertMedicationSchema,
  insertScheduleSchema,
  insertReminderSchema,
  users,
  medications
} from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();
import {db} from "./drizzle/migrations/db"
import { clerkClient, requireAuth, getAuth } from '@clerk/express'

const validateBody = <T>(schema: z.ZodType<T>) => (
  req: Request,
  res: Response,
  next: () => void
) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid request body", error });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - all prefixed with /api

 // getting info form user
  app.get('/protected', requireAuth(), async (req, res) => {
    // Use `getAuth()` to get the user's `userId`
    const { userId }  = getAuth(req)

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No userId" });
    }  
    // Use Clerk's JavaScript Backend SDK to get the user's User object
    const user = await clerkClient.users.getUser(userId )

    return res.json({ user })
  })
  
  // Medications routes
  app.get("/api/medications", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching medications", error });
    }
  });
  
  app.get("/api/medications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const medication = await storage.getMedicationById(id);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      medication
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Error fetching medication", error });
    }
  });
  
  app.post("/api/medications", validateBody(insertMedicationSchema), async (req, res) => {
    try {
      const medication = await storage.createMedication(req.body);
      res.status(201).json(medication);
    } catch (error) {
      res.status(500).json({ message: "Error creating medication", error });
    }
  });
  
  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedMedication = await storage.updateMedication(id, req.body);
      
      if (!updatedMedication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(updatedMedication);
    } catch (error) {
      res.status(500).json({ message: "Error updating medication", error });
    }
  });
  
  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await storage.deleteMedication(id);
      
      if (!result) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting medication", error });
    }
  });
  
  // Schedule routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const medicationId = req.query.medicationId ? Number(req.query.medicationId) : undefined;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      
      const schedules = await storage.getSchedules(medicationId, date);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Error fetching schedules", error });
    }
  });
  
  app.get("/api/schedules/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const schedule = await storage.getScheduleById(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Error fetching schedule", error });
    }
  });
  
  app.post("/api/schedules", validateBody(insertScheduleSchema), async (req, res) => {
    try {
      const schedule = await storage.createSchedule(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Error creating schedule", error });
    }
  });
  
  app.patch("/api/schedules/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedSchedule = await storage.updateSchedule(id, req.body);
      
      if (!updatedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(updatedSchedule);
    } catch (error) {
      res.status(500).json({ message: "Error updating schedule", error });
    }
  });
  
  app.post("/api/schedules/:id/take", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const takenAt = req.body.takenAt ? new Date(req.body.takenAt) : new Date();
      
      const updatedSchedule = await storage.markScheduleAsTaken(id, takenAt);
      
      if (!updatedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(updatedSchedule);
    } catch (error) {
      res.status(500).json({ message: "Error marking schedule as taken", error });
    }
  });
  
  app.delete("/api/schedules/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await storage.deleteSchedule(id);
      
      if (!result) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting schedule", error });
    }
  });
  
  // Reminder routes
  app.get("/api/reminders", async (req, res) => {
    try {
      const medicationId = req.query.medicationId ? Number(req.query.medicationId) : undefined;
      const reminders = await storage.getReminders(medicationId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reminders", error });
    }
  });
  
  app.get("/api/reminders/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const reminder = await storage.getReminderById(id);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reminder", error });
    }
  });
  
  app.post("/api/reminders", validateBody(insertReminderSchema), async (req, res) => {
    try {
      const reminder = await storage.createReminder(req.body);
      res.status(201).json(reminder);
    } catch (error) {
      res.status(500).json({ message: "Error creating reminder", error });
    }
  });
  
  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedReminder = await storage.updateReminder(id, req.body);
      
      if (!updatedReminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(updatedReminder);
    } catch (error) {
      res.status(500).json({ message: "Error updating reminder", error });
    }
  });
  
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await storage.deleteReminder(id);
      
      if (!result) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting reminder", error });
    }
  });
  
  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      
      // Get all medications
      const medications = await storage.getMedications(userId);
      const activeMeds = medications.filter(med => med.status === 'active').length;
      
      // Get today's schedules
      const today = new Date();
      const schedules = await storage.getSchedules(undefined, today);
      const todayTotal = schedules.length;
      const todayCompleted = schedules.filter(s => s.taken).length;
      
      // Calculate refills needed
      const refillsNeeded = medications.filter(med => {
        // Simplified logic: mark as needing refill if quantity is less than 10
        return med.quantity < 10 && med.status === 'active';
      }).length;
      
      res.json({
        activeMeds,
        todayDoses: {
          total: todayTotal,
          completed: todayCompleted
        },
        refillsNeeded
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
