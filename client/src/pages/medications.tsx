import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, ArrowDownUp } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MedicationCard } from "@/components/medications/medication-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MedicationForm } from "@/components/medications/medication-form";
import { Medication } from "@shared/schema";

export default function Medications() {
  const isMobile = useMobile();
  const { toast } = useToast();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch medications
  const { data: medications = [], isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
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

  // Filter and sort medications
  const filteredMedications = medications
    .filter(med => {
      // Filter by search query
      const matchesSearch = 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (med.purpose && med.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const matchesStatus = filterStatus === "all" || med.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort based on selected sort option
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "newest") {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else if (sortBy === "refill") {
        return a.quantity - b.quantity;
      }
      return 0;
    });

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
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">My Medications</h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button onClick={() => setShowAddMedication(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </div>
            </div>

            {/* Search and filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search medications..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                      All Medications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                      Active Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                      Inactive Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <ArrowDownUp className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("name")}>
                      Name (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("newest")}>
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("refill")}>
                      Refill Needed First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Medication List */}
            {medicationsLoading ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                Loading medications...
              </div>
            ) : filteredMedications.length === 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
                No medications found. {searchQuery && "Try a different search term."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMedications.map((medication) => (
                  <MedicationCard 
                    key={medication.id} 
                    medication={medication} 
                    onUpdate={handleUpdateMedication}
                  />
                ))}
              </div>
            )}
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
            onSubmit={(data) => addMedicationMutation.mutate(data)} 
            onCancel={() => setShowAddMedication(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
