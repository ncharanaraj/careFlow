import type { Appointment } from "@/types/appointment";
import type { Patient } from "@/types/patients";
import type { Doctor, Department } from "@/types/appointment";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
}

export default function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
  patients,
  doctors,
  departments,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  const patientName =
    patients.find(
      (patient) => String(patient.id) === String(appointment.patientId),
    )?.name ?? "Unknown";

  const doctorName =
    doctors.find((doctor) => String(doctor.id) === String(appointment.doctorId))
      ?.name ?? "Unknown";

  const departmentName =
    departments.find(
      (department) =>
        String(department.id) === String(appointment.departmentId),
    )?.name ?? "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View complete appointment information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Patient</p>
            <p className="font-medium">{patientName}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Department</p>
            <p className="font-medium">{departmentName}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Doctor</p>
            <p className="font-medium">{doctorName}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Appointment Date</p>
            <p className="font-medium">{appointment.appointmentDate}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Time Slot</p>
            <p className="font-medium">{appointment.timeSlot}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Status</p>

            <Badge
              variant={
                appointment.status === "Cancelled" ? "secondary" : "default"
              }
            >
              {appointment.status}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
