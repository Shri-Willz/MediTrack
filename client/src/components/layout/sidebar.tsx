import { Link, useLocation } from "wouter";
import {
  PanelLeft,
  LayoutDashboard,
  Pill,
  CalendarCheck,
  Bell,
  FileText,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/medications", label: "My Medications", icon: Pill },
    { href: "/schedule", label: "Schedule", icon: CalendarCheck },
    { href: "/reminders", label: "Reminders", icon: Bell },
    { href: "/reports", label: "Reports", icon: FileText },
  ];

  const bottomNavItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help", icon: HelpCircle },
  ];

  return (
    <aside className={cn("bg-white w-64 border-r border-gray-200 flex flex-col h-full", className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-primary text-white p-1 rounded mr-2">
            <Pill className="h-5 w-5" />
          </div>
          <h1 className="font-bold text-xl text-primary-700">MediTrack</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === item.href
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5",
                location === item.href ? "text-primary-500" : "text-gray-400"
              )}
            />
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <item.icon className="mr-3 h-5 w-5 text-gray-400" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
