import { 
  type User, type InsertUser,
  type Medication, type InsertMedication,
  type Schedule, type InsertSchedule,
  type Reminder, type InsertReminder
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Medication operations
  getMedications(userId?: number): Promise<Medication[]>;
  getMedicationById(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  
  // Schedule operations
  getSchedules(medicationId?: number, date?: Date): Promise<Schedule[]>;
  getScheduleById(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  markScheduleAsTaken(id: number, takenAt?: Date): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  
  // Reminder operations
  getReminders(medicationId?: number): Promise<Reminder[]>;
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medications: Map<number, Medication>;
  private schedules: Map<number, Schedule>;
  private reminders: Map<number, Reminder>;
  
  private userIdCounter: number;
  private medicationIdCounter: number;
  private scheduleIdCounter: number;
  private reminderIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.medications = new Map();
    this.schedules = new Map();
    this.reminders = new Map();
    
    this.userIdCounter = 1;
    this.medicationIdCounter = 1;
    this.scheduleIdCounter = 1;
    this.reminderIdCounter = 1;
    
    // Add some initial data for testing
    this.seedInitialData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Medication operations
  async getMedications(userId?: number): Promise<Medication[]> {
    const medications = Array.from(this.medications.values());
    if (userId) {
      return medications.filter(med => med.userId === userId);
    }
    return medications;
  }
  
  async getMedicationById(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }
  
  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = this.medicationIdCounter++;
    const medication: Medication = { ...insertMedication, id };
    this.medications.set(id, medication);
    return medication;
  }
  
  async updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication = { ...medication, ...data };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }
  
  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }
  
  // Schedule operations
  async getSchedules(medicationId?: number, date?: Date): Promise<Schedule[]> {
    let schedules = Array.from(this.schedules.values());
    
    if (medicationId) {
      schedules = schedules.filter(s => s.medicationId === medicationId);
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      schedules = schedules.filter(s => {
        const scheduleDate = new Date(s.scheduledDate);
        return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
      });
    }
    
    return schedules;
  }
  
  async getScheduleById(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }
  
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const schedule: Schedule = { ...insertSchedule, id };
    this.schedules.set(id, schedule);
    return schedule;
  }
  
  async updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, ...data };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async markScheduleAsTaken(id: number, takenAt: Date = new Date()): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, taken: true, takenAt };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }
  
  // Reminder operations
  async getReminders(medicationId?: number): Promise<Reminder[]> {
    let reminders = Array.from(this.reminders.values());
    
    if (medicationId) {
      reminders = reminders.filter(r => r.medicationId === medicationId);
    }
    
    return reminders;
  }
  
  async getReminderById(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }
  
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderIdCounter++;
    const reminder: Reminder = { ...insertReminder, id };
    this.reminders.set(id, reminder);
    return reminder;
  }
  
  async updateReminder(id: number, data: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...data };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }
  
  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }
  
  // Seed initial data for testing
  private seedInitialData() {
    // Create a test user
    const user: User = {
      id: this.userIdCounter++,
      username: 'testuser',
      password: 'password123'
    };
    this.users.set(user.id, user);
    
    // Create some medications
    const medications: InsertMedication[] = [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        form: 'tablet',
        instructions: 'Take with food',
        frequency: 'once_daily',
        purpose: 'Blood Pressure',
        startDate: new Date('2023-01-01'),
        quantity: 30,
        refills: 2,
        status: 'active',
        userId: user.id
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        form: 'tablet',
        instructions: 'Take with food',
        frequency: 'twice_daily',
        purpose: 'Diabetes',
        startDate: new Date('2023-01-15'),
        quantity: 60,
        refills: 3,
        status: 'active',
        userId: user.id
      },
      {
        name: 'Atorvastatin',
        dosage: '20mg',
        form: 'tablet',
        instructions: 'Take at bedtime',
        frequency: 'once_daily',
        purpose: 'Cholesterol',
        startDate: new Date('2023-02-01'),
        quantity: 30,
        refills: 0,
        status: 'active',
        userId: user.id
      }
    ];
    
    // Add medications and create schedules/reminders for them
    medications.forEach(med => {
      const id = this.medicationIdCounter++;
      const medication: Medication = { ...med, id };
      this.medications.set(id, medication);
      
      // Create schedules for today
      const today = new Date();
      
      if (med.frequency === 'once_daily') {
        const scheduleDate = new Date(today);
        scheduleDate.setHours(8, 0, 0, 0);
        
        const schedule: InsertSchedule = {
          medicationId: id,
          timeOfDay: '08:00',
          taken: scheduleDate < today, // Mark as taken if schedule time is in the past
          scheduledDate: scheduleDate,
          takenAt: scheduleDate < today ? new Date(scheduleDate.getTime() + 5 * 60000) : undefined // 5 minutes after schedule if taken
        };
        
        const scheduleId = this.scheduleIdCounter++;
        this.schedules.set(scheduleId, { ...schedule, id: scheduleId });
        
        // Create reminder
        const reminder: InsertReminder = {
          medicationId: id,
          time: '08:00',
          enabled: true,
          days: '1,2,3,4,5,6,7' // Every day
        };
        
        const reminderId = this.reminderIdCounter++;
        this.reminders.set(reminderId, { ...reminder, id: reminderId });
      } else if (med.frequency === 'twice_daily') {
        // Morning dose
        const morningDate = new Date(today);
        morningDate.setHours(8, 0, 0, 0);
        
        const morningSchedule: InsertSchedule = {
          medicationId: id,
          timeOfDay: '08:00',
          taken: morningDate < today,
          scheduledDate: morningDate,
          takenAt: morningDate < today ? new Date(morningDate.getTime() + 5 * 60000) : undefined
        };
        
        const morningId = this.scheduleIdCounter++;
        this.schedules.set(morningId, { ...morningSchedule, id: morningId });
        
        // Evening dose
        const eveningDate = new Date(today);
        eveningDate.setHours(20, 0, 0, 0);
        
        const eveningSchedule: InsertSchedule = {
          medicationId: id,
          timeOfDay: '20:00',
          taken: eveningDate < today,
          scheduledDate: eveningDate,
          takenAt: eveningDate < today ? new Date(eveningDate.getTime() + 5 * 60000) : undefined
        };
        
        const eveningId = this.scheduleIdCounter++;
        this.schedules.set(eveningId, { ...eveningSchedule, id: eveningId });
        
        // Create reminders
        const morningReminder: InsertReminder = {
          medicationId: id,
          time: '08:00',
          enabled: true,
          days: '1,2,3,4,5,6,7'
        };
        
        const morningReminderId = this.reminderIdCounter++;
        this.reminders.set(morningReminderId, { ...morningReminder, id: morningReminderId });
        
        const eveningReminder: InsertReminder = {
          medicationId: id,
          time: '20:00',
          enabled: true,
          days: '1,2,3,4,5,6,7'
        };
        
        const eveningReminderId = this.reminderIdCounter++;
        this.reminders.set(eveningReminderId, { ...eveningReminder, id: eveningReminderId });
      }
    });
  }
}

export const storage = new MemStorage();
