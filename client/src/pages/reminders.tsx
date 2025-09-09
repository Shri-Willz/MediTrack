import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Bell, 
  Plus, 
  Clock, 
  Calendar, 
  Save,
  Trash
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Reminder, Medication } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useAuth } from "@clerk/clerk-react";
// import { useNavigate } from "react-router";



// const { isSignedIn } = useAuth()
// const navigate = useNavigate()


// if (!isSignedIn) {
//   navigate("/")
// }  

// Define the form schema for reminders
const reminderFormSchema = z.object({
  medicationId: z.number({
    required_error: "Please select a medication",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  days: z.string({
    required_error: "Please select at least one day",
  }),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export default function Reminders() {
  const isMobile = useMobile();
  const { toast } = useToast();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);

  // Fetch reminders
  const { data: reminders = [], isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: ['/api/reminders'],
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      return apiRequest('POST', '/api/reminders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: "Reminder created",
        description: "Your reminder has been created successfully.",
      });
      setShowAddReminder(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update reminder mutation
  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      return apiRequest('PATCH', `/api/reminders/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: "Reminder updated",
        description: "Your reminder has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/reminders/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: "Reminder deleted",
        description: "Your reminder has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      medicationId: undefined,
      time: "08:00",
      days: "1,2,3,4,5,6,7", // All days selected by default
    },
  });

  // Group reminders by medication
  const remindersByMedication: Record<number, Array<Reminder>> = {};
  reminders.forEach(reminder => {
    if (!remindersByMedication[reminder.medicationId]) {
      remindersByMedication[reminder.medicationId] = [];
    }
    remindersByMedication[reminder.medicationId].push(reminder);
  });

  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${suffix}`;
    } catch (error) {
      return time;
    }
  };

  // Format days from comma-separated string to human-readable format
  const formatDays = (daysString: string) => {
    const days = daysString.split(',').map(Number);
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (days.length === 7) {
      return "Every day";
    } else if (days.length === 5 && days.includes(1) && days.includes(2) && 
               days.includes(3) && days.includes(4) && days.includes(5)) {
      return "Weekdays";
    } else if (days.length === 2 && days.includes(6) && days.includes(7)) {
      return "Weekends";
    } else {
      return days.map(d => daysOfWeek[d % 7]).join(', ');
    }
  };

  const onSubmit = (data: ReminderFormValues) => {
    createReminderMutation.mutate(data);
  };

  const handleToggleReminder = (reminder: Reminder) => {
    updateReminderMutation.mutate({
      id: reminder.id,
      enabled: !reminder.enabled
    });
  };

  const handleDeleteReminder = (id: number) => {
    deleteReminderMutation.mutate(id);
  };
  
  const getDayOptions = () => [
    { value: "1,2,3,4,5,6,7", label: "Every day" },
    { value: "1,2,3,4,5", label: "Weekdays" },
    { value: "6,7", label: "Weekends" },
    { value: "1", label: "Sunday" },
    { value: "2", label: "Monday" },
    { value: "3", label: "Tuesday" },
    { value: "4", label: "Wednesday" },
    { value: "5", label: "Thursday" },
    { value: "6", label: "Friday" },
    { value: "7", label: "Saturday" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar className="hidden md:flex" />
      )}

      {/* Mobile Sidebar (shown when toggled) */}
      {isMobile && showSidebar && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowSidebar(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setShowSidebar(!showSidebar)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-16 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Medication Reminders</h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button onClick={() => setShowAddReminder(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </Button>
              </div>
            </div>

            {/* Reminders List */}
            {remindersLoading ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                Loading reminders...
              </div>
            ) : Object.keys(remindersByMedication).length === 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                No reminders set up. Click "Add Reminder" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(remindersByMedication).map(([medicationId, medicationReminders]) => {
                  const medication = medications.find(m => m.id === parseInt(medicationId));
                  if (!medication) return null;
                  
                  return (
                    <Card key={medicationId} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium flex items-center justify-between">
                          <div className="flex items-center">
                            <Bell className="h-5 w-5 mr-2 text-primary" />
                            {medication.name}
                          </div>
                          <Badge className="ml-2" variant="outline">
                            {medicationReminders.length} {medicationReminders.length === 1 ? 'reminder' : 'reminders'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {medicationReminders.map((reminder, index) => (
                          <div key={reminder.id}>
                            {index > 0 && <Separator className="my-3" />}
                            <div className="flex items-center justify-between py-2">
                              <div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="font-medium">{formatTime(reminder.time)}</span>
                                </div>
                                <div className="mt-1 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-sm text-gray-600">{formatDays(reminder.days)}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={reminder.enabled} 
                                  onCheckedChange={() => handleToggleReminder(reminder)} 
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
            <DialogDescription>
              Set up a reminder for your medication.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="medicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medications.map((med) => (
                          <SelectItem key={med.id} value={med.id.toString()}>
                            {med.name} ({med.dosage})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Select the time when you want to be reminded
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getDayOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose which days this reminder should be active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddReminder(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Reminder
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
