import { useState } from "react";
import { Pill, Eye, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MedicationForm } from "./medication-form";
import { Medication } from "@shared/schema";

interface MedicationCardProps {
  medication: Medication;
  onUpdate: (id: number, data: Partial<Medication>) => void;
}

export function MedicationCard({ medication, onUpdate }: MedicationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Format frequency for display
  const formatFrequency = (frequency: string) => {
    return frequency.replace(/_/g, ' ');
  };
  
  // Check if refill is needed
  const needsRefill = medication.quantity < 10;
  
  // Format refill date or message
  const formattedRefillDate = needsRefill 
    ? "Refill Now" 
    : medication.endDate 
      ? format(new Date(medication.endDate), "MMM d, yyyy") 
      : "Not set";
  
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <Pill className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">{medication.name}</h3>
                <p className="text-sm text-gray-500">{medication.purpose}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
              Active
            </Badge>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</h4>
              <p className="mt-1 text-sm text-gray-900">{medication.dosage}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</h4>
              <p className="mt-1 text-sm text-gray-900">{formatFrequency(medication.frequency)}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</h4>
              <p className="mt-1 text-sm text-gray-900">{medication.quantity} pills</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Refill Date</h4>
              <p className={cn(
                "mt-1 text-sm",
                needsRefill ? "font-medium text-red-600" : "text-gray-900"
              )}>
                {formattedRefillDate}
              </p>
            </div>
          </div>
          
          <div className="mt-5 flex space-x-2">
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="text-primary-700 bg-primary-100 hover:bg-primary-200">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{medication.name}</DialogTitle>
                  <DialogDescription>{medication.purpose}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Dosage</h4>
                      <p className="text-sm text-gray-500">{medication.dosage}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Form</h4>
                      <p className="text-sm text-gray-500">{medication.form}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Frequency</h4>
                      <p className="text-sm text-gray-500">{formatFrequency(medication.frequency)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Instructions</h4>
                      <p className="text-sm text-gray-500">{medication.instructions || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Started</h4>
                      <p className="text-sm text-gray-500">
                        {format(new Date(medication.startDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">End Date</h4>
                      <p className="text-sm text-gray-500">
                        {medication.endDate 
                          ? format(new Date(medication.endDate), "MMM d, yyyy") 
                          : "Ongoing"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Remaining</h4>
                      <p className="text-sm text-gray-500">{medication.quantity} pills</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Refills Left</h4>
                      <p className="text-sm text-gray-500">{medication.refills}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-700 bg-gray-100 hover:bg-gray-200">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Medication</DialogTitle>
                  <DialogDescription>
                    Make changes to your medication details here.
                  </DialogDescription>
                </DialogHeader>
                <MedicationForm 
                  defaultValues={medication} 
                  onSubmit={(data) => {
                    onUpdate(medication.id, data);
                    setShowEditForm(false);
                  }} 
                  onCancel={() => setShowEditForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
