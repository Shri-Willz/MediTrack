import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
  subtitle?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  colorClass = "bg-primary-100 text-primary-600", 
  subtitle 
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                  {subtitle && (
                    <span className="text-sm text-gray-500 ml-1">{subtitle}</span>
                  )}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
}
