import { useState } from "react";
import { Menu, Search, Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const isMobile = useMobile();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {isMobile && (
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 flex justify-center md:justify-end">
          <div className="w-full max-w-lg lg:max-w-xs relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="search"
              placeholder="Search for medications..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="ml-2 flex items-center md:ml-6">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="ml-3 relative">
            <div className="h-8 w-13 flex  text-gray-400 hover:text-gray-500">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
