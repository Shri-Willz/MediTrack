import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  PillIcon,
  CalendarCheck,
  AlertTriangle,
  Plus
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MedicationCard } from "@/components/medications/medication-card";
import { ScheduleTimeline } from "@/components/schedule/schedule-timeline";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MedicationForm } from "@/components/medications/medication-form";
import { Medication, Schedule } from "@shared/schema";

export default function Dashboard() {
  const isMobile = useMobile();
  const { toast } = useToast();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  // Fetch medications
  const { data: medications = [], isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Fetch today's schedule
  const today = new Date().toISOString().split('T')[0];
  const { data: scheduleData = [], isLoading: scheduleLoading } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules', { date: today }],
  });

  // Process schedules to include medication details
  const schedules = scheduleData.map(schedule => {
    const medication = medications.find(med => med.id === schedule.medicationId);
    return {
      ...schedule,
      medication: medication!
    };
  }).filter(schedule => schedule.medication); // Only include schedules with valid medications

  // Mark schedule as taken mutation
  const markAsTakenMutation = useMutation({
    mutationFn: async (scheduleId: number) => {
      return apiRequest('POST', `/api/schedules/${scheduleId}/take`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Medication marked as taken",
        description: "Your medication schedule has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark medication as taken. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add medication mutation
  const addMedicationMutation = useMutation({
    mutationFn: async (newMedication: any) => {
      return apiRequest('POST', '/api/medications', newMedication);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Medication added",
        description: "Your new medication has been added successfully.",
      });
      setShowAddMedication(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update medication mutation
  const updateMedicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Medication> }) => {
      return apiRequest('PATCH', `/api/medications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Medication updated",
        description: "Your medication has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsTaken = (scheduleId: number) => {
    markAsTakenMutation.mutate(scheduleId);
  };

  const handleUpdateMedication = (id: number, data: Partial<Medication>) => {
    updateMedicationMutation.mutate({ id, data });
  };

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
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Dashboard</h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button onClick={() => setShowAddMedication(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <StatCard
                title="Active Medications"
                value={statsLoading ? "Loading..." : stats?.activeMeds || 0}
                icon={PillIcon}
                colorClass="bg-primary-100 text-primary-600"
              />
              <StatCard
                title="Today's Doses"
                value={statsLoading ? "Loading..." : stats?.todayDoses?.completed || 0}
                subtitle={statsLoading ? "" : `/ ${stats?.todayDoses?.total || 0} completed`}
                icon={CalendarCheck}
                colorClass="bg-green-100 text-green-600"
              />
              <StatCard
                title="Refills Needed"
                value={statsLoading ? "Loading..." : stats?.refillsNeeded || 0}
                icon={AlertTriangle}
                colorClass="bg-amber-100 text-amber-600"
              />
            </div>

            {/* Schedule Section */}
            <section className="mb-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Today's Schedule</h3>

              {scheduleLoading ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                  Loading schedules...
                </div>
              ) : (
                <ScheduleTimeline
                  schedules={schedules}
                  onMarkAsTaken={handleMarkAsTaken}
                />
              )}
            </section>

            {/* Medication List */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">My Medications</h3>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                    Sort
                  </Button>
                </div>
              </div>
              {medicationsLoading ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                  Loading medications...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {medications.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onUpdate={handleUpdateMedication}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter the details of your medication below.
            </DialogDescription>
          </DialogHeader>
          <MedicationForm
            onSubmit={(data) => { addMedicationMutation.mutate(data)}}
            onCancel={() => setShowAddMedication(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
