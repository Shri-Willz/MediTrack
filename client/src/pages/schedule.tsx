import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ScheduleTimeline } from "@/components/schedule/schedule-timeline";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { Schedule, Medication } from "@shared/schema";

export default function SchedulePage() {
  const isMobile = useMobile();
  const { toast } = useToast();
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch medications
  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Fetch schedules for selected date
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const { data: scheduleData = [], isLoading: scheduleLoading } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules', { date: formattedDate }],
  });

  // Process schedules to include medication details
  const schedules = scheduleData.map(schedule => {
    const medication = medications.find(med => med.id === schedule.medicationId);
    return {
      ...schedule,
      medication: medication!
    };
  }).filter(schedule => schedule.medication); // Only include schedules with valid medications

  // Sort schedules by time
  const sortedSchedules = [...schedules].sort((a, b) => {
    return a.timeOfDay.localeCompare(b.timeOfDay);
  });

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

  const handleMarkAsTaken = (scheduleId: number) => {
    markAsTakenMutation.mutate(scheduleId);
  };

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const isToday = isSameDay(selectedDate, new Date());

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
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Medication Schedule</h2>
              </div>
            </div>

            {/* Date Selector */}
            <div className="mb-6 flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={"w-[280px] justify-start text-left font-normal"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      {isToday && <span className="ml-2 text-primary font-medium">(Today)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Schedule Timeline */}
            <div className="mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-500" />
                {isToday ? "Today's Schedule" : "Schedule for " + format(selectedDate, "MMMM d")}
              </h3>
              
              {scheduleLoading ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                  Loading schedules...
                </div>
              ) : (
                <ScheduleTimeline 
                  schedules={sortedSchedules} 
                  onMarkAsTaken={handleMarkAsTaken} 
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}
