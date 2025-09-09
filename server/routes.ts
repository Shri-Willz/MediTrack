import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { promise, string, z } from "zod";
import {
  insertUserSchema,
  insertMedicationSchema,
  insertScheduleSchema,
  insertReminderSchema,
  users,
  medications,
} from "@shared/schema";
import { storage } from "./storage";
import { clerkMiddleware, clerkClient } from "@clerk/express";

const validateBody =
  <T>(schema: z.ZodType<T>) =>
  (req: Request, res: Response, next: () => void) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid request body", error });
    }
  };

let User_eamil = "";
let User_id = "";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(clerkMiddleware());
  //   API routes - all prefixed with /api
  //  getting info form user

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
    
      //Get the user
      const { userId } = (req as any).auth();

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
      }
      const user = await clerkClient.users.getUser(userId);
      const email = user.emailAddresses;
      const [{ emailAddress }] = email;
      const user_id = await storage.getUserByemail(emailAddress);
      User_eamil = emailAddress;

      // Get all medications
      const medications = await storage.getMedications(User_id);
      const activeMeds = medications.filter(
        (med) => med.status === "active"
      ).length;

      // Get today's schedules
      const today = new Date();
      const medicationIds = medications.map((medi) => medi.id);
      const result = await Promise.all(
        medicationIds.map((id) => storage.getSchedules(id, today))
      );
      const schedules = result.flat();
      const todayTotal = schedules.length;
      const todayCompleted = schedules.filter((s) => s.taken).length;

      // Calculate refills needed
      const refillsNeeded = medications.filter((med) => {
        // Simplified logic: mark as needing refill if quantity is less than 10
        return med.quantity < 10 && med.status === "active";
      }).length;

      res.status(200).json({
        medications,
        activeMeds,
        todayDoses: {
          total: todayTotal,
          completed: todayCompleted,
        },
        refillsNeeded,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats", error });
    }
  });

  // user routes
  app.get("/api/users", async (req, res) => {
    const { userId } = (req as any).auth();

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
    }
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses;
    const user_id = await storage.getUserByemail(User_eamil);
    return res.status(200).json({ id: user_id?.id });
  });
  app.post("/api/users", validateBody(insertUserSchema), async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error creating account", error });
    }
  });

  // Medications routes
  app.get("/api/medications", async (req, res) => {
    try {
      const user_id = await storage.getUserByemail(User_eamil);
      User_id = user_id!.id;
      const medications = await storage.getMedications(user_id?.id);
      res.status(200).json(medications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching medication", error });
    }
  });

  app.get("/api/medications/:id", async (req, res) => {
    try {
      const id = (req as any).params.id;
      const medication = await storage.getMedicationById(id);

      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Error fetching medication", error });
    }
  });

  app.post(
    "/api/medications",
    validateBody(insertMedicationSchema),
    async (req, res) => {
      try {
        const medication = await storage.createMedication(req.body);
        res.status(201).json(medication);
      } catch (error) {
        res.status(500).json({ message: "Error creating medication", error });
      }
    }
  );

  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const id = (req as any).params.id;
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
      const id = (req as any).params.id;
      const result = await storage.deleteMedication(id);

      if (result) {
        return res.status(404).json({ message: "Medication not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting medication", error });
    }
  });

  // // Schedule routes
  app.get("/api/schedules", async (req, res) => {
    try {
      const medications = await storage.getMedications(User_id);
      const medicationIds = medications.map((medi) => medi.id);
      const date = req.query.date
        ? new Date(req.query.date as string)
        : undefined;
      const result = await Promise.all(
        medicationIds.map((id) => storage.getSchedules(id, date))
      );
      const schedules = result.flat();
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

  app.post("/api/schedules",validateBody(insertScheduleSchema),async (req, res) => {
      try {
        const schedule = await storage.createSchedule(req.body);
        res.status(201).json(schedule);
      } catch (error) {
        res.status(500).json({ message: "Error creating schedule", error });
      }
    }
  );

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
      const takenAt = req.body.takenAt
        ? new Date(req.body.takenAt)
        : new Date();

      const updatedSchedule = await storage.markScheduleAsTaken(id, takenAt);

      if (!updatedSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      res.json(updatedSchedule);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error marking schedule as taken", error });
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
      const medicationId = req.query.medicationId
        ? (req.query.medicationId as string)
        : undefined;
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

  app.post(
    "/api/reminders",
    validateBody(insertReminderSchema),
    async (req, res) => {
      try {
        const reminder = await storage.createReminder(req.body);
        res.status(201).json(reminder);
      } catch (error) {
        res.status(500).json({ message: "Error creating reminder", error });
      }
    }
  );

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

  
  const httpServer = createServer(app);
  return httpServer;
}
