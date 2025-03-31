import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Pill, 
  CalendarCheck, 
  Bell, 
  Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/medications", label: "Meds", icon: Pill },
    { href: "/schedule", label: "Schedule", icon: CalendarCheck },
    { href: "/reminders", label: "Reminders", icon: Bell },
    { href: "#", label: "More", icon: Menu },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-3 px-4",
              location === item.href ? "text-primary-600" : "text-gray-600"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
