import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Patient } from "@/types/patients";

interface PatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export default function PatientDetailsDialog({
  open,
  onOpenChange,
  patient,
}: PatientDetailsDialogProps) {
  if (!patient) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription>View the patient's information.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="mt-1 font-medium text-slate-900">{patient.name}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Age</p>
            <p className="mt-1 font-medium text-slate-900">{patient.age}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Gender</p>
            <p className="mt-1 font-medium text-slate-900">{patient.gender}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Phone</p>
            <p className="mt-1 font-medium text-slate-900">{patient.phone}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Blood Group</p>
            <p className="mt-1 font-medium text-slate-900">
              {patient.bloodGroup}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-1 font-medium text-slate-900">{patient.status}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
