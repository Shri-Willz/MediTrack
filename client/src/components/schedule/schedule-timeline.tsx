import { CheckCircle2, Clock, PillIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Schedule, Medication } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface ScheduleTimelineProps {
  schedules: Array<Schedule & { medication: Medication }>;
  onMarkAsTaken: (scheduleId: number) => void;
}

export function ScheduleTimeline({ schedules, onMarkAsTaken }: ScheduleTimelineProps) {
  const formatTimeOfDay = (timeOfDay: string) => {
    try {
      // Parse the time in 24-hour format (HH:MM)
      const [hours, minutes] = timeOfDay.split(':').map(Number);
      
      // Create a Date object for today with the specific time
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      // Format as AM/PM time
      return format(date, "h:mm a");
    } catch (error) {
      return timeOfDay;
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {schedules.length === 0 ? (
          <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
            No scheduled doses for today.
          </li>
        ) : (
          schedules.map((schedule) => (
            <li key={schedule.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                          <PillIcon className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {schedule.medication.name}
                          </p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{schedule.medication.dosage}</span>
                            <span className="mx-1">•</span>
                            <span>{schedule.medication.instructions || "No specific instructions"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      {schedule.taken ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Taken
                        </Badge>
                      ) : (
                        <div className="flex flex-col items-end sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                            <Clock className="h-3 w-3 mr-1" />
                            Upcoming
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => onMarkAsTaken(schedule.id)}
                          >
                            Mark as taken
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {formatTimeOfDay(schedule.timeOfDay)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
